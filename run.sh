#!/bin/bash

SETUP_FILE=~/.url_shorten_setup_complete

# Check if the setup has been run
if [ ! -f "$SETUP_FILE" ]; then
    echo "Error: Setup has not been run. Please execute './setup.sh' first."
    exit 1
fi

echo "Checking system dependencies..."

# Check if Redis is running
if pgrep -x "redis-server" > /dev/null 2>&1; then
    echo "Redis is already running."
else
    echo "Starting Redis..."
    redis-server --daemonize yes
    if pgrep -x "redis-server" > /dev/null 2>&1; then
        echo "Redis started successfully."
    else
        echo "Failed to start Redis."
        exit 1
    fi
fi

# Check if MongoDB is running
if pgrep -x "mongod" > /dev/null 2>&1; then
    echo "MongoDB is already running."
else
    echo "Starting MongoDB..."
    mongod --dbpath /var/lib/mongodb --logpath /var/log/mongodb/mongod.log --fork
    if pgrep -x "mongod" > /dev/null 2>&1; then
        echo "MongoDB started successfully."
    else
        echo "Failed to start MongoDB."
        exit 1
    fi
fi

# Check if OpenResty (NGINX) is running
if is_running_nginx; then
    echo "Stopping existing OpenResty (NGINX)..."
    sudo /usr/local/openresty/bin/openresty -s stop
fi

echo "Starting OpenResty (NGINX)..."
sudo /usr/local/openresty/bin/openresty
if is_running_nginx; then
    echo "OpenResty (NGINX) started successfully."
else
    echo "Failed to start OpenResty (NGINX)."
    exit 1
fi

# Start Node.js services
echo "Starting Node.js services..."

PROJECT_DIR=~/url_shorten_project
SHORTENER_SERVICE="$PROJECT_DIR/services/url-shortener-service"
RETRIEVAL_SERVICE="$PROJECT_DIR/services/url-retrieval-service"
API_GATEWAY="$PROJECT_DIR/api-gateway"

PORT=3001 nohup node "$SHORTENER_SERVICE/server.js" > "$SHORTENER_SERVICE/logs/3001.log" 2>&1 &
echo "Started url-shortener-service on port 3001."
PORT=3002 nohup node "$SHORTENER_SERVICE/server.js" > "$SHORTENER_SERVICE/logs/3002.log" 2>&1 &
echo "Started url-shortener-service on port 3002."

PORT=4001 nohup node "$RETRIEVAL_SERVICE/server.js" > "$RETRIEVAL_SERVICE/logs/4001.log" 2>&1 &
echo "Started url-retrieval-service on port 4001."
PORT=4002 nohup node "$RETRIEVAL_SERVICE/server.js" > "$RETRIEVAL_SERVICE/logs/4002.log" 2>&1 &
echo "Started url-retrieval-service on port 4002."

PORT=3000 nohup node "$API_GATEWAY/server.js" > "$API_GATEWAY/logs/gateway.log" 2>&1 &
echo "Started api-gateway on port 3000."

echo "All services started successfully."
ps aux | grep node
