# Travel Sri Lanka Now - API Documentation

**Base URL:** `http://localhost:8080/api` (Backend Direct) | `http://localhost:4200/api` (Via Nginx Proxy)

**Authentication:** JWT Bearer Token
**Content-Type:** `application/json`

---

## Table of Contents

- [Authentication](#authentication)
- [Public APIs](#public-apis)
  - [Locations](#locations)
  - [Events](#events)
  - [Places](#places)
  - [Gallery](#gallery)
  - [Hero Slides](#hero-slides)
  - [Homepage Sections](#homepage-sections)
  - [More Sections](#more-sections)
  - [Site Settings](#site-settings)
  - [Master Data](#master-data)
  - [Social Media Content](#social-media-content)
  - [Page Header Backgrounds](#page-header-backgrounds)
- [Booking APIs](#booking-apis)
- [Admin APIs](#admin-apis)
  - [Admin - Locations](#admin---locations)
  - [Admin - Events](#admin---events)
  - [Admin - Places](#admin---places)
  - [Admin - Gallery](#admin---gallery)
  - [Admin - Hero Slides](#admin---hero-slides)
  - [Admin - Homepage Sections](#admin---homepage-sections)
  - [Admin - More Sections](#admin---more-sections)
  - [Admin - Master Data](#admin---master-data)
  - [Admin - Site Settings](#admin---site-settings)
  - [Admin - Social Media Content](#admin---social-media-content)
  - [Admin - Page Header Backgrounds](#admin---page-header-backgrounds)
  - [Admin - Media Management](#admin---media-management)
  - [Admin - File Upload](#admin---file-upload)
- [Security Summary](#security-summary)
- [Error Responses](#error-responses)

---

## Authentication

All admin endpoints require a JWT Bearer token in the `Authorization` header:

```
Authorization: Bearer <access_token>
```

### Login

```
POST /api/admin/auth/login
```

**Request Body:**
```json
{
  "username": "string (required)",
  "password": "string (required)"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "accessToken": "eyJhbGciOi...",
  "refreshToken": "eyJhbGciOi...",
  "username": "admin",
  "role": "ADMIN"
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Invalid username or password"
}
```

### Refresh Token

```
POST /api/admin/auth/refresh
```

**Request Body:**
```json
{
  "refresh_token": "eyJhbGciOi..."
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "accessToken": "eyJhbGciOi...(new)",
  "refreshToken": "eyJhbGciOi...(same)",
  "username": "admin",
  "role": "ADMIN"
}
```

### Logout

```
POST /api/admin/auth/logout
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

### Verify Token

```
GET /api/admin/auth/verify
```

**Response (200):**
```json
{
  "valid": true
}
```

---

## Public APIs

> No authentication required for these endpoints.

---

### Locations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/locations` | List all locations (paginated) |
| GET | `/api/locations/{id}` | Get location by ID |
| GET | `/api/locations/featured` | Get featured locations |
| GET | `/api/locations/category/{category}` | Filter by category |
| GET | `/api/locations/region/{region}` | Filter by region |
| GET | `/api/locations/search?q={query}` | Search locations |

**GET /api/locations - Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | int | 0 | Page number (0-based) |
| size | int | 10 | Items per page |
| search | string | - | Search keyword |
| category | string | - | Category filter |

---

### Events

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/events` | List all events (paginated) |
| GET | `/api/events/{id}` | Get event by ID |
| GET | `/api/events/featured` | Get featured events |
| GET | `/api/events/category/{category}` | Filter by category |
| GET | `/api/events/search?q={query}` | Search events |

**GET /api/events - Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | int | 0 | Page number (0-based) |
| size | int | 10 | Items per page |
| search | string | - | Search keyword |
| category | string | - | Category filter |

---

### Places

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/places` | List all places (paginated) |
| GET | `/api/places/{id}` | Get place by ID |
| GET | `/api/places/featured` | Get featured places |
| GET | `/api/places/type/{type}` | Filter by type |
| GET | `/api/places/region/{region}` | Filter by region |
| GET | `/api/places/search?q={query}` | Search places |

**GET /api/places - Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | int | 0 | Page number (0-based) |
| size | int | 10 | Items per page |
| search | string | - | Search keyword |
| type | string | - | Place type filter |
| priceRange | string | - | Price range filter |

---

### Gallery

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/gallery` | List all gallery items (paginated) |
| GET | `/api/gallery/{id}` | Get gallery item by ID |
| GET | `/api/gallery/featured` | Get featured items |
| GET | `/api/gallery/category/{category}` | Filter by category |
| GET | `/api/gallery/search?q={query}` | Search gallery |

**GET /api/gallery - Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | int | 0 | Page number (0-based) |
| size | int | 10 | Items per page |
| search | string | - | Search keyword |
| category | string | - | Category filter |
| type | string | - | Media type filter |

---

### Hero Slides

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/hero-slides` | Get all active hero slides |
| GET | `/api/hero-slides/{id}` | Get hero slide by ID |

---

### Homepage Sections

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/homepage-sections` | Get all active sections |
| GET | `/api/homepage-sections/{id}` | Get section by ID |

---

### More Sections

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/more-sections` | Get all active sections |
| GET | `/api/more-sections/{slug}` | Get section by slug |

---

### Site Settings

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/site-settings` | Get all active settings |
| GET | `/api/site-settings/map` | Get settings as key-value map |
| GET | `/api/site-settings/grouped` | Get settings grouped by category |
| GET | `/api/site-settings/category/{category}` | Get settings by category |
| GET | `/api/site-settings/key/{key}` | Get single setting by key |

**Available Categories:** `CONTACT_EMAIL`, `CONTACT_PHONE`, `CONTACT_ADDRESS`, `SOCIAL_MEDIA`, `BUSINESS_HOURS`, `GENERAL`

---

### Master Data

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/master-data/types` | Get all master data types |
| GET | `/api/master-data/type/{type}` | Get active items by type |
| GET | `/api/master-data/type/{type}/code/{code}` | Get by type and code |

**Available Types:** `EVENT_CATEGORY`, `LOCATION_CATEGORY`, `REGION`, `PLACE_TYPE`, `PRICE_RANGE`, `GALLERY_CATEGORY`, `GALLERY_TYPE`

---

### Social Media Content

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/social-media-content` | Get all active content |
| GET | `/api/social-media-content/{id}` | Get content by ID |

---

### Page Header Backgrounds

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/public/page-header-backgrounds/{pageType}` | Get active background by page type |

**Available Page Types:** `LOCATIONS`, `EVENTS`, `PLACES`, `GALLERY`

---

## Booking APIs

### Create Booking (Public)

```
POST /api/bookings
```

> Note: POST to `/api/bookings/**` is public. The actual controller maps to `/api/events/book` which requires authentication.

### Event Booking

```
POST /api/events/book
```

> Requires authentication.

**Request Body:**
```json
{
  "eventId": 1,
  "eventDateId": 1,
  "participantName": "John Doe",
  "email": "john@example.com",
  "phone": "+94771234567",
  "numberOfPeople": 2,
  "specialRequests": "Vegetarian meals",
  "totalPrice": 150.00
}
```

**Validation Rules:**
| Field | Rule |
|-------|------|
| eventId | Required |
| eventDateId | Required |
| participantName | Required, not blank |
| email | Required, valid email format |
| phone | Required, not blank |
| numberOfPeople | Required, minimum 1 |
| totalPrice | Required, minimum 0 |
| specialRequests | Optional |

**Response (201):**
```json
{
  "id": 1,
  "eventId": 1,
  "eventDateId": 1,
  "participantName": "John Doe",
  "email": "john@example.com",
  "phone": "+94771234567",
  "numberOfPeople": 2,
  "specialRequests": "Vegetarian meals",
  "totalPrice": 150.00,
  "bookingDate": "2025-01-15T10:30:00",
  "status": "PENDING"
}
```

### Booking Management (Requires Auth)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/bookings` | List all bookings |
| GET | `/api/bookings/{id}` | Get booking by ID |
| GET | `/api/bookings/email/{email}` | Get bookings by email |
| GET | `/api/bookings/event/{eventId}` | Get bookings by event |
| PATCH | `/api/bookings/{id}/status?status={status}` | Update booking status |

**Available Booking Statuses:** `PENDING`, `CONFIRMED`, `CANCELLED`

---

## Admin APIs

> All admin endpoints require JWT token with `ADMIN` role.
>
> **Header:** `Authorization: Bearer <access_token>`

---

### Admin - Locations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/locations/paginated` | List locations (paginated) |
| POST | `/api/admin/locations` | Create location |
| PUT | `/api/admin/locations/{id}` | Update location |
| DELETE | `/api/admin/locations/{id}` | Delete location |

**Create/Update Location - Request Body:**
```json
{
  "name": "Sigiriya",
  "description": "Ancient rock fortress...",
  "category": "cultural",
  "region": "central",
  "imageUrl": "https://res.cloudinary.com/...",
  "latitude": 7.957,
  "longitude": 80.7603,
  "featured": true
}
```

---

### Admin - Events

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/events/paginated` | List events (paginated) |
| POST | `/api/admin/events` | Create event |
| PUT | `/api/admin/events/{id}` | Update event |
| DELETE | `/api/admin/events/{id}` | Delete event |

---

### Admin - Places

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/places/paginated` | List places (paginated) |
| POST | `/api/admin/places` | Create place |
| PUT | `/api/admin/places/{id}` | Update place |
| DELETE | `/api/admin/places/{id}` | Delete place |

---

### Admin - Gallery

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/gallery/paginated` | List gallery items (paginated) |
| POST | `/api/admin/gallery` | Create gallery item |
| PUT | `/api/admin/gallery/{id}` | Update gallery item |
| DELETE | `/api/admin/gallery/{id}` | Delete gallery item |

---

### Admin - Hero Slides

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/hero-slides/paginated` | List hero slides (paginated) |
| GET | `/api/admin/hero-slides/{id}` | Get hero slide by ID |
| POST | `/api/admin/hero-slides` | Create hero slide |
| PUT | `/api/admin/hero-slides/{id}` | Update hero slide |
| DELETE | `/api/admin/hero-slides/{id}` | Delete hero slide |
| PATCH | `/api/admin/hero-slides/{id}/toggle-active` | Toggle active status |
| PATCH | `/api/admin/hero-slides/{id}/order` | Update display order |

**Update Display Order - Request Body:**
```json
{
  "displayOrder": 3
}
```

---

### Admin - Homepage Sections

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/homepage-sections` | List all sections |
| GET | `/api/admin/homepage-sections/{id}` | Get section by ID |
| PUT | `/api/admin/homepage-sections/{id}` | Update section |
| PATCH | `/api/admin/homepage-sections/{id}/toggle-active` | Toggle active status |
| PATCH | `/api/admin/homepage-sections/{id}/order` | Update display order |
| PUT | `/api/admin/homepage-sections/reorder` | Reorder all sections |

**Reorder Sections - Request Body:**
```json
[1, 3, 2, 5, 4]
```
> Array of section IDs in desired order.

---

### Admin - More Sections

#### Sections

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/more-sections/paginated` | List sections (paginated) |
| GET | `/api/admin/more-sections/{id}` | Get section by ID |
| POST | `/api/admin/more-sections` | Create section |
| PUT | `/api/admin/more-sections/{id}` | Update section |
| DELETE | `/api/admin/more-sections/{id}` | Delete section |
| PATCH | `/api/admin/more-sections/{id}/toggle-active` | Toggle section active |

#### Section Items

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/more-sections/{sectionId}/items` | List items by section |
| GET | `/api/admin/more-sections/{sectionId}/items/paginated` | List items (paginated) |
| POST | `/api/admin/more-sections/{sectionId}/items` | Create item |
| PUT | `/api/admin/more-sections/items/{itemId}` | Update item |
| DELETE | `/api/admin/more-sections/items/{itemId}` | Delete item |
| PATCH | `/api/admin/more-sections/items/{itemId}/toggle-active` | Toggle item active |

---

### Admin - Master Data

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/master-data` | List all master data |
| GET | `/api/admin/master-data/types` | Get all types |
| GET | `/api/admin/master-data/type/{type}` | Get by type |
| GET | `/api/admin/master-data/{id}` | Get by ID |
| POST | `/api/admin/master-data` | Create master data |
| PUT | `/api/admin/master-data/{id}` | Update master data |
| DELETE | `/api/admin/master-data/{id}` | Delete master data |
| PATCH | `/api/admin/master-data/{id}/toggle-active` | Toggle active status |

---

### Admin - Site Settings

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/site-settings` | List all settings |
| GET | `/api/admin/site-settings/{id}` | Get setting by ID |
| POST | `/api/admin/site-settings` | Create setting |
| PUT | `/api/admin/site-settings/{id}` | Update setting |
| DELETE | `/api/admin/site-settings/{id}` | Delete setting |
| PATCH | `/api/admin/site-settings/{id}/toggle-status` | Toggle active status |

---

### Admin - Social Media Content

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/social-media-content/paginated` | List content (paginated) |
| GET | `/api/admin/social-media-content/{id}` | Get content by ID |
| POST | `/api/admin/social-media-content` | Create content |
| PUT | `/api/admin/social-media-content/{id}` | Update content |
| DELETE | `/api/admin/social-media-content/{id}` | Delete content |
| PATCH | `/api/admin/social-media-content/{id}/toggle-active` | Toggle active |
| PATCH | `/api/admin/social-media-content/{id}/order` | Update display order |

---

### Admin - Page Header Backgrounds

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/page-header-backgrounds` | List all backgrounds |
| GET | `/api/admin/page-header-backgrounds/type/{pageType}` | Get by page type |
| GET | `/api/admin/page-header-backgrounds/{id}` | Get by ID |
| POST | `/api/admin/page-header-backgrounds` | Create background |
| PUT | `/api/admin/page-header-backgrounds/{id}` | Update background |
| DELETE | `/api/admin/page-header-backgrounds/{id}` | Delete background |
| PATCH | `/api/admin/page-header-backgrounds/{id}/activate` | Activate background |
| PATCH | `/api/admin/page-header-backgrounds/{id}/deactivate` | Deactivate background |

---

### Admin - Media Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/media/upload` | Upload single image |
| POST | `/api/admin/media/upload/multiple` | Upload multiple images |
| POST | `/api/admin/media/upload/transform` | Upload with transformation |
| PUT | `/api/admin/media/{id}/replace` | Replace existing image |
| PUT | `/api/admin/media/{id}` | Update metadata |
| POST | `/api/admin/media/{id}/link` | Link media to entity |
| GET | `/api/admin/media/{id}` | Get media by ID |
| GET | `/api/admin/media` | List all media (paginated) |
| GET | `/api/admin/media/type/{type}` | Filter by type (paginated) |
| GET | `/api/admin/media/search?query={q}` | Search media |
| GET | `/api/admin/media/recent` | Get recent uploads |
| GET | `/api/admin/media/entity/{entityType}/{entityId}` | Get media for entity |
| GET | `/api/admin/media/stats` | Get upload statistics |
| GET | `/api/admin/media/{id}/transform` | Get transformed URL |
| DELETE | `/api/admin/media/{id}` | Hard delete media |
| DELETE | `/api/admin/media/{id}/soft` | Soft delete media |
| POST | `/api/admin/media/cleanup?daysOld={days}` | Cleanup unused media |

**Upload Image - Form Data:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| file | File | Yes | Image file (JPEG, PNG, GIF, WebP) |
| mediaType | string | No | Default: `GENERAL` |
| altText | string | No | Alt text for image |
| caption | string | No | Image caption |

**Upload with Transformation - Form Data:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| file | File | Yes | Image file |
| mediaType | string | No | Media type |
| cropX | int | No | Crop X coordinate |
| cropY | int | No | Crop Y coordinate |
| cropWidth | int | No | Crop width |
| cropHeight | int | No | Crop height |
| rotate | int | No | Rotation degrees |
| altText | string | No | Alt text |

**Update Metadata - Request Body:**
```json
{
  "altText": "Beautiful beach sunset",
  "caption": "Mirissa Beach",
  "sortOrder": 1
}
```

**Link to Entity - Request Body:**
```json
{
  "entityType": "LOCATION",
  "entityId": 5
}
```

**Get Transformed URL - Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| width | int | Target width |
| height | int | Target height |
| quality | int | Quality (1-100) |
| crop | string | Crop mode |

**File Upload Constraints:**
- Max file size: 10MB
- Max request size: 50MB
- Allowed types: JPEG, PNG, GIF, WebP

---

### Admin - File Upload (Direct Cloudinary)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/upload/image` | Upload single image |
| POST | `/api/admin/upload/images` | Upload multiple images |
| DELETE | `/api/admin/upload/image?publicId={id}` | Delete image by public ID |

**Upload - Form Data:**
| Field | Type | Required | Default |
|-------|------|----------|---------|
| file / files | File(s) | Yes | - |
| folder | string | No | `travel-sri-lanka` |

**Upload Response:**
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "url": "https://res.cloudinary.com/...",
    "publicId": "travel-sri-lanka/abc123",
    "width": 1920,
    "height": 1080,
    "format": "jpg",
    "bytes": 245678
  }
}
```

---

## Security Summary

### Endpoint Access Matrix

| Endpoint Pattern | Auth Required | Role Required |
|-----------------|---------------|---------------|
| `GET /api/locations/**` | No | - |
| `GET /api/events/**` | No | - |
| `GET /api/places/**` | No | - |
| `GET /api/gallery/**` | No | - |
| `GET /api/master-data/**` | No | - |
| `GET /api/site-settings/**` | No | - |
| `GET /api/hero-slides/**` | No | - |
| `GET /api/homepage-sections/**` | No | - |
| `GET /api/more-sections/**` | No | - |
| `GET /api/social-media-content/**` | No | - |
| `GET /api/public/page-header-backgrounds/**` | No | - |
| `POST /api/bookings/**` | No | - |
| `/api/admin/auth/**` | No | - |
| `/api/admin/**` | Yes | ADMIN |
| All other endpoints | Yes | Any |

### Token Configuration

| Setting | Value |
|---------|-------|
| Algorithm | HS256 |
| Access Token Expiry | 24 hours |
| Refresh Token Expiry | 7 days |

---

## Error Responses

### Validation Error (400)

```json
{
  "status": 400,
  "message": "Validation failed",
  "errors": {
    "email": "Invalid email format",
    "participantName": "Participant name is required"
  },
  "timestamp": "2025-01-15T10:30:00"
}
```

### Unauthorized (401)

```json
{
  "success": false,
  "message": "Invalid username or password"
}
```

### Not Found (404)

```json
{
  "status": 404,
  "message": "Resource not found with id: 99",
  "timestamp": "2025-01-15T10:30:00"
}
```

### Bad Request (400)

```json
{
  "status": 400,
  "message": "Invalid file type. Allowed types: JPEG, PNG, GIF, WebP",
  "timestamp": "2025-01-15T10:30:00"
}
```

### Internal Server Error (500)

```json
{
  "status": 500,
  "message": "An unexpected error occurred",
  "timestamp": "2025-01-15T10:30:00"
}
```

---

## Pagination

Paginated endpoints return Spring's `Page` object:

```json
{
  "content": [...],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 10,
    "sort": { "sorted": false }
  },
  "totalElements": 50,
  "totalPages": 5,
  "last": false,
  "first": true,
  "size": 10,
  "number": 0
}
```

**Common Pagination Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | int | 0 | Page number (0-based) |
| size | int | 10/20 | Items per page |
| sort | string | - | Sort field (e.g., `name,asc`) |

---

## API Count Summary

| Category | Endpoints |
|----------|-----------|
| Authentication | 4 |
| Public (Read-only) | 42 |
| Bookings | 7 |
| Admin - Locations | 4 |
| Admin - Events | 4 |
| Admin - Places | 4 |
| Admin - Gallery | 4 |
| Admin - Hero Slides | 7 |
| Admin - Homepage Sections | 6 |
| Admin - More Sections | 12 |
| Admin - Master Data | 8 |
| Admin - Site Settings | 6 |
| Admin - Social Media Content | 7 |
| Admin - Page Header Backgrounds | 8 |
| Admin - Media Management | 17 |
| Admin - File Upload | 3 |
| **Total** | **126** |
