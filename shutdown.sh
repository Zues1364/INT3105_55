#!/bin/bash

echo "Stopping all services..."

# Find and kill all Node.js processes
NODE_PROCESSES=$(ps aux | grep node | grep -v grep | awk '{print $2}')
if [ -z "$NODE_PROCESSES" ]; then
    echo "No Node.js services are currently running."
else
    echo "Stopping Node.js processes: $NODE_PROCESSES"
    kill -9 $NODE_PROCESSES
    echo "All Node.js services have been stopped."
fi

# Optional: Check if any services are still running
echo "Verifying services..."
ps aux | grep node | grep -v grep

echo "All services stopped successfully."
