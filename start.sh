#!/bin/bash

# Start Flask backend on port 5001
python main.py &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start Vite frontend on port 5000 proxying to backend
cd client && npm run dev -- --port 5000 &
FRONTEND_PID=$!

# Handle shutdown
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null" EXIT

# Wait for both processes
wait
