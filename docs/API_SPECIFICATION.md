# Links API — API Specification & Interface Contract

## 1. Global Request Requirements & Authentication

### 1.1 Base URL
`http://localhost:3000`

### 1.2 Authentication Header
All administrative management routes require tenant authentication via the `x-api-key` header. Public redirection routes do not require this header unless accessing password-protected resources.

| Header Name | Required | Type | Description |
| :--- | :--- | :--- | :--- |
| `x-api-key` | Conditional | String | Principal API key identifying the calling tenant. |
| `Content-Type` | Optional | String | Must be `application/json` for POST/PATCH bodies. |

---

## 2. API Endpoints Specification

### 2.1 Core Short Links API (`/links`)

#### `POST /links` — Create Short Link
Creates a single shortened URL with optional custom alias, domain, expiration, tags, and password protection.

* **Headers**: `x-api-key: <tenant_key>`
* **Request Body**:
```json
{
  "long_url": "(https://nestjs.com)",
  "custom_code": "nest-promo",
  "domain": "go.brand.io",
  "expires_at": "2026-12-31T23:59:59.000Z",
  "tags": ["marketing", "launch"],
  "password": "SecretPassword123"
}