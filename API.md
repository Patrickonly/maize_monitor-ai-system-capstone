# Smart Maize Insights API (Mobile Integration)

## Base URL
- Local: `http://localhost:3000`
- All endpoints use JSON.

## Authentication
- Protected endpoints require an access token:
  - Header: `Authorization: Bearer <token>`
- If missing/invalid, the API responds with:
  - `401 { "success": false, "message": "No token provided" }`
  - `401 { "success": false, "message": "Invalid or expired token" }`

---

## Health
### GET `/api/health`
**Response 200**
```json
{
  "status": "ok",
  "message": "Smart Maize Insights API is running!",
  "timestamp": "2026-05-04T12:00:00.000Z"
}
```
**Response 405**
```json
{
  "status": "error",
  "message": "Method not allowed",
  "timestamp": "2026-05-04T12:00:00.000Z"
}
```

---

## Auth
### POST `/api/auth/signup`
**Body**
```json
{ "email": "user@example.com", "password": "secret123", "name": "User" }
```
**Response 201**
```json
{
  "success": true,
  "user": { "id": 1, "email": "user@example.com", "name": "User" },
  "token": "<jwt>",
  "message": "Account created successfully"
}
```
**Errors**
- `400 Email, password, and name are required`
- `400 Password must be at least 6 characters`
- `409 User already exists`
- `405 Method not allowed`
- `500 Internal server error`

### POST `/api/auth/login`
**Body**
```json
{ "email": "user@example.com", "password": "secret123" }
```
**Response 200**
```json
{
  "success": true,
  "user": { "id": 1, "email": "user@example.com", "name": "User" },
  "token": "<jwt>",
  "message": "Login successful"
}
```
**Errors**
- `400 Email and password are required`
- `401 Invalid email or password`
- `405 Method not allowed`
- `500 Internal server error`

### GET `/api/auth/verify`
**Headers**
- `Authorization: Bearer <token>`

**Response 200**
```json
{
  "success": true,
  "user": { "id": 1, "email": "user@example.com", "name": "User" },
  "message": "Token is valid"
}
```
**Errors**
- `401 No token provided`
- `401 Invalid or expired token`
- `401 User not found`
- `405 Method not allowed`
- `500 Internal server error`

### PUT `/api/auth/update-profile`
**Headers**
- `Authorization: Bearer <token>`

**Body** (all fields optional — send only what you want to change)
```json
{ "name": "Jane Doe", "email": "new@example.com", "phone": "09987654321" }
```
**Response 200**
```json
{
  "success": true,
  "user": { "id": 1, "email": "new@example.com", "phone": "09987654321", "name": "Jane Doe" },
  "message": "Profile updated successfully"
}
```
**Errors**
- `400 No fields to update`
- `401 No token provided`
- `401 Invalid or expired token`
- `404 User not found`
- `409 Email already in use`
- `409 Phone number already in use`
- `405 Method not allowed`
- `500 Internal server error`

### PUT `/api/auth/change-password`
**Headers**
- `Authorization: Bearer <token>`

**Body**
```json
{ "currentPassword": "oldpass", "newPassword": "newpass123" }
```
**Response 200**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```
**Errors**
- `400 Current password and new password are required`
- `400 New password must be at least 6 characters`
- `401 Current password is incorrect`
- `401 No token provided`
- `401 Invalid or expired token`
- `404 User not found`
- `405 Method not allowed`
- `500 Internal server error`

### DELETE `/api/auth/delete-account`
**Headers**
- `Authorization: Bearer <token>`

**Body**
```json
{ "password": "mypassword" }
```
**Response 200**
```json
{
  "success": true,
  "message": "Account deleted successfully"
}
```
**Errors**
- `400 Password is required`
- `401 Password is incorrect`
- `401 No token provided`
- `401 Invalid or expired token`
- `404 User not found`
- `405 Method not allowed`
- `500 Internal server error`

---

## Analysis (Protected)
### POST `/api/analysis/create`
**Headers**
- `Authorization: Bearer <token>`

**Body (optional)**
```json
{ "sessionName": "Leaf spots after rain" }
```
**Response 201**
```json
{
  "success": true,
  "chatSession": {
    "id": 10,
    "userId": 1,
    "sessionName": "Leaf spots after rain",
    "createdAt": "2026-05-04T12:00:00.000Z"
  },
  "message": "Chat session created successfully"
}
```
**Errors**
- `405 Method not allowed`
- `500 Internal server error`

### POST `/api/analysis/chat`
**Headers**
- `Authorization: Bearer <token>`

**Body**
```json
{
  "chatSessionId": 10,
  "role": "user",
  "content": "Brown spots on lower leaves",
  "imageUrl": "https://example.com/image.jpg"
}
```
**Response 201**
```json
{
  "success": true,
  "message": {
    "id": 55,
    "chatSessionId": 10,
    "role": "user",
    "content": "Brown spots on lower leaves",
    "imageUrl": "https://example.com/image.jpg",
    "analysisResult": null,
    "createdAt": "2026-05-04T12:00:00.000Z"
  },
  "responseMessage": "Message saved successfully"
}
```
**Errors**
- `400 chatSessionId, role, and content are required`
- `403 Chat session not found or unauthorized`
- `405 Method not allowed`
- `500 Internal server error`

### POST `/api/analysis/save-result`
**Headers**
- `Authorization: Bearer <token>`

**Body (required + optional)**
```json
{
  "chatSessionId": 10,
  "imageUrl": "https://example.com/image.jpg",
  "imagePath": "/uploads/1/12345.jpg",
  "diseaseDetected": true,
  "diseaseName": "Northern Leaf Blight",
  "diseaseId": 2,
  "confidenceScore": 91.5,
  "isHealthy": false,
  "modelVersion": "v1",
  "modelProcessingTime": 450,
  "affectedAreaPercentage": 22,
  "treatmentRecommendation": "Apply azoxystrobin",
  "urgencyLevel": "medium"
}
```
**Response 201**
```json
{
  "success": true,
  "analysisResult": {
    "id": 70,
    "messageId": 56,
    "diseaseDetected": true,
    "confidenceScore": 91.5,
    "diseaseName": "Northern Leaf Blight"
  },
  "message": "Analysis result saved successfully"
}
```
**Errors**
- `400 Missing required fields: chatSessionId, imagePath, confidenceScore`
- `403 Chat session not found or unauthorized`
- `405 Method not allowed`
- `500 Internal server error`

### GET `/api/analysis/sessions`
**Headers**
- `Authorization: Bearer <token>`

**Response 200**
```json
{
  "success": true,
  "sessions": [
    {
      "id": 10,
      "sessionName": "Leaf spots after rain",
      "createdAt": "2026-05-04T09:00:00.000Z",
      "updatedAt": "2026-05-04T12:00:00.000Z",
      "messageCount": 4,
      "lastMessage": "Apply fungicide immediately."
    }
  ],
  "message": "Sessions retrieved successfully"
}
```
**Errors**
- `405 Method not allowed`
- `500 Internal server error`

### GET `/api/analysis/messages?chatSessionId=10`
**Headers**
- `Authorization: Bearer <token>`

**Response 200**
```json
{
  "success": true,
  "messages": [
    {
      "id": 55,
      "role": "user",
      "content": "Brown spots on lower leaves",
      "imageUrl": "https://example.com/image.jpg",
      "createdAt": "2026-05-04T12:00:00.000Z"
    }
  ],
  "message": "Messages retrieved successfully"
}
```
**Errors**
- `400 chatSessionId is required`
- `403 Chat session not found or unauthorized`
- `405 Method not allowed`
- `500 Internal server error`

---

## Analytics (Protected)
### GET `/api/analytics/statistics`
**Headers**
- `Authorization: Bearer <token>`

**Response 200**
```json
{
  "success": true,
  "statistics": {
    "total_chat_sessions": 5,
    "total_analyses": 12,
    "diseases_detected": 7,
    "average_confidence": 86.4
  },
  "diseaseStats": [
    {
      "id": 2,
      "name": "Northern Leaf Blight",
      "severity_level": "high",
      "detection_count": 3,
      "avg_confidence": 90.2,
      "last_detected": "2026-05-04T11:00:00.000Z",
      "this_month_count": 3
    }
  ],
  "fieldAnalysis": [],
  "message": "Statistics retrieved successfully"
}
```
**Errors**
- `405 Method not allowed`
- `500 Internal server error`

---

## Diseases (Protected)
### GET `/api/diseases/list`
**Headers**
- `Authorization: Bearer <token>`

**Response 200**
```json
{
  "success": true,
  "diseases": [],
  "message": "Diseases retrieved successfully"
}
```

### POST `/api/diseases/list`
**Headers**
- `Authorization: Bearer <token>`

**Body**
```json
{
  "name": "Northern Leaf Blight",
  "scientific_name": "Exserohilum turcicum",
  "description": "Fungal disease",
  "severity_level": "high",
  "crop_type": "maize",
  "symptoms": "Cigar-shaped lesions",
  "treatment_recommendation": "Apply azoxystrobin",
  "prevention_methods": "Rotate crops"
}
```
**Response 201**
```json
{
  "success": true,
  "message": "Disease created successfully"
}
```
**Errors**
- `400 Disease name and crop type are required`
- `405 Method not allowed`
- `500 Internal server error`

---

## Fields (Protected, Disabled)
### GET `/api/fields/manage`
**Response 200**
```json
{
  "success": true,
  "fields": [],
  "message": "Field module is disabled in the current simplified database schema"
}
```

### POST `/api/fields/manage`
**Response 400**
```json
{
  "success": false,
  "message": "Field module is disabled in the current simplified database schema"
}
```

---

## Treatments (Protected, Disabled)
### GET `/api/treatments/manage`
**Response 200**
```json
{
  "success": true,
  "treatments": [],
  "message": "Treatment module is disabled in the current simplified database schema"
}
```

### POST `/api/treatments/manage`
**Response 400**
```json
{
  "success": false,
  "message": "Treatment module is disabled in the current simplified database schema"
}
```

---

## ML Models (Public, Disabled)
### GET `/api/ml-models/list`
**Response 200**
```json
{
  "success": true,
  "models": [],
  "message": "ML model module is disabled in the current simplified database schema"
}
```

### POST `/api/ml-models/list`
**Body**
```json
{
  "model_name": "MaizeNet",
  "model_version": "v1",
  "model_type": "CNN",
  "framework": "TensorFlow",
  "accuracy_score": 0.92,
  "precision": 0.9,
  "recall": 0.88,
  "f1_score": 0.89,
  "supported_diseases": ["NLB"],
  "input_shape": "224x224"
}
```
**Response 400**
```json
{
  "success": false,
  "message": "ML model module is disabled in the current simplified database schema"
}
```

---

## Upload (Protected)
### POST `/api/upload/image`
**Headers**
- `Authorization: Bearer <token>`

**Body**
```json
{
  "imageData": "data:image/jpeg;base64,...",
  "fileName": "leaf.jpg",
  "chatSessionId": 10
}
```
**Response 200**
```json
{
  "success": true,
  "imagePath": "/uploads/1/1714820000000-leaf.jpg",
  "message": "Image path generated successfully"
}
```
**Errors**
- `400 Image data and file name are required`
- `403 Chat session not found or unauthorized`
- `405 Method not allowed`
- `500 Internal server error`

---

## Admin (Users)
### GET `/api/admin/users`
**Headers**
- `Authorization: Bearer <token>`

**Response 200**
```json
{
  "success": true,
  "data": [
    { "id": 1, "email": "admin@example.com", "name": "Admin", "role": "admin", "is_active": true, "created_at": "2026-05-01T10:00:00.000Z" }
  ]
}
```
**Errors**
- `401 Unauthorized: Missing authorization header`
- `403 Unauthorized: Admin access required`
- `405 Method not allowed`
- `500 Internal server error`

### POST `/api/admin/users`
**Headers**
- `Authorization: Bearer <token>`

**Body**
```json
{ "action": "update-role", "targetUserId": 2, "newRole": "admin" }
```
or
```json
{ "action": "deactivate", "targetUserId": 2 }
```
or
```json
{ "action": "activate", "targetUserId": 2 }
```

**Response 200**
```json
{ "success": true, "data": { "success": true, "message": "User role updated to admin" } }
```
**Errors**
- `400 Missing targetUserId or newRole`
- `400 Invalid action`
- `401 Unauthorized: Missing authorization header`
- `403 Unauthorized: Admin access required`
- `500 Internal server error`

---

## Common Notes
- All responses are JSON.
- When a method is not allowed, the API returns `405` with a message.
- Protected routes require a valid JWT token from login/signup.
