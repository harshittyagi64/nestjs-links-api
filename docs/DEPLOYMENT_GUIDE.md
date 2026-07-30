# Links API — Deployment, Operations & Environment Guide

## 1. System Requirements & Environment Setup

### 1.1 Prerequisites
* **Runtime**: Node.js (v18.x or v20.x LTS)
* **Package Manager**: `npm` (v9.x+)
* **Containerization**: Docker Engine (v24.x+) and Docker Compose (v2.x+)
* **In-Memory Cache**: Redis (v7.x Alpine)

---

## 2. Environment Variables Reference

Create a `.env` file in the root directory based on `.env.example`:

| Variable Name | Type | Default Value | Description |
| :--- | :---: | :--- | :--- |
| `PORT` | Number | `3000` | HTTP application listening port. |
| `NODE_ENV` | String | `development` | Application mode (`development`, `production`, `test`). |
| `REDIS_HOST` | String | `localhost` | Hostname/IP address of the Redis instance. |
| `REDIS_PORT` | Number | `6379` | TCP port for the Redis connection. |
| `REDIS_TTL_SECONDS` | Number | `3600` | Default expiration time (in seconds) for redirect target cache. |
| `THROTTLE_TTL` | Number | `60` | Sliding window rate limit time window in seconds. |
| `THROTTLE_LIMIT` | Number | `100` | Maximum requests allowed per IP/API key per sliding window. |

---

## 3. Docker Containerization & Topology

### 3.1 Docker Compose Configuration (`docker-compose.yml`)

The application stack uses containerized Redis for high-performance caching alongside the NestJS API engine:

```yaml
version: '3.8'

services:
  # NestJS Links API Engine
  api:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "${PORT:-3000}:3000"
    environment:
      NODE_ENV: production
      PORT: 3000
      REDIS_HOST: redis
      REDIS_PORT: 6379
    depends_on:
      redis:
        condition: service_healthy
    restart: always

  # Redis Cache Engine
  redis:
    image: redis:7-alpine
    container_name: links_redis_cache
    ports:
      - "6379:6379"
    command: redis-server --save 60 1 --loglevel notice
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5

volumes:
  redis_data:
3.2 Production Dockerfile (Dockerfile)
Dockerfile
# Multi-stage Docker build for optimized container image size
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/main"]
## 4. Operational Runbook

### 4.1 Development Startup Procedure

```powershell
docker compose up -d redis
npm install
npm run start:dev