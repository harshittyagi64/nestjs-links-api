# Service Overview - NestJS Links API

## Purpose
URL shortener API that converts long URLs into short links.
It handles redirects, click tracking, analytics, caching and resilience features.

## Dependencies

| Dependency | Type | What happens without it | Fallback |
|---|---|---|---|
| PostgreSQL | Primary Database | Link creation and analytics fail | Circuit breaker fallback response |
| Redis | Cache | Increased database load and slower responses | Application continues without cache |
| Opossum Circuit Breaker | Resilience Layer | No graceful degradation | Requests fail normally |

## Endpoints

### Health
GET /live
- Checks if application process is running

GET /ready
- Checks service readiness

GET /metrics
- Prometheus metrics endpoint

### Business APIs

POST /links
- Create shortened URL

GET /links/:code
- Redirect short URL

GET /links/stats/:code
- Get click analytics

PATCH /links/:code
- Update link

DELETE /links/:code
- Delete link


## Configuration

Environment variables:

DATABASE_URL
- PostgreSQL connection string

REDIS_HOST
- Redis server address

LOG_LEVEL
- Controls logging verbosity

Circuit breaker:
- resetTimeout: 30000ms
- Failure threshold configured in LinksService


## Deploy

Build:

npm run build

Start:

npm run start:prod


Verify:

curl http://localhost:3000/live

Expected:
Application returns healthy response


## Rollback

Check previous git commit:

git log --oneline

Rollback:

git checkout <previous_commit>


Verify:

npm run build


## Ownership

Owner:
Harshit Tyagi

Service:
NestJS Links API

Escalation:
Primary: Backend Engineer
Secondary: Engineering Manager