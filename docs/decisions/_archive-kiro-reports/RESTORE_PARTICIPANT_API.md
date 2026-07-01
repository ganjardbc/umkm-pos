# Restore Participant API Documentation

## Overview
New API endpoint to restore previously removed participants to an open shift. This complements the existing `removeParticipant` endpoint by allowing recovery of accidentally removed cashiers.

## Endpoint

### Restore Participant
```
PATCH /shifts/:id/participants/:user_id/restore
```

**Permission Required:** `shift.update`

## Request Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `id` | string | URL path | Yes | Shift ID |
| `user_id` | string | URL path | Yes | User ID to restore |
| `merchant_id` | string | Header (JWT) | Yes | Merchant ID from authenticated user |

## Response

### Success (200 OK)
```json
{
  "user_id": "user-uuid",
  "user_name": "John Doe",
  "participant_added_at": "2026-03-25T10:00:00Z",
  "participant_removed_at": null,
  "is_owner": false,
  "transaction_count": 5
}
```

### Error Responses

| Status | Code | Description |
|--------|------|-------------|
| 400 | BadRequestException | Shift is closed or participant already active |
| 404 | NotFoundException | Shift not found or participant not found |
| 409 | ConflictException | Participant is already active in this shift |
| 403 | Forbidden | Insufficient permissions |

## Validation Rules

1. **Shift must exist** and belong to the merchant
2. **Shift must be open** - cannot restore to closed shifts
3. **User must exist** and belong to the same merchant
4. **Participant must exist** in the shift record
5. **Participant must be removed** - cannot restore already active participants

## Implementation Details

### Service Method: `restoreParticipant()`
- Located in: `src/shifts/shifts.service.ts`
- Validates shift ownership and status
- Verifies user belongs to merchant
- Checks participant exists and is removed
- Clears `participant_removed_at` timestamp (soft-delete reversal)
- Creates audit log entry with action `participant_restored`
- Uses atomic transaction for consistency

### Controller Endpoint
- Located in: `src/shifts/shifts.controller.ts`
- HTTP Method: `PATCH`
- Route: `:id/participants/:user_id/restore`
- Decorators: `@RequirePermission('shift.update')`

## Audit Trail

When a participant is restored, an audit log entry is created:
```json
{
  "shift_id": "shift-uuid",
  "action": "participant_restored",
  "user_id": "admin-user-id",
  "action_details": {
    "restored_user_id": "participant-user-id"
  }
}
```

## Usage Example

### cURL
```bash
curl -X PATCH http://localhost:3000/shifts/shift-123/participants/user-456/restore \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json"
```

### JavaScript/Fetch
```javascript
const response = await fetch(
  '/shifts/shift-123/participants/user-456/restore',
  {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }
);

const data = await response.json();
```

## Related Endpoints

- **Add Participant:** `POST /shifts/:id/participants`
- **Remove Participant:** `DELETE /shifts/:id/participants/:user_id`
- **Get Participants:** `GET /shifts/:id/participants`
- **Get Shift Details:** `GET /shifts/:id`

## Notes

- Restoring a participant does NOT reset their transaction history
- The `participant_added_at` timestamp remains unchanged from original addition
- Multiple removals and restorations are tracked in audit logs
- Shift must remain open for restoration to work
