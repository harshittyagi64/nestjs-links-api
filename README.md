# NestJS Links API

A production-oriented URL shortener API built with NestJS and TypeScript, with PostgreSQL persistence, Redis caching, authentication, rate limiting, and Docker support.

## Features

- URL shortening and redirection
- User authentication and authorization
- PostgreSQL database with TypeORM
- Redis caching for frequently accessed links
- Click analytics and statistics
- Rate limiting for API protection
- Input validation and error handling
- Swagger API documentation
- Docker-based development setup
- Health and readiness checks

## Tech Stack

- **Backend:** NestJS, TypeScript
- **Database:** PostgreSQL
- **ORM:** TypeORM
- **Cache:** Redis
- **Authentication:** JWT
- **Documentation:** Swagger / OpenAPI
- **Containerization:** Docker
- **Testing:** Jest

## Architecture

The application follows a modular NestJS architecture.

```text
Client
  ↓
NestJS API
  ↓
Controllers
  ↓
Services
  ↓
TypeORM Repository
  ↓
PostgreSQL

Redis is used as a caching layer for frequently accessed data.
