# Event Tracker API Documentation

## Base URL
Default: `http://localhost:3000/api/v1`

## Authentication
None required for this version.

## Endpoints

### 1. Ingest User Activity
`POST /activities`

#### Description
Ingests a user activity event for asynchronous processing.

#### Rate Limiting
Maximum 50 requests per 60 seconds per unique client IP address.

#### Request Body
The request must be a JSON object with the following fields:

| Field | Type | Description |
| :--- | :--- | :--- |
| `userId` | String (UUID) | Unique identifier for the user. |
| `eventType` | String | Type of event (e.g., `user_login`, `page_view`). |
| `timestamp` | String (ISO-8601) | The time when the event occurred. |
| `payload` | Object | Additional data related to the event. |

**Example Request:**
```json
{
    "userId": "a1b2c3d4-e5f6-4890-8234-567890abcdef",
    "eventType": "user_login",
    "timestamp": "2023-10-27T10:00:00Z",
    "payload": {
        "ipAddress": "192.168.1.1",
        "device": "desktop",
        "browser": "Chrome"
    }
}
```

#### Responses

| Status Code | Description | Payload Body |
| :--- | :--- | :--- |
| **202 Accepted** | Event successfully received and queued for processing. | `{"message": "Event successfully received and queued"}` |
| **400 Bad Request** | Invalid input payload (e.g., missing fields, invalid UUID). | `{"error": "Bad Request", "message": "error details"}` |
| **429 Too Many Requests** | Rate limit exceeded. | `{"error": "Too Many Requests", "message": "...", "retryAfter": 45}` |
| **500 Internal Server Error** | Unexpected server-side error. | `{"error": "Internal Server Error", ...}` |

#### Response Headers (for 429)
The `Retry-After` header will be included, indicating the seconds remaining until the next request is allowed.

---

### 2. Health Check
`GET /health`

#### Description
Returns the health status of the API service.

#### Response
**200 OK**
```json
{
    "status": "UP",
    "timestamp": "2023-10-27T10:00:00.000Z"
}
```
