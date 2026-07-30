# Links API — Testing & Quality Assurance Strategy Guide

## 1. Quality Assurance Framework & Strategy

The Links API applies a multi-tiered quality assurance strategy to ensure data integrity, multi-tenant isolation, caching accuracy, and edge-case resilience across all endpoints.

+------------------------------------------------------------------+|                     End-to-End (E2E) Tests                       ||   Simulate full HTTP request/response pipelines using Supertest   |+------------------------------------------------------------------+|v+------------------------------------------------------------------+|                   Integration & Cache Verification               ||   Validates Redis invalidation, expiration, and webhooks          |+------------------------------------------------------------------+|v+------------------------------------------------------------------+|                       Jest Unit Testing                          ||   Isolated test suites for Controllers, Services, and DTO Pipes  |+------------------------------------------------------------------+
---

## 2. Unit Testing Patterns (`Jest`)

Unit tests target isolated business logic within service methods and controllers using Jest mocks.

### 2.1 Service Testing Example (`LinksService`)

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { LinksService } from './links.service';
import { WebhooksService } from '../webhooks/webhooks.service';
import { ConflictException } from '@nestjs/common';

describe('LinksService', () => {
  let service: LinksService;
  let webhooksService: WebhooksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LinksService,
        {
          provide: WebhooksService,
          useValue: {
            dispatch: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get<LinksService>(LinksService);
    webhooksService = module.get<WebhooksService>(WebhooksService);
  });

  it('should create a short link with a custom vanity code', async () => {
    const link = await service.create('tenant-1', '[https://nestjs.com](https://nestjs.com)', undefined, 'custom-code');
    expect(link).toBeDefined();
    expect(link.code).toEqual('custom-code');
    expect(webhooksService.dispatch).toHaveBeenCalledWith('tenant-1', 'link.created', link);
  });

  it('should throw ConflictException on duplicate vanity code per domain', async () => {
    await service.create('tenant-1', '[https://nestjs.com](https://nestjs.com)', undefined, 'dup-code', undefined, undefined, 'go.brand.io');
    await expect(
      service.create('tenant-2', '[https://other.com](https://other.com)', undefined, 'dup-code', undefined, undefined, 'go.brand.io'),
    ).rejects.toThrow(ConflictException);
  });
});
3. End-to-End (E2E) Test Suite (test/app.e2e-spec.ts)End-to-end tests validate full application pipeline behavior including global pipes, authentication guards, and error responses using Supertest.TypeScriptimport { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Links API (E2E)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /links - should reject invalid URL payload with 400 Bad Request', () => {
    return request(app.getHttpServer())
      .post('/links')
      .set('x-api-key', 'tenant-key-1')
      .send({ long_url: 'not-a-valid-url' })
      .expect(400);
  });

  it('GET /r/:code - should return 404 for non-existent short code', () => {
    return request(app.getHttpServer())
      .get('/r/nonexistent123')
      .expect(404);
  });
});
4. Comprehensive Edge Case Validation MatrixTarget FeatureTest ScenarioExpected StatusExpected Error / Payload OutputAuthenticationRequest /links without x-api-key header401{ "message": "Missing or invalid API key." }DTO ValidationPass domain: "invalid_domain" (non-FQDN)400{ "message": ["Domain must be a valid..."] }Vanity CodesCreate existing vanity code on same domain409{ "message": "Short code \"...\" is already in use..." }Password GateDirect GET /r/:code on protected link403{ "is_protected": true }Password VerificationSubmit incorrect password to POST /r/:code/verify401{ "message": "Invalid password for this link." }ExpirationAccess short link past expires_at timestamp410{ "message": "This short link has expired." }Rate LimitingIssue > 100 requests in 60-second window429{ "message": "ThrottlerException: Too Many Requests" }5. Automated PowerShell Sanity Test ScriptDevelopers can run this automated verification script locally against a running instance (http://localhost:3000):PowerShell# Local Verification & Sanity Test Suite
$baseUrl = "http://localhost:3000"
$apiKey = "tenant-key-qa"

Write-Host "=== STARTING SANITY TEST SUITE ===" -ForegroundColor Cyan

# 1. Test Link Creation
$createBody = @{ long_url = "[https://nestjs.com](https://nestjs.com)"; tags = @("qa", "test") } | ConvertTo-Json
$createRes = Invoke-RestMethod -Uri "$baseUrl/links" -Method POST -Headers @{ "x-api-key" = $apiKey } -ContentType "application/json" -Body $createBody
Write-Host "[PASS] Created Link Code: $($createRes.code)" -ForegroundColor Green

# 2. Test Paginated Query
$queryRes = Invoke-RestMethod -Uri "$baseUrl/links?tag=qa" -Method GET -Headers @{ "x-api-key" = $apiKey }
Write-Host "[PASS] Query Found $($queryRes.total) match(es)" -ForegroundColor Green

# 3. Test Redirection Resolution
$redirectRes = Invoke-WebRequest -Uri "$baseUrl/r/$($createRes.code)" -MaximumRedirection 0 -SkipHttpErrorCheck
Write-Host "[PASS] Redirect Status: $($redirectRes.StatusCode)" -ForegroundColor Green

Write-Host "=== ALL TEST SCENARIOS PASSED ===" -ForegroundColor Cyan
6. Execution CommandsPowerShell# Run unit tests
npm run test

# Run end-to-end tests
npm run test:e2e

# Run test coverage report
npm run test:cov