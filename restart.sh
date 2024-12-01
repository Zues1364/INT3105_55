#!/bin/bash

echo "Restarting all services..."

# Retry Wrapper
retry_command() {
    local command="$1"
    local retries=3
    local count=0

    until $command; do
        count=$((count + 1))
        if [ $count -eq $retries ]; then
            echo "Command failed after $retries attempts: $command"
            return 1
        fi
        echo "Retrying ($count/$retries)..."
        sleep 2
    done
}

# Restart Redis
restart_redis() {
    echo "Restarting Redis..."
    pkill -x redis-server > /dev/null 2>&1
    retry_command "redis-server --daemonize yes"
    if pgrep -x "redis-server" > /dev/null 2>&1; then
        echo "Redis restarted successfully."
    else
        echo "Failed to restart Redis."
        exit 1
    fi
}

# Restart MongoDB
restart_mongodb() {
    echo "Restarting MongoDB..."
    pkill -x mongod > /dev/null 2>&1
    sudo rm -f /var/lib/mongodb/mongod.lock
    sudo mkdir -p /var/lib/mongodb
    sudo chown -R mongodb:mongodb /var/lib/mongodb
    retry_command "mongod --dbpath /var/lib/mongodb --logpath /var/log/mongodb/mongod.log --fork"
    if pgrep -x mongod > /dev/null 2>&1; then
        echo "MongoDB restarted successfully."
    else
        echo "Failed to restart MongoDB."
        exit 1
    fi
}

# Restart OpenResty
restart_openresty() {
    echo "Restarting OpenResty (NGINX)..."

    # Check if OpenResty is already running
    if pgrep -x "nginx" > /dev/null 2>&1; then
        echo "Stopping existing OpenResty process..."
        sudo /usr/local/openresty/bin/openresty -s stop
        sleep 2
    fi

    # Ensure port 80 is free
    if sudo lsof -i :80 > /dev/null 2>&1; then
        echo "Port 80 is still in use. Attempting to free it..."
        sudo kill -9 $(sudo lsof -t -i :80)
        sleep 2
        if sudo lsof -i :80 > /dev/null 2>&1; then
            echo "Failed to free port 80. Please check for conflicting processes."
            return 1
        fi
    fi

    # Start OpenResty with retry logic
    for attempt in {1..3}; do
        echo "Attempting to start OpenResty (attempt $attempt/3)..."
        sudo /usr/local/openresty/bin/openresty

        # Validate if OpenResty started successfully
        if (sudo /usr/local/openresty/bin/openresty -t 2>&1); then
            echo "OpenResty (NGINX) restarted successfully."
            return 0
        fi

        echo "OpenResty failed to start. Retrying..."
        sleep 2
    done

    echo "Failed to restart OpenResty (NGINX) after 3 attempts. Check logs for details."
    sudo cat /usr/local/openresty/nginx/logs/error.log
    return 1
}




# Restart Node.js Services
start_node_services() {
    echo "Starting Node.js services..."
    PROJECT_DIR=~/url_shorten_project
    SHORTENER_SERVICE="$PROJECT_DIR/services/url-shortener-service"
    RETRIEVAL_SERVICE="$PROJECT_DIR/services/url-retrieval-service"
    API_GATEWAY="$PROJECT_DIR/api-gateway"

    PORT=3001 nohup node "$SHORTENER_SERVICE/server.js" > "$SHORTENER_SERVICE/logs/3001.log" 2>&1 &
    PORT=3002 nohup node "$SHORTENER_SERVICE/server.js" > "$SHORTENER_SERVICE/logs/3002.log" 2>&1 &
    PORT=4001 nohup node "$RETRIEVAL_SERVICE/server.js" > "$RETRIEVAL_SERVICE/logs/4001.log" 2>&1 &
    PORT=4002 nohup node "$RETRIEVAL_SERVICE/server.js" > "$RETRIEVAL_SERVICE/logs/4002.log" 2>&1 &
    PORT=3000 nohup node "$API_GATEWAY/server.js" > "$API_GATEWAY/logs/gateway.log" 2>&1 &
}

# Restart All Services
restart_redis
restart_mongodb
restart_openresty
start_node_services

echo "All services restarted successfully."

