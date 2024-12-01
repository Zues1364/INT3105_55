#!/bin/bash

echo "Checking system status..."

# Function to check if a specific service is running on a port
check_service() {
    local port=$1
    local name=$2
    curl -s -o /dev/null -w "%{http_code}" http://localhost:$port > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "$name service on port $port is running."
    else
        echo "$name service on port $port is NOT running."
    fi
}

# Check Node.js services
echo "Checking Node.js services..."
declare -A SERVICES
SERVICES["url-shortener-service 3001"]="3001"
SERVICES["url-shortener-service 3002"]="3002"
SERVICES["url-retrieval-service 4001"]="4001"
SERVICES["url-retrieval-service 4002"]="4002"
SERVICES["api-gateway 3000"]="3000"

for service in "${!SERVICES[@]}"; do
    check_service "${SERVICES[$service]}" "$service"
done

# Check Redis Server
echo "Checking Redis server..."
REDIS_STATUS=$(redis-cli ping 2>/dev/null)
if [ "$REDIS_STATUS" == "PONG" ]; then
    echo "Redis server is running."
else
    echo "Redis server is NOT running."
fi

# Check MongoDB Server
echo "Checking MongoDB server..."
MONGO_STATUS=$(mongosh --eval "db.runCommand({ connectionStatus: 1 }).ok" --quiet 2>/dev/null)
if [ "$MONGO_STATUS" == "1" ]; then
    echo "MongoDB server is running."
else
    echo "MongoDB server is NOT running or connection failed."
fi

# Check OpenResty (NGINX)
echo "Checking OpenResty (NGINX)..."
NGINX_STATUS=$(sudo /usr/local/openresty/bin/openresty -t 2>&1)
if echo "$NGINX_STATUS" | grep -q "syntax is ok"; then
    echo "OpenResty (NGINX) configuration is valid and the service is running."
else
    echo "OpenResty (NGINX) is NOT running or has configuration issues."
    echo "$NGINX_STATUS"
fi

# Check Logs for Node.js Services
echo "Checking logs for Node.js services..."
LOG_DIR=~/url_shorten_project
LOG_FILES=("$LOG_DIR/services/url-shortener-service/logs/3001.log" \
           "$LOG_DIR/services/url-shortener-service/logs/3002.log" \
           "$LOG_DIR/services/url-retrieval-service/logs/4001.log" \
           "$LOG_DIR/services/url-retrieval-service/logs/4002.log" \
           "$LOG_DIR/api-gateway/logs/gateway.log")

for log_file in "${LOG_FILES[@]}"; do
    if [ -f "$log_file" ]; then
        echo "Recent logs from $log_file:"
        tail -n 5 "$log_file"
    else
        echo "Log file $log_file does not exist."
    fi
done

echo "System status check completed."
