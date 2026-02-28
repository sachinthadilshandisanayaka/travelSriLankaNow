# Docker Deployment Guide

This guide explains how to deploy the Travel Sri Lanka Now application using Docker.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) (v20.10+)
- [Docker Compose](https://docs.docker.com/compose/install/) (v2.0+)

## Architecture

The application consists of three services:

| Service | Description | Port |
|---------|-------------|------|
| **postgres** | PostgreSQL 15 database | 5432 |
| **backend** | Spring Boot API (Java 17) | 8080 |
| **frontend** | Angular app served via Nginx | 4200 |

## Quick Start

### 1. Build and Start All Services

```bash
docker-compose up --build -d
```

This command will:
- Build the backend Docker image (Maven + Java 17)
- Build the frontend Docker image (Node + Nginx)
- Pull PostgreSQL image
- Start all containers in the correct order

### 2. View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### 3. Access the Application

| URL | Description |
|-----|-------------|
| http://localhost:4200 | Frontend (Angular) |
| http://localhost:4200/api | API via Nginx proxy |

## Common Commands

### Start Services (no code changes)
```bash
docker-compose up -d
```

### Start Services After Code Changes
```bash
# Rebuild all services
docker-compose up --build -d

# Rebuild only the service you changed (faster)
docker-compose up --build -d frontend    # Frontend code changed
docker-compose up --build -d backend     # Backend code changed
```

> **Note:** Use `--build` only when you changed source code. Without it, Docker reuses existing images which is faster.

### Stop Services
```bash
docker-compose down
```

### Stop and Remove Volumes (Reset Database)
```bash
docker-compose down -v
```

### View Running Containers
```bash
docker-compose ps
```

### Access Container Shell
```bash
# Backend
docker exec -it travel-srilanka-backend sh

# Frontend
docker exec -it travel-srilanka-frontend sh

# Database
docker exec -it travel-srilanka-db psql -U postgres -d travel_srilanka_db
```

## Environment Variables

### Production Configuration

For production deployment, create a `.env` file in the project root:

```env
# JWT Configuration
JWT_SECRET=your-secure-jwt-secret-key-base64-encoded

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Database (optional - defaults provided)
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-secure-password
```

### Using Custom Environment File

```bash
docker-compose --env-file .env.production up -d
```

## Health Checks

All services include health checks:

- **PostgreSQL**: `pg_isready` command
- **Backend**: HTTP check on `/api/locations`
- **Frontend**: HTTP check on `/`

View health status:
```bash
docker-compose ps
```

## Troubleshooting

### Backend won't start
```bash
# Check logs
docker-compose logs backend

# Verify database is healthy
docker-compose ps postgres
```

### Frontend can't connect to backend
```bash
# Verify backend is healthy
docker-compose ps backend

# Check nginx config
docker exec -it travel-srilanka-frontend cat /etc/nginx/conf.d/nginx.conf
```

### Database connection issues
```bash
# Check if database is running
docker-compose ps postgres

# Connect to database manually
docker exec -it travel-srilanka-db psql -U postgres -d travel_srilanka_db

# View database logs
docker-compose logs postgres
```

### Reset Everything
```bash
# Stop all containers and remove volumes
docker-compose down -v

# Remove all images
docker-compose down --rmi all

# Start fresh
docker-compose up --build -d
```

## Production Considerations

1. **Change default passwords** in `.env` file
2. **Use a reverse proxy** (Traefik, Nginx) for SSL/TLS
3. **Configure proper logging** and log rotation
4. **Set up backups** for PostgreSQL data volume
5. **Use Docker secrets** for sensitive data
6. **Configure resource limits** in docker-compose.yml

### Example with Resource Limits

```yaml
backend:
  deploy:
    resources:
      limits:
        cpus: '1'
        memory: 1G
      reservations:
        cpus: '0.5'
        memory: 512M
```

## Useful Scripts

### backup-db.sh
```bash
#!/bin/bash
docker exec travel-srilanka-db pg_dump -U postgres travel_srilanka_db > backup_$(date +%Y%m%d_%H%M%S).sql
```

### restore-db.sh
```bash
#!/bin/bash
cat $1 | docker exec -i travel-srilanka-db psql -U postgres -d travel_srilanka_db
```
