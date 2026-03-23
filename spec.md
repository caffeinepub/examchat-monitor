# ExamChat Monitor

## Current State
The Motoko backend has all required methods (registerParticipant, sendMessage, flagMalpractice, getMyMessages, getAllMessages, getParticipants) but the generated frontend bindings (backend.did.js, backend.ts) are empty -- no methods are exposed. This means participant registration fails silently because the actor has no callable methods.

## Requested Changes (Diff)

### Add
- Nothing new; backend logic already exists

### Modify
- Regenerate Motoko backend so bindgen produces correct bindings with all methods

### Remove
- Nothing

## Implementation Plan
1. Call generate_motoko_code with the full backend requirements so bindings are regenerated correctly
2. No frontend changes needed -- LoginPage, ChatPage, HostPage are already correct
