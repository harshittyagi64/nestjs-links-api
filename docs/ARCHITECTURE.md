Links API — System Architecture & Design Document

## 1. System Overview

The **Links API** is a high-throughput, multi-tenant URL shortening and redirection engine built with NestJS and TypeScript. It provides vanity alias creation, expiration handling, password protection, custom branded domains, QR code generation, advanced click analytics, and real-time webhook event dispatches.

---

## 2. Core Architectural Components

+-----------------------------------------------------------------------+
|                             HTTP Client                               |
+-----------------------------------------------------------------------+
|
v
+-----------------------------------------------------------------------+
|                    NestJS Application Pipeline                        |
|                                                                       |
|  +--------------------+  +-------------------+  +------------------+  |
|  | Throttler Guard    |  | API Key Guard     |  | Validation Pipe  |  |
|  | (Rate Limiting)    |  | (x-api-key Auth)  |  | (class-validator)|  |
|  +--------------------+  +-------------------+  +------------------+  |
+-----------------------------------------------------------------------+
|                                           |
v                                           v
+-----------------------+                   +-----------------------+
|  Redirect Controller  |                   |   Links Controller    |
|   GET /r/:code        |                   |   GET, POST, PATCH    |
+-----------------------+                   +-----------------------+
|                                           |
+-------------------+   +-------------------+
|   |
v   v
+-----------------------------------------------------------------------+
|                       Links Service Engine                            |
|                                                                       |
|   +-----------------------+           +---------------------------+   |
|   |  Redis Cache Layer    |           |  In-Memory Data Storage   |   |
|   |  (Redirect Targets)   |           |  (Links Array Engine)     |   |
|   +-----------------------+           +---------------------------+   |
|                                                                       |
|   +-----------------------+           +---------------------------+   |
|   | Analytics Logging     |           | Webhook Dispatcher        |   |
|   | (User-Agent/Referrer) |           | (Asynchronous HTTP)       |   |
|   +-----------------------+           +---------------------------+   |
+-----------------------------------------------------------------------+


### 2.1 API Engine (`NestJS`)
* **Framework**: NestJS TypeScript framework using modular boundaries (`LinksModule`, `RedirectModule`, `WebhooksModule`, `CacheModule`).
* **Pipe & Guard Processing**: Centralized validation using `ValidationPipe` with strict payload filtering and `ThrottlerGuard` for DDoS/abuse protection.

### 2.2 Storage Engine
* **In-Memory Storage**: Domain models (`Link`, `ClickLog`, `Webhook`) are stored using managed array data structures for predictable, constant-time operations.

### 2.3 Distributed Cache Engine (`Dockerized Redis`)
* **Redirect Cache**: Avoids persistent storage lookups on `GET /r/:code` paths by serving targets directly from Redis.
* **Cache Eviction**: `DELETE /links/:id` and `PATCH /links/:id` trigger cache invalidation (`cacheService.invalidateRedirectTarget(code)`) to keep cached redirect targets consistent.

---

## 3. Data Flow & Mechanics

### 3.1 Redirect Resolution Flow
1. **Client Request**: Issue `GET /r/:code`.
2. **Cache Check**: System queries Redis for short code resolution.
   * **Cache Hit**: Returns cached destination URL immediately.
   * **Cache Miss**: Reads from primary storage, sets Redis target TTL, and returns target.
3. **Guard Checks**: Validates expiration timestamp (`410 Gone`) and password protection requirements (`403 Forbidden`).
4. **Analytics Logging**: Captures `user-agent` and `referer` headers to compute device breakdowns (`desktop`, `mobile`, `bot`, `other`).
5. **Webhook Dispatch**: Asynchronously dispatches `link.clicked` events to subscribed webhooks.

### 3.2 Cache Invalidation Lifecycle
[Client Mutation] ---> (PATCH /links/:id OR DELETE /links/:id)
|
v
[Update Storage Domain Entity]
|
v
[cacheService.invalidateRedirectTarget(code)]
|
v
[Redis Key Evicted]


---

## 4. Multi-Tenancy & Security Isolation

| Layer | Implementation Pattern |
| :--- | :--- |
| **Authentication** | `x-api-key` header mapped to `req['principal_id']`. |
| **Authorization** | Ownership checks on resource mutations (`link.principal_id === principalId`). |
| **Rate Limiting** | Sliding window rate limits grouped by tenant key. |
| **Data Scope** | Paginated listing and analytics strictly filtered by calling principal ID. |

---

## 5. Summary Matrix of Supported Features

* **Short Code Creation & Vanity Aliases**: Custom vanity codes with conflict handling (`409 Conflict`).
* **Expiration Engine**: `expires_at` support returning `410 Gone` on access.
* **Paginated Search & Tagging**: Full-text searching (`search`) and campaign tagging (`tag`).
* **Custom Domain Support**: Branded domains (`domain`) with domain-scoped code uniqueness.
* **Password Protection**: Password verification gate (`POST /r/:code/verify`).
* **QR Code Engine**: On-the-fly QR generation in vector (`SVG`) and raster (`PNG`) formats.
* **Webhook Engine**: Event subscriptions with real-time asynchronous HTTP dispatches.