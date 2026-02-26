#!/bin/bash
set -e

echo "Pulling latest code..."
git pull origin develop

echo "Building and starting containers..."
docker compose down
docker compose up -d --build

echo "Waiting for services to start..."
sleep 10

echo "Service status:"
docker compose ps

echo "Deployment complete!"
