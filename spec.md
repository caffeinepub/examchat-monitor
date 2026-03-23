# ExamChat Monitor

## Current State
New project. No existing files.

## Requested Changes (Diff)

### Add
- Login page: Host login with hardcoded password 'TMMVVCE'; Participant login with name entry
- WhatsApp-style chat UI for participants to submit answers
- Private messaging: participants can only see their own messages/replies
- Host dashboard: see all participant conversations ordered by time
- Malpractice detection: detect tab switching (visibilitychange) and window blur/focus loss; auto-send a malpractice alert message from the participant's account when detected
- Backend: store messages per participant, track malpractice events, return messages filtered by participant identity

### Modify
N/A

### Remove
N/A

## Implementation Plan
1. Backend actor with:
   - registerParticipant(name) -> participantId
   - sendMessage(participantId, text) -> MessageId
   - getMyMessages(participantId) -> [Message] (only own messages)
   - getAllMessages() -> [Message] (host only, password-gated)
   - flagMalpractice(participantId, type) -> () auto-sends system message
2. Frontend:
   - /login: role selector (Host / Participant), name field for participants, password field for host
   - /chat (participant): WhatsApp bubble UI, input bar, malpractice detector (visibilitychange + blur events)
   - /host: sidebar list of participants, click to view their message thread, messages ordered by timestamp
   - WhatsApp green color scheme
   - Malpractice auto-message injected client-side when tab switch or window blur detected
