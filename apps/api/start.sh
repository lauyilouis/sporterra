#!/bin/sh

# Wait for database to be ready
echo "Waiting for database to be ready..."
sleep 5

# Run migrations
echo "Running database migrations..."
node dist/db/migrate.js

# Start the application
echo "Starting API server..."
node dist/index.js 