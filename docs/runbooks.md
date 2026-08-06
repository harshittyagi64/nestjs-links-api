# Runbook: Database Connection Failure

## Alert / Detection

Alert:
Database unavailable

Symptoms:
- API returns errors
- Link creation fails


## Diagnosis

Check containers:

docker ps

Problem:
Postgres container missing


Healthy:
postgres container running


## Fix

Start database:

docker start postgres


## Verification

curl localhost:3000/ready

Expected:
database connected


## Escalation

If unresolved after 10 minutes:
Contact backend owner.