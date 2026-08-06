# Module 07 Updated Plan

## Preserved
- Authentication system
- Provider listing functionality
- Existing completed tickets
- Existing interface contracts where unchanged

## Modified
1. Booking API
- Add booked_for_name and booked_for_email fields.
- Support booking on behalf of another person.

2. User model
- Add company_name field.
- Add can_book_for_others flag.

3. Booking UI
- Add optional delegation information form.

## Cut
1. Advanced analytics dashboard
- Safe to remove because demo does not depend on analytics.

2. Advanced billing system
- Safe to remove because temporary billing flow is acceptable.

3. Full organization role management
- Safe to remove because basic company booking satisfies demo requirement.

## Added

1. Company Booking Bridge
Scope: Allow authorized users to create bookings for another person using name and email.
Estimate: Medium

2. Delegation Fields
Scope: Extend booking model and API responses with booking owner and booked person information.
Estimate: Small

3. Demo Validation Flow
Scope: Test company booking scenario before investor demonstration.
Estimate: Small


# Second Requirement Adaptation

## New Added Tickets

1. Organization Role Model
Scope: Add organization roles (manager, employee, department head) with relationships.
Estimate: Large

2. Permission Middleware
Scope: Add authorization checks for booking and viewing actions.
Estimate: Medium

3. Department Access Control
Scope: Allow department heads to view department bookings only.
Estimate: Medium

## Decision Revision

The original minimal bridge was acceptable for basic company booking, but role-based access changes the requirement significantly. A proper organization and permission model is now required to avoid creating expensive technical debt.
