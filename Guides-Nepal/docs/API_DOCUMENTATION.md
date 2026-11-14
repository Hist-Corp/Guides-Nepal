# Guides Nepal API Documentation

## Overview
The Guides Nepal API is a RESTful API built with FastAPI that provides endpoints for managing guides, experiences, bookings, and user authentication.

## Base URL
```
http://localhost:8000/api/v1
```

## Authentication
The API uses JWT tokens for authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### Authentication

#### Register User
```http
POST /auth/register
```
**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "password": "securepassword",
  "role": "traveler"
}
```
**Response:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "role": "traveler"
  }
}
```

#### Login
```http
POST /auth/login
```
**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword",
  "role": "traveler"
}
```
**Response:** Same as register

#### Refresh Token
```http
POST /auth/refresh
```
**Request Body:**
```json
{
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```
**Response:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

#### Get Current User
```http
GET /auth/me
```
**Headers:** `Authorization: Bearer <token>`
**Response:**
```json
{
  "id": 1,
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "role": "traveler"
}
```

### Guides (Public)

#### List All Guides
```http
GET /guides
```
**Query Parameters:**
- `city` (optional): Filter by city
- `limit` (optional): Number of results to return
- `offset` (optional): Number of results to skip

**Response:**
```json
[
  {
    "id": 1,
    "name": "Apicha",
    "image": "https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=128&h=128&q=80",
    "role": "Street Food Specialist",
    "rating": 4.8,
    "reviews": 124,
    "languages": ["English", "Nepali"],
    "verified": true,
    "lives_in": "Kathmandu"
  }
]
```

#### Get Guide Details
```http
GET /guides/{id}
```
**Response:**
```json
{
  "id": 1,
  "name": "Apicha",
  "image": "https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=128&h=128&q=80",
  "role": "Street Food Specialist",
  "rating": 4.8,
  "reviews": 124,
  "bio": "Passionate about sharing the authentic flavors of Kathmandu street food...",
  "languages": ["English", "Nepali", "Hindi"],
  "verified": true,
  "lives_in": "Kathmandu",
  "cities": ["Kathmandu", "Patan"],
  "gallery": [
    "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400&q=80",
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=80"
  ],
  "is_active": true
}
```

### Experiences (Public)

#### List Experiences
```http
GET /experiences
```
**Query Parameters:**
- `city` (optional): Filter by city
- `type` (optional): Filter by experience type
- `search` (optional): Search term

**Response:**
```json
[
  {
    "id": 1,
    "slug": "kathmandu-street-food-tour",
    "title": "Kathmandu Street Food Tour",
    "price": 45,
    "duration": "3 hours",
    "rating": 4.9,
    "reviews": 89,
    "heroImage": "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&q=80",
    "city": "Kathmandu",
    "type": "food-tour"
  }
]
```

#### Get Experience Details
```http
GET /experiences/{slug}
```
**Response:**
```json
{
  "id": 1,
  "title": "Kathmandu Street Food Tour",
  "slug": "kathmandu-street-food-tour",
  "description": "Discover the authentic flavors of Kathmandu...",
  "price": 45,
  "duration": "3 hours",
  "city": "Kathmandu",
  "rating": 4.9,
  "reviews": 89,
  "heroImage": "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&q=80",
  "gallery": [
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=80"
  ],
  "host": {
    "id": 1,
    "name": "Apicha",
    "image": "https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=128&h=128&q=80",
    "rating": 4.8,
    "reviews": 124
  },
  "guides": [
    {
      "id": 1,
      "name": "Apicha",
      "image": "https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=128&h=128&q=80",
      "role": "Street Food Specialist"
    }
  ],
  "tourStructure": {
    "meetingPoint": "Thamel Chowk",
    "startTime": "10:00 AM",
    "groupSize": "2-8 people",
    "inclusions": ["Food tastings", "Local guide", "Bottled water"],
    "exclusions": ["Personal expenses", "Tips"]
  }
}
```

### Bookings (Protected)

#### Get User Bookings
```http
GET /bookings
```
**Headers:** `Authorization: Bearer <token>`
**Response:**
```json
[
  {
    "id": 1,
    "experienceId": 1,
    "title": "Kathmandu Street Food Tour",
    "city": "Kathmandu",
    "date": "2024-03-15",
    "guests": 2,
    "price": 90,
    "status": "upcoming",
    "image": "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400&q=80"
  }
]
```

#### Create Booking
```http
POST /bookings
```
**Headers:** `Authorization: Bearer <token>`
**Request Body:**
```json
{
  "experienceId": 1,
  "date": "2024-03-15",
  "guests": 2,
  "price": 90,
  "guideId": 1
}
```
**Response:**
```json
{
  "id": 1,
  "experienceId": 1,
  "status": "upcoming",
  "date": "2024-03-15",
  "guests": 2,
  "price": 90,
  "createdAt": "2024-03-01T10:00:00Z"
}
```

#### Cancel Booking
```http
POST /bookings/{id}/cancel
```
**Headers:** `Authorization: Bearer <token>`
**Response:**
```json
{
  "id": 1,
  "status": "cancelled"
}
```

### User Profile (Protected)

#### Get Current Profile
```http
GET /profile/me
```
**Headers:** `Authorization: Bearer <token>`
**Response:**
```json
{
  "id": 1,
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "bio": "Travel enthusiast exploring Nepal...",
  "avatar_url": "https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=200&q=80",
  "created_at": "2024-01-01T00:00:00Z"
}
```

#### Update Profile
```http
PATCH /profile/me
```
**Headers:** `Authorization: Bearer <token>`
**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "phone": "+1234567890",
  "bio": "Updated bio..."
}
```
**Response:** Updated profile object

#### Upload Avatar
```http
POST /profile/photos/upload
```
**Headers:** `Authorization: Bearer <token>`
**Request Body:** Multipart form data with `file` field
**Response:**
```json
{
  "url": "https://your-domain.com/uploads/123/avatar.jpg"
}
```

#### Get Bookmarks
```http
GET /profile/bookmarks
```
**Headers:** `Authorization: Bearer <token>`
**Response:**
```json
[
  {
    "id": 1,
    "title": "Kathmandu Street Food Tour",
    "city": "Kathmandu",
    "image": "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400&q=80",
    "link": "/experiences/kathmandu-street-food-tour",
    "created_at": "2024-03-01T10:00:00Z"
  }
]
```

#### Add Bookmark
```http
POST /profile/bookmarks
```
**Headers:** `Authorization: Bearer <token>`
**Request Body:**
```json
{
  "title": "Kathmandu Street Food Tour",
  "city": "Kathmandu",
  "image": "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400&q=80",
  "link": "/experiences/kathmandu-street-food-tour"
}
```
**Response:** Created bookmark object

#### Delete Bookmark
```http
DELETE /profile/bookmarks/{bookmark_id}
```
**Headers:** `Authorization: Bearer <token>`
**Response:** HTTP 204 No Content

### AI Chat

#### Non-Streaming Chat
```http
POST /ai/chat
```
**Request Body:**
```json
{
  "message": "What are the best places to visit in Kathmandu?",
  "context": "travel-planning"
}
```
**Response:**
```json
{
  "response": "Here are some must-visit places in Kathmandu:...",
  "provider": "ollama"
}
```

#### Streaming Chat
```http
POST /ai/chat/stream
```
**Request Body:** Same as non-streaming
**Response:** Text stream with tokens

## Error Responses

### 400 Bad Request
```json
{
  "detail": "Invalid request parameters"
}
```

### 401 Unauthorized
```json
{
  "detail": "Could not validate credentials"
}
```

### 404 Not Found
```json
{
  "detail": "Guide not found"
}
```

### 422 Validation Error
```json
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "value is not a valid email address",
      "type": "value_error.email"
    }
  ]
}
```

## Rate Limiting
- Public endpoints: 100 requests per minute
- Protected endpoints: 60 requests per minute
- AI chat endpoints: 30 requests per minute

## CORS Configuration
- Allowed origins configured in backend settings
- Supports credentials for authenticated requests

## Health Check
```http
GET /health
```
**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-03-01T10:00:00Z"
}
```

---

For more information, see the [Backend Documentation](../backend/docs/backend-guide.md) and [API Contract](../backend/docs/api-contract.md).