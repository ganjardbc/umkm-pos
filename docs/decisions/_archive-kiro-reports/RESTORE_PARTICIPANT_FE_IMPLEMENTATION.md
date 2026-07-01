# Restore Participant Feature - Frontend Implementation

## Overview
Implemented the restore participant feature in the POS ParticipantManagement component, allowing shift owners to restore previously removed participants to an open shift.

## Changes Made

### 1. API Service (`src/modules/shift/services/api.ts`)
**Fixed HTTP Method:**
- Changed `restoreParticipant` from DELETE to PATCH
- Endpoint: `PATCH /api/v1/shifts/{shiftId}/participants/{userId}/restore`
- Now correctly matches the backend API specification

```typescript
export const restoreParticipant = async (shiftId: string | number, userId: string | number, options: any = {}) => {
  return await api.patch(
    `/api/v1/shifts/${shiftId}/participants/${userId}/restore`,
    {},
    { ...(options || {}) },
  );
};
```

### 2. Composable (`src/modules/shift/composables/useShift.ts`)
**Already Implemented:**
- `restoreParticipant()` action was already present in the composable
- Handles API call and updates participant list
- Follows same pattern as `addParticipant` and `removeParticipant`

### 3. Component (`src/modules/pos/components/ParticipantManagement.vue`)

#### Added Restore Button
- Visible only when:
  - User is shift owner
  - Shift is open
  - Participant is not the owner
  - Participant is marked as removed (`participant_removed_at` is set)
- Icon: `pi pi-undo` (undo icon)
- Severity: `success` (green color)
- Size: `small`

```vue
<Button
  v-if="isShiftOwner && isShiftOpen && !participant.is_owner && participant.participant_removed_at"
  icon="pi pi-undo"
  rounded
  text
  severity="success"
  size="small"
  @click="confirmRestoreParticipant(participant)"
  :loading="loading"
  title="Restore participant"
/>
```

#### Added Handler Functions

**`confirmRestoreParticipant(participant)`**
- Shows confirmation dialog before restoring
- Dialog type: `info` (blue)
- Calls `handleRestoreParticipant()` on confirmation

**`handleRestoreParticipant()`**
- Calls `restoreParticipant()` from composable
- Shows success toast on completion
- Shows error toast on failure
- Emits `participant-added` event to parent component
- Clears participant reference after operation

#### Updated Imports
- Added `restoreParticipant` to the destructured imports from `useShift()`

## UI/UX Flow

### Before Restoration
```
Participant Item (Removed)
├── Name: "John Doe"
├── Tag: "Removed" (warning/yellow)
├── Meta: Added date, Transaction count
└── Actions:
    └── Restore Button (undo icon, green)
```

### After Restoration
```
Participant Item (Active)
├── Name: "John Doe"
├── Meta: Added date, Transaction count
└── Actions:
    └── Remove Button (trash icon, red)
```

## Validation & Error Handling

The feature includes comprehensive error handling:
- **Shift not found**: 404 error
- **Shift is closed**: 400 error
- **Participant not found**: 404 error
- **Participant already active**: 409 conflict error
- **Insufficient permissions**: 403 forbidden error

All errors are caught and displayed as toast notifications to the user.

## Event Emissions

The component emits `participant-added` event when a participant is successfully restored, allowing parent components to:
- Refresh participant list
- Update UI state
- Trigger related actions

## Testing Checklist

- [ ] Verify restore button appears only for removed participants
- [ ] Verify restore button is hidden for active participants
- [ ] Verify restore button is hidden for shift owner
- [ ] Verify restore button is hidden when shift is closed
- [ ] Verify confirmation dialog appears before restoration
- [ ] Verify success toast shows after restoration
- [ ] Verify error toast shows on failure
- [ ] Verify participant moves from removed to active state
- [ ] Verify transaction count is preserved
- [ ] Verify audit log records the restoration action

## Related Features

- **Remove Participant**: `DELETE /shifts/:id/participants/:user_id`
- **Add Participant**: `POST /shifts/:id/participants`
- **Get Participants**: `GET /shifts/:id/participants`
- **Handoff Shift**: `POST /shifts/:id/handoff`

## Notes

- Restoring a participant does NOT reset their transaction history
- The `participant_added_at` timestamp remains unchanged from original addition
- Multiple removals and restorations are tracked in audit logs
- Shift must remain open for restoration to work
- Only shift owners can restore participants
