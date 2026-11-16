# Messaging System Architecture — Guide ↔ Traveller

**Project:** Guides Nepal  
**Status:** Proposed (implementation follows)  
**Roles affected:** `traveler` (public site), `guide` (public frontend), `admin`, `customer-support` (moderation/oversight)  
**Backend:** FastAPI + SQLAlchemy + Alembic (SQLite dev / PostgreSQL prod)  
**Frontend:** React 18 + TypeScript + Zustand + Vite  
**Real-time:** WebSocket (FastAPI) with REST fallback / polling

---

## 1. Goals & Scope

Restructure the Guide↔Traveller messaging system so that:

1. Messages are **persisted server-side** (today the frontend keeps them only in `localStorage` via `messageStore.ts` and `messageApi.ts` degrades to a no-op).
2. Every message carries a **lifecycle status**: `sent` → `delivered` → `read`, with timestamps.
3. Communication is **real-time** when both parties are online, with graceful fallback when either is offline.
4. Routing is **role- and session-aware**: a message can only flow between the two participants of a conversation, and delivery depends on the recipient's online/offline session state.
5. **Asynchronous notifications** fire when a recipient is offline (in-app + email/push placeholders).
6. Staff (`admin`, `customer-support`) retain oversight for moderation/support; guides and travelers see only their own conversations.

Out of scope for v1: group conversations, media attachments, message reactions, message editing/deletion, read-receipts beyond single `read` flag, end-to-end encryption.

---

## 2. Roles & Access Model

| Actor | Can create conversation | Can send | Can read | Scope |
|-------|------------------------|----------|----------|-------|
| Traveler | Yes (with a guide they booked / may book) | To the guide of the conversation | Their own conversations | traveler side only |
| Guide | Yes (accepts traveler-initiated, or initiates) | To the traveler of the conversation | Their own conversations | guide side only |
| Admin | No | No | All conversations (oversight) | platform-wide |
| Customer-support | No | No | All conversations (tickets) | platform-wide |
| Host / Regional-head / Content-manager | No | No | No | not permitted |

The single source of truth for roles remains `backend/app/core/roles.py`. Messaging guards reuse `require_role(TRAVELER, GUIDE)` for participant routes and `require_role(ADMIN, CUSTOMER_SUPPORT)` for oversight routes.

> Note on spelling: the codebase role is `traveler` (American); the user-facing term is "Traveller" (British). Both refer to the same role.

---

## 3. End-to-End Message Routing Logic

### 3.1 Conversation model
A **conversation** is a 1:1 thread between exactly one traveler and one guide, optionally linked to a `booking`.

```
Conversation {
  id, traveler_id (FK users), guide_id (FK users),
  booking_id (FK bookings, nullable), subject,
  is_active, created_at, updated_at, last_message_at
}
```

Uniqueness constraint: one active conversation per `(traveler_id, guide_id)` pair. A new conversation is created when a traveler first messages a guide (typically from a booking page or the guide's profile). Subsequent messages reuse the existing conversation.

### 3.2 Routing rules (who may send to whom)

```
if sender.role == traveler:
    recipient = conversation.guide_id   (the guide)
    require: sender.id == conversation.traveler_id
elif sender.role == guide:
    recipient = conversation.traveler_id
    require: sender.id == conversation.guide_id
elif sender.role in (admin, customer-support):
    recipient = any participant (oversight / system message)
    require: read-only except staff system messages
else:
    reject 403
```

A participant may only send inside a conversation they belong to. Cross-role spoofing (traveler→traveler, guide→guide) is rejected.

### 3.3 Message lifecycle (state machine)

```
sent          — message persisted, sender confirmed receipt by server
  → delivered — recipient's client acknowledged receipt (online WS delivery, or REST fetch)
  → read      — recipient opened the conversation (read_at set)
```

Transitions:
1. `sendMessage` → insert with `status = 'sent'`, `sent_at = now()`.
2. If recipient online (WebSocket connection present): server pushes → client acks → `status = 'delivered'`, `delivered_at = now()`.
3. If recipient offline: message stays `sent`; a notification is queued. On recipient's next online connect or REST fetch, transition to `delivered`.
4. Recipient opens conversation → `status = 'read'`, `read_at = now()` (bulk mark-read for all unread messages in that conversation addressed to the viewer).

### 3.4 Session-state-dependent delivery

| Recipient state | Delivery path | Status after send |
|-----------------|---------------|-------------------|
| Online (WS open) | Push via WebSocket, client acks | `delivered` |
| Offline / no WS | Persist only; queue notification | `sent` (until they reconnect/fetch) |
| Reconnecting | On WS connect, server marks all their `sent` messages as `delivered` | `delivered` |

Presence is tracked via `user_sessions` (WS connection_id ↔ user_id ↔ last_seen) plus an in-memory connection manager for active broadcasts.

---

## 4. Database Schema

Four new tables. All use `id INTEGER PK`, `created_at`/`updated_at` server-managed.

### 4.1 `conversations`

| Column | Type | Notes |
|--------|------|-------|
| id | Integer PK | |
| traveler_id | Integer FK users.id, indexed | |
| guide_id | Integer FK users.id, indexed | |
| booking_id | Integer FK bookings.id, nullable, indexed | links message thread to a booking |
| subject | String(200), nullable | |
| is_active | Boolean, default true | soft-deactivate instead of hard delete |
| last_message_at | DateTime, nullable | for conversation list ordering |
| created_at, updated_at | DateTime | |

Indexes/constraints: `IX(conversations, traveler_id, guide_id, is_active)` partial unique (one active thread per pair), `IX(guide_id)`, `IX(traveler_id)`, `IX(last_message_at)`.

### 4.2 `messages`

| Column | Type | Notes |
|--------|------|-------|
| id | Integer PK | |
| conversation_id | Integer FK conversations.id, indexed | |
| sender_id | Integer FK users.id, indexed | |
| recipient_id | Integer FK users.id, indexed | denormalized recipient for fast recipient-scoped queries |
| body | Text, nullable=false | message content |
| status | String(20), default 'sent' | sent / delivered / read |
| sent_at | DateTime | |
| delivered_at | DateTime, nullable | |
| read_at | DateTime, nullable | |
| created_at, updated_at | DateTime | |

Indexes: `IX(conversation_id, created_at)`, `IX(sender_id)`, `IX(recipient_id, status)` (for unread counts), `IX(status)`.

### 4.3 `message_statuses` (per-recipient delivery/read receipts)

Supports 1:1 today and group/multi-recipient in future. One row per (message, recipient).

| Column | Type | Notes |
|--------|------|-------|
| id | Integer PK | |
| message_id | Integer FK messages.id, indexed | |
| user_id | Integer FK users.id, indexed | the recipient |
| status | String(20), default 'sent' | |
| delivered_at | DateTime, nullable | |
| read_at | DateTime, nullable | |
| updated_at | DateTime | |

Unique: `(message_id, user_id)`.

### 4.4 `user_sessions` (presence)

| Column | Type | Notes |
|--------|------|-------|
| id | Integer PK | |
| user_id | Integer FK users.id, indexed | |
| connection_id | String | WebSocket connection id |
| connected_at | DateTime | |
| last_seen | DateTime | |
| is_online | Boolean, default true | |

In-memory `ConnectionManager` mirrors this for sub-millisecond broadcast decisions; `user_sessions` is the durable source of truth for reconnect recovery.

### 4.5 `notifications` (async offline notifications)

| Column | Type | Notes |
|--------|------|-------|
| id | Integer PK | |
| user_id | Integer FK users.id, indexed | recipient |
| type | String(30) | `message_received`, `booking_update`, … |
| title | String(200) | |
| body | Text | |
| data | JSON | payload (conversation_id, message_id, sender_id) |
| is_read | Boolean, default false | |
| created_at | DateTime | |

---

## 5. Real-Time Communication (WebSocket)

### 5.1 Endpoint
`WS /api/v1/messages/ws/{conversation_id}` — query param `token` (JWT access token) for auth. No cookie-based auth to keep CORS simple.

### 5.2 Connection flow
1. Client opens WS, sends JWT in `?token=`.
2. Server validates JWT → `current_user` → verifies membership in `conversation_id` (traveler or guide, or staff).
3. Server registers `connection_id ↔ user_id` in `ConnectionManager` + `user_sessions`.
4. Server pushes any messages with `status='sent'` addressed to `current_user` and marks them `delivered`.
5. Client sends JSON `{ type: 'message', body, ... }` → server persists, routes, broadcasts.
6. Client sends `{ type: 'read', conversation_id }` → server marks conversation messages read.
7. On disconnect, server unregisters connection; user marked offline after a short grace (reconnect window).

### 5.3 Broadcast rules
A sent message is broadcast on the conversation's WS room. The sender receives an echo (confirmation). The recipient receives it live if connected; otherwise it stays `sent` and a notification is queued.

### 5.4 REST fallback
For clients that cannot open WS (or during reconnect), REST endpoints provide:
- `GET /messages/conversations` — list conversations with unread counts
- `GET /messages/conversations/{id}/messages` — paginated message history
- `POST /messages/conversations/{id}/messages` — send (REST)
- `POST /messages/conversations/{id}/read` — mark read

REST-sent messages follow the same status machine (sent → delivered on fetch → read on open).

---

## 6. Message Status Tracking

| Status | Meaning | Set by |
|--------|---------|--------|
| `sent` | Persisted, sender confirmed | `sendMessage` |
| `delivered` | Recipient's client received it | WS ack / REST fetch / reconnect replay |
| `read` | Recipient opened conversation | `markRead` |

API response shape (`MessageOut`):
```json
{
  "id": 1,
  "conversation_id": "conv_...",
  "sender_id": 13,
  "sender_name": "Apicha",
  "sender_role": "guide",
  "recipient_id": 6,
  "body": "Hi, I'm interested in your trek.",
  "status": "delivered",
  "sent_at": "2026-11-16T15:15:00Z",
  "delivered_at": "2026-11-16T15:15:02Z",
  "read_at": null,
  "created_at": "2026-11-16T15:15:00Z"
}
```

Unread count per conversation = messages where `recipient_id == viewer` AND `status IN ('sent','delivered')`.

---

## 7. Asynchronous Notifications

Triggered when a message is `sent` and the recipient has **no active WS connection** at send time.

- **In-app notification**: insert row into `notifications` (`type='message_received'`, `data` contains conversation/message ids). Shown in a bell dropdown on both traveler and guide shells.
- **Email / push placeholder**: `NotificationService.dispatch()` writes to `notifications` and exposes an extensible hook (`send_email`, `send_push`) wired to an email provider later. No external provider is required in v1.
- On recipient reconnect or app focus, client fetches unread notifications and marks them read.

---

## 8. Integration Points

| Integration | Direction | Detail |
|-------------|-----------|--------|
| Booking creation | Traveler → backend | On confirmed booking, optionally pre-create a `conversation` linked to `booking_id` so the traveler can message the guide immediately. |
| Guide bookings page | Guide → backend | Each booking row surfaces a "Message traveler" action that opens/creates the conversation. |
| Traveller messages page | Traveler → backend | `GET /messages/conversations` lists threads; tapping one opens `/messages/guide/:guideId`. |
| Guide dashboard | Guide → backend | Unread message count badge on `/guide/dashboard`. |
| Admin / support oversight | Staff → backend | `GET /admin/messages` lists all conversations for moderation; no send capability. |
| Auth / session | Both | JWT from existing `/auth/login`; WS auth reuses `get_user_id_from_token`. |
| Presence | WS | Connect/disconnect toggles `user_sessions.is_online`. |

---

## 9. API Specification

### 9.1 REST (`/api/v1/messages`)

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/messages/conversations` | traveler, guide | Get-or-create a 1:1 conversation with a guide/traveler |
| GET | `/messages/conversations` | traveler, guide | List own conversations (with unread counts, last message) |
| GET | `/messages/conversations/{id}/messages` | traveler, guide (+staff) | Paginated message history |
| POST | `/messages/conversations/{id}/messages` | traveler, guide | Send a message (REST) |
| POST | `/messages/conversations/{id}/read` | traveler, guide | Mark all unread messages in conversation as read |
| GET | `/messages/notifications` | traveler, guide | List own notifications |
| POST | `/messages/notifications/{id}/read` | traveler, guide | Mark a notification read |
| GET | `/admin/messages/conversations` | admin, customer-support | Oversight: all conversations (read-only) |

### 9.2 WebSocket
`WS /api/v1/messages/ws/{conversation_id}?token=<jwt>` — bidirectional JSON framing (see §5).

---

## 10. Frontend Integration

Existing files to update:
- `frontend/src/services/messageApi.ts` — replace graceful-degradation stubs with real axios calls to `/api/v1/messages/*`, preserving the `{ ok, synced }` contract.
- `frontend/src/store/messageStore.ts` — hydrate from server on login, persist sent/delivered/read status, replace `stableTravelerId` local fallback with the authenticated `user.id`, add WS connection/reconnect and presence handling.
- `frontend/src/pages/messages/TravellerMessagesPage.tsx` — already lists conversations; wire to real API (keep catalog fallback for offline).
- `frontend/src/pages/messages/GuideChatPage.tsx` — add WS connect on mount, send/receive real-time, mark-read on open, reconnect with backoff.
- Routes `/messages` and `/messages/guide/:guideId` already exist in `App.tsx`.

New:
- `frontend/src/services/messageWs.ts` — WebSocket client (connect, send, receive, reconnect, presence).
- `frontend/src/components/common/NotificationBell.tsx` — in-app notification dropdown (optional v1.1).

---

## 11. Implementation Plan (Phased)

**Phase 1 — Data layer** (this change)
- Models: `Conversation`, `Message`, `MessageStatus`, `UserSession`, `Notification`.
- Alembic migration (head `8f795c139451` → new revision).
- Register models in `app/models/__init__.py`.

**Phase 2 — Service layer**
- `MessageService`: conversation get-or-create, send, mark-read, unread counts, participant authorization.
- `PresenceService` / `ConnectionManager`: WS connection registry, online/offline detection, sent→delivered replay on reconnect.
- `NotificationService`: queue offline notifications.

**Phase 3 — API + WebSocket**
- `app/api/v1/messages.py` REST routes + guards.
- WebSocket endpoint with JWT auth and room-based broadcast.
- Register router + startup presence init in `main.py`.

**Phase 4 — Frontend**
- Rewire `messageApi.ts` + `messageStore.ts` to the real backend.
- Add WS client + reconnect; mark-read on conversation open.
- Notification bell + unread badges.

**Phase 5 — Verification**
- Backend tests: routing authorization, status transitions, WS deliver/offline queue.
- Frontend: send/receive real-time between traveler and guide, offline→online delivery, unread counts.
- Run `npm run lint`, `npm run typecheck`, `npm run test:backend`.

---

## 12. Security Considerations

- All participant routes require a valid JWT (`get_current_user`) and explicit membership in the conversation (`403` otherwise).
- Staff oversight routes require `ADMIN` or `CUSTOMER_SUPPORT`; staff cannot send participant messages (read-only).
- Message body is sanitized (reuse `security.sanitize_input`) and length-limited to prevent XSS / abuse.
- Rate limiting (`RATE_LIMIT_REQUESTS` per `RATE_LIMIT_PERIOD`) applies to send endpoints.
- Conversations are scoped: a traveler cannot list/read a guide's other conversations; a guide cannot list/read another guide's threads.
- WS connections use token validation on every connect; no long-lived anonymous sockets.
- `booking_id` foreign key ensures threads reference real bookings (nullable to allow pre-booking contact).

---

## 13. Open Questions / Decisions Needed

1. **Conversation initiation policy:** restrict new conversations to travelers who have a booking with the guide, or allow any traveler to message any guide? (Recommended: booking-linked for v1, configurable flag.)
2. **Notification provider:** email/push hooks are placeholders; integrate with an email service (e.g. Resend/SendGrid) when credentials are available.
3. **WS at scale:** single-instance in-memory `ConnectionManager` works for one Render worker; behind multiple workers, replace with Redis pub/sub.
