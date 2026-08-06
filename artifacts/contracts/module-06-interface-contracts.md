# Module 06 Interface Contracts

## Shared Identifiers

link_id:
- Type: number
- Required: yes

code:
- Type: string
- Required: yes
- Max length: 64


## Contract 1: Link Creation API

Endpoint:
POST /links

Request:
{
  "url": "string",
  "domain": "string(optional)"
}

Response 201:
{
  "id": number,
  "code": string,
  "url": string
}

Errors:

400:
{
 "error": "invalid_url"
}


## Contract 2: Analytics API

Endpoint:
GET /links/{id}/stats

Input:
id:
- Type: number
- Required: yes

Response 200:

{
 "link_id": number,
 "total_clicks": number,
 "last_clicked_at": "ISO-8601 datetime"
}


Errors:

404:
{
 "error": "link_not_found"
}


## Synchronization Point

Before integration:
- Verify link_id type matches.
- Verify endpoint paths match.
- Verify error formats are consistent.

## Seeded Contract Violation

Analytics agent returned:
{
 "linkId": "123"
}

Expected:
{
 "link_id": 123
}

Issue:
Different naming convention and type mismatch detected during checkpoint.
