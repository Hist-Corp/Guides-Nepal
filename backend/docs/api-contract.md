# Frontend API Contract Analysis

## 1. Authentication

### Endpoints
| Endpoint | Method | Auth Required | Description | Request Body | Response |
|----------|--------|---------------|-------------|--------------|----------|
| `/api/v1/auth/login` | POST | No | User/Guide Login | `{ email, password, role: 'traveler' \| 'guide' }` | `{ access_token, refresh_token, user: { id, firstName, lastName, email, role } }` |
| `/api/v1/auth/register` | POST | No | User Registration | `{ firstName, lastName, email, phone, password, role: 'traveler' }` | `{ access_token, refresh_token, user: { ... } }` |
| `/api/v1/auth/register/guide` | POST | No | Guide Application | `FormData: { fullName, email, phone, password, ninNumber, citizenshipFront, citizenshipBack, liveSelfie, holdingCitizenship, certificate }` | `{ status: 'submitted', applicationId: string }` |
| `/api/v1/auth/refresh` | POST | Yes | Refresh Token | `{ refresh_token }` | `{ access_token }` |
| `/api/v1/auth/me` | GET | Yes | Get Current User | - | `{ id, firstName, lastName, email, role, ... }` |

## 2. Bookings

### Endpoints
| Endpoint | Method | Auth Required | Description | Request Body | Response |
|----------|--------|---------------|-------------|--------------|----------|
| `/api/v1/bookings` | GET | Yes | Get User Bookings | - | `[{ id, experienceId, title, city, date, guests, price, status, image }]` |
| `/api/v1/bookings` | POST | Yes | Create Booking | `{ experienceId, date, guests, price }` | `{ id, status: 'upcoming', ... }` |
| `/api/v1/bookings/{id}/cancel` | POST | Yes | Cancel Booking | - | `{ id, status: 'cancelled' }` |
| `/api/v1/bookings/{id}/archive` | POST | Yes | Archive Booking | - | `{ id, status: 'archived' }` |

## 3. Experiences (Public)

### Endpoints
| Endpoint | Method | Auth Required | Description | Request Body | Response |
|----------|--------|---------------|-------------|--------------|----------|
| `/api/v1/experiences` | GET | No | List Experiences | Query: `city`, `type`, `search` | `[{ id, slug, title, price, duration, rating, reviews, heroImage, ... }]` |
| `/api/v1/experiences/{slug}` | GET | No | Get Experience Details | - | `{ id, title, description, host, guides, tourStructure, ... }` |
| `/api/v1/cities/{city}/experiences` | GET | No | Get City Experiences | - | `[{ ... }]` |

## 4. Guides (Public)

### Endpoints
| Endpoint | Method | Auth Required | Description | Request Body | Response |
|----------|--------|---------------|-------------|--------------|----------|
| `/api/v1/guides/{id}` | GET | No | Get Guide Profile | - | `{ id, name, bio, languages, verified, rating, reviews, gallery }` |
| `/api/v1/guides/{id}/portfolio` | GET | No | Get Guide Portfolio | - | `{ ... }` |

## 5. User Profile

### Endpoints
| Endpoint | Method | Auth Required | Description | Request Body | Response |
|----------|--------|---------------|-------------|--------------|----------|
| `/api/v1/users/profile` | PUT | Yes | Update Profile | `{ firstName, lastName, phone, bio, avatar }` | `{ ... }` |

## 6. Chat (Future/Stub)

### Endpoints
| Endpoint | Method | Auth Required | Description | Request Body | Response |
|----------|--------|---------------|-------------|--------------|----------|
| `/api/v1/chat/messages` | GET | Yes | Get Messages | - | `[{ id, senderId, text, timestamp }]` |
| `/api/v1/chat/messages` | POST | Yes | Send Message | `{ recipientId, text }` | `{ id, ... }` |
