# Module 08 Integration Test Plan

## Test 1: Booking Creation Propagation

Components:
- User Service
- Booking Service
- Notification Service

Setup:
Authenticated user with available provider slot.

Steps:
1. User creates booking.
2. Booking service stores booking.
3. Notification service receives booking event.

Expected:
Booking appears correctly and notification is triggered.

---

## Test 2: Cancellation Flow

Components:
- Booking Service
- Provider Dashboard
- Notification Service

Setup:
Existing confirmed booking.

Steps:
1. User cancels booking.
2. Status updates.
3. Provider receives update.

Expected:
All components show cancelled status.

---

## Test 3: Concurrent Booking

Components:
- Booking API
- Database

Setup:
Two users attempt same slot.

Steps:
1. Send simultaneous booking requests.
2. Verify conflict handling.

Expected:
One booking succeeds and another receives conflict response.
