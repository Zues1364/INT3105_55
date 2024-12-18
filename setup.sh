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
# Set vm.overcommit_memory
echo "Configuring Redis..."
echo "vm.overcommit_memory=1" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
redis-server --daemonize yes
redis-cli ping

# 3. Install MongoDB
echo "Installing MongoDB..."
sudo mkdir -p /var/lib/mongodb /var/log/mongodb
sudo chown -R mongodb:mongodb /var/lib/mongodb /var/log/mongodb
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

        balancer_by_lua_block {
            local balancer = require("ngx.balancer")
            local servers = { "localhost:3001", "localhost:3002" }
            local index = math.random(#servers)
            local server = servers[index]
            ngx.ctx.upstream = server
            balancer.set_current_peer(server)
        }
    }

    upstream url_retrieval {
        server localhost:4001;
        server localhost:4002;

        balancer_by_lua_block {
            local balancer = require("ngx.balancer")
            local servers = { "localhost:4001", "localhost:4002" }
            local index = math.random(#servers)
            local server = servers[index]
            ngx.ctx.upstream = server
            balancer.set_current_peer(server)
        }
    }

    server {
        listen 80;

        location /shorten {
            proxy_pass http://url_shortener;
            log_by_lua_block {
                local count_dict = ngx.shared.request_count
                local instance = ngx.ctx.upstream
                if instance then
                    count_dict:incr(instance, 1, 0)
                end
            }
        }

        location /retrieve {
            proxy_pass http://url_retrieval;
            log_by_lua_block {
                local count_dict = ngx.shared.request_count
                local instance = ngx.ctx.upstream
                if instance then
                    count_dict:incr(instance, 1, 0)
                end
            }
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

# Validate OpenResty configuration and start
sudo /usr/local/openresty/bin/openresty -t
sudo /usr/local/openresty/bin/openresty -s reload
echo "OpenResty configured successfully."

# 6. Install npm dependencies
echo "Installing npm dependencies..."
npm install --prefix "$COMMON"
npm install --prefix "$SHORTENER_SERVICE"
npm install --prefix "$RETRIEVAL_SERVICE"
npm install --prefix "$API_GATEWAY"
echo "npm dependencies installed successfully."

# 7. Create logs directories
sudo mkdir -p "$API_GATEWAY/logs"
sudo mkdir -p "$SHORTENER_SERVICE/logs"
sudo mkdir -p "$RETRIEVAL_SERVICE/logs"

# 8. Create a setup completion file
touch "$SETUP_FILE"
echo "Setup completed successfully."