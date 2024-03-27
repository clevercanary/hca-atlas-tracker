#!/bin/bash

# Exit script in case of error
set -e

echo "Running database migrations..."
npm run migrate

echo "Starting application with pm2-runtime..."
exec pm2-runtime start npm -- start