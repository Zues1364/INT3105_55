#!/bin/bash

SETUP_FILE=~/.url_shorten_setup_complete

# Check if the setup has been run
if [ ! -f "$SETUP_FILE" ]; then
    echo "Error: Setup has not been run. Please execute './setup.sh' first."
    exit 1
fi

echo "Starting services..."

# Define project directories
PROJECT_DIR=~/url_shorten_project
SHORTENER_SERVICE="$PROJECT_DIR/services/url-shortener-service"
RETRIEVAL_SERVICE="$PROJECT_DIR/services/url-retrieval-service"
API_GATEWAY="$PROJECT_DIR/api-gateway"

# Start url-shortener-service instances
nohup node "$SHORTENER_SERVICE/server.js" --PORT=3001 > "$SHORTENER_SERVICE/logs/3001.log" 2>&1 &
echo "Started url-shortener-service on port 3001."
nohup node "$SHORTENER_SERVICE/server.js" --PORT=3002 > "$SHORTENER_SERVICE/logs/3002.log" 2>&1 &
echo "Started url-shortener-service on port 3002."

# Start url-retrieval-service instances
nohup node "$RETRIEVAL_SERVICE/server.js" --PORT=4001 > "$RETRIEVAL_SERVICE/logs/4001.log" 2>&1 &
echo "Started url-retrieval-service on port 4001."
nohup node "$RETRIEVAL_SERVICE/server.js" --PORT=4002 > "$RETRIEVAL_SERVICE/logs/4002.log" 2>&1 &
echo "Started url-retrieval-service on port 4002."

# Start api-gateway
nohup node "$API_GATEWAY/server.js" --PORT=3000 > "$API_GATEWAY/logs/gateway.log" 2>&1 &
echo "Started api-gateway on port 3000."

# Confirm all services are running
echo "All services started successfully."
ps aux | grep node
