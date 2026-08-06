# Module 07 Blast Radius Analysis

## Change 1: Company Accounts Requirement

| Artifact | Status | Impact |
|---|---|---|
| User data model | MAJOR | Add company relationship support. Minimal bridge adds company_name and can_book_for_others fields. |
| Auth/JWT system | NO IMPACT | Existing authentication continues working with current users. |
| Booking flow API | MAJOR | Add booked_for_name and booked_for_email fields when booking for another person. |
| Booking flow UI | MAJOR | Add optional "booking for someone else" form flow. |
| Provider dashboard | MINOR | Show booking requester and booked person information. |
| Search/listing | NO IMPACT | Provider discovery remains unchanged. |
| Payment/billing | MINOR | Billing remains attached to booking user in bridge approach. |
| Interface contracts | MINOR | Update booking payload and response contracts. |
| Completed tickets | NO IMPACT | Completed authentication work remains unchanged. |
| In-progress tickets | MAJOR | Booking-related work needs updated requirements. |
| Not started tickets | MAJOR | Need company booking support added before implementation. |

## Change 2: Compressed Timeline

### MUST SHIP
- Authentication flow
- Provider listing
- Basic booking flow
- Basic company booking bridge
- Demo-ready UI path

### SHOULD SHIP
- Provider dashboard improvements
- Better company visibility
- Additional booking filters

### CUT
- Full organization hierarchy
- Advanced billing workflows
- Analytics dashboard
- Advanced permissions system

Reason: These features do not block the investor demo.


# Second Change: Role Based Access Requirement

| Artifact | Previous Status | New Status | Reason |
|---|---|---|---|
| User data model | MINOR | MAJOR | Need roles, departments, and organization relationships instead of simple company fields. |
| Auth/JWT system | NO IMPACT | MAJOR | JWT/session needs role claims and permission checks. |
| Booking API | MAJOR | MAJOR | Every booking action requires authorization rules. |
| Booking UI | MAJOR | MAJOR | UI actions depend on user role permissions. |
| Provider dashboard | MINOR | MINOR | May need role-aware visibility rules. |
| Interface contracts | MINOR | MAJOR | APIs need permission and role assumptions added. |

Decision update:
The minimal bridge approach is no longer sufficient because boolean permissions cannot represent managers, employees, and department heads. The plan should evolve toward proper organization, role, and permission modeling.
