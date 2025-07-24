# Docker Setup for Sporterra

This guide explains how to run the Sporterra API with PostgreSQL using Docker.

## Prerequisites

- Docker
- Docker Compose

## Quick Start

### 1. Start all services

```bash
# Start PostgreSQL and API server
docker-compose up -d

# View logs
docker-compose logs -f
```

### 2. Access the services

- **API Server**: http://localhost:3001
- **PostgreSQL**: localhost:5432
  - Database: `sporterra`
  - Username: `sporterra`
  - Password: `sporterra123`

### 3. Health check

```bash
curl http://localhost:3001/health
```

## Development

### Start only PostgreSQL

```bash
# Start only the database
docker-compose up -d postgres

# Run API locally with tsx
cd apps/api
pnpm dev
```

### Rebuild API container

```bash
# Rebuild and restart API
docker-compose up -d --build api
```

## Database Management

### Connect to PostgreSQL

```bash
# Using docker exec
docker exec -it sporterra-postgres psql -U sporterra -d sporterra

# Using psql client
psql -h localhost -p 5432 -U sporterra -d sporterra
```

### Reset database

```bash
# Stop and remove containers with volumes
docker-compose down -v

# Start fresh
docker-compose up -d
```

## Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=postgresql://sporterra:sporterra123@localhost:5432/sporterra

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# API
PORT=3001
NODE_ENV=development
```

## Production Deployment

For production, update the environment variables and use proper secrets management:

```bash
# Build production image
docker build -t sporterra-api:latest ./apps/api

# Run with production environment
docker run -d \
  --name sporterra-api \
  -p 3001:3001 \
  -e NODE_ENV=production \
  -e DATABASE_URL=your-production-db-url \
  -e JWT_SECRET=your-production-secret \
  sporterra-api:latest
```

## Troubleshooting

### Check container status

```bash
docker-compose ps
```

### View logs

```bash
# All services
docker-compose logs

# Specific service
docker-compose logs api
docker-compose logs postgres
```

### Reset everything

```bash
# Stop and remove everything
docker-compose down -v --remove-orphans

# Remove images
docker rmi sporterra-api

# Start fresh
docker-compose up -d --build
``` 