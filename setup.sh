#!/bin/bash

SETUP_FILE=~/.url_shorten_setup_complete

# Check if the setup is already completed
if [ -f "$SETUP_FILE" ]; then
    echo "Setup has already been completed."
    exit 0
fi

echo "Starting setup..."

# Define project directories
PROJECT_DIR=~/url_shorten_project
COMMON="$PROJECT_DIR/services/common"
SHORTENER_SERVICE="$PROJECT_DIR/services/url-shortener-service"
RETRIEVAL_SERVICE="$PROJECT_DIR/services/url-retrieval-service"
API_GATEWAY="$PROJECT_DIR/api-gateway"

# 1. Install Node.js
echo "Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
node -v
npm -v

# 2. Install Redis
echo "Installing Redis..."
sudo apt update
sudo apt install -y redis-server
redis-server --daemonize yes
redis-cli ping

# 3. Install MongoDB
echo "Installing MongoDB..."
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org
mongod --dbpath /var/lib/mongodb --logpath /var/log/mongodb/mongod.log --fork
mongo --eval "db.runCommand({ connectionStatus: 1 })"

# 4. Install OpenResty (NGINX with Lua)
echo "Installing OpenResty..."
sudo apt update
sudo apt install -y software-properties-common
sudo add-apt-repository -y "ppa:openresty/ppa"
sudo apt update
sudo apt install -y openresty
sudo /usr/local/openresty/bin/openresty -s stop
sudo /usr/local/openresty/bin/openresty

# 5. Configure OpenResty (NGINX)
echo "Configuring OpenResty..."
cat <<EOF | sudo tee /usr/local/openresty/nginx/conf/nginx.conf
worker_processes auto;

events {
    worker_connections 1024;
}

http {
    lua_shared_dict request_count 10m;

    upstream url_shortener {
        server localhost:3001;
        server localhost:3002;
    }

    upstream url_retrieval {
        server localhost:4001;
        server localhost:4002;
    }

    server {
        listen 80;

        location /shorten {
            proxy_pass http://url_shortener;
            header_filter_by_lua_block {
                local count_dict = ngx.shared.request_count
                local instance = ngx.var.upstream_addr
                count_dict:incr(instance, 1, 0)
            }
            error_log /var/log/nginx/upstream_debug.log debug;
        }

        location /retrieve {
            proxy_pass http://url_retrieval;
            header_filter_by_lua_block {
                local count_dict = ngx.shared.request_count
                local instance = ngx.var.upstream_addr
                count_dict:incr(instance, 1, 0)
            }
            error_log /var/log/nginx/upstream_debug.log debug;
        }

        location /status {
            allow 127.0.0.1;
            allow ::1;
            deny all;

            content_by_lua_block {
                local count_dict = ngx.shared.request_count

                ngx.say("url-shortener")
                for _, instance in ipairs({"localhost:3001", "localhost:3002"}) do
                    local count = count_dict:get(instance) or 0
                    ngx.say("Instance: ", instance, " - Requests: ", count)
                end

                ngx.say("\nurl-retrieval")
                for _, instance in ipairs({"localhost:4001", "localhost:4002"}) do
                    local count = count_dict:get(instance) or 0
                    ngx.say("Instance: ", instance, " - Requests: ", count)
                end
            }
        }
    }
}
EOF

sudo /usr/local/openresty/bin/openresty -t
sudo /usr/local/openresty/bin/openresty -s reload
echo "OpenResty configured successfully."

# Create logs directories
sudo mkdir $API_GATEWAY/logs
sudo mkdir $SHORTENER_SERVICE/logs
sudo mkdir $RETRIEVAL_SERVICE/logs

# Create a setup completion file
touch "$SETUP_FILE"
echo "Setup completed successfully."
