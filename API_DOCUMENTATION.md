# Zorvyn Finance API Documentation

> [!IMPORTANT]
> **PLEASE NOTE:** This backend is deployed on **Render's Free Tier**. Due to Render's "Cold Start" behavior, the first request after a period of inactivity may take **approx. 1-2 minutes** to spin up. Please be patient and allow the first request to complete. Subsequent requests will be fast!

**Base URL:** `https://zorvyn-finance-backend-sa04.onrender.com`  
**Version:** 1.0.0  
**Content-Type:** `application/json`

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [Users (Admin Only)](#2-users-admin-only)
3. [Records](#3-records)
4. [Dashboard](#4-dashboard)
5. [Standard Response Format](#5-standard-response-format)
6. [Error Codes](#6-error-codes)
7. [Rate Limiting](#7-rate-limiting)

---

## Authentication

All protected routes require a **Bearer Token** in the `Authorization` header:

```
Authorization: Bearer <your_jwt_token>
```

Tokens are issued on register/login and expire after **7 days**.

---

## 1. Authentication

### POST `/api/auth/register`

Register a new user account.

**Auth Required:** No  
**Rate Limit:** 10 requests / 15 min

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "viewer"
}
```

| Field      | Type   | Required | Rules                                      |
|------------|--------|----------|--------------------------------------------|
| `name`     | string | ✅       | Min 2, Max 100 characters                  |
| `email`    | string | ✅       | Must be a valid email                      |
| `password` | string | ✅       | Min 8 characters                           |
| `role`     | string | ✅       | One of: `viewer`, `analyst`, `admin`       |

**Success Response — `201 Created`:**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "cuid_abc123",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "viewer",
      "status": "active",
      "createdAt": "2026-04-03T13:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error — Email already exists `400`:**

```json
{
  "success": false,
  "message": "A user with this email already exists.",
  "data": null
}
```

---

### POST `/api/auth/login`

Login with email and password.

**Auth Required:** No  
**Rate Limit:** 10 requests / 15 min

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

| Field      | Type   | Required |
|------------|--------|----------|
| `email`    | string | ✅       |
| `password` | string | ✅       |

**Success Response — `200 OK`:**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "cuid_abc123",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "viewer",
      "status": "active",
      "createdAt": "2026-04-03T13:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error — Invalid credentials `401`:**

```json
{
  "success": false,
  "message": "Invalid email or password.",
  "data": null
}
```

**Error — Account inactive `403`:**

```json
{
  "success": false,
  "message": "Your account is currently inactive. Please contact support.",
  "data": null
}
```

---

## 2. Users (Admin Only)

> All endpoints in this section require authentication and `admin` role.

---

### GET `/api/users`

Get all users. Optionally filter by role.

**Auth Required:** Yes (`admin`)

**Query Parameters:**

| Param  | Type   | Required | Description                              |
|--------|--------|----------|------------------------------------------|
| `role` | string | No       | Filter by role: `viewer`, `analyst`, `admin` |

**Example:** `GET /api/users?role=viewer`

**Success Response — `200 OK`:**

```json
{
  "success": true,
  "message": "Users fetched successfully",
  "data": [
    {
      "id": "cuid_abc123",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "viewer",
      "status": "active",
      "createdAt": "2026-04-03T13:00:00.000Z"
    }
  ]
}
```

---

### GET `/api/users/:id`

Get a single user by ID.

**Auth Required:** Yes (`admin`)

**Success Response — `200 OK`:**

```json
{
  "success": true,
  "message": "User fetched successfully",
  "data": {
    "id": "cuid_abc123",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "viewer",
    "status": "active",
    "createdAt": "2026-04-03T13:00:00.000Z"
  }
}
```

**Error — Not found `404`:**

```json
{
  "success": false,
  "message": "No user found with that ID.",
  "data": null
}
```

---

### PATCH `/api/users/:id/role`

Update a user's role.

**Auth Required:** Yes (`admin`)

**Request Body:**

```json
{
  "role": "analyst"
}
```

| Field  | Type   | Required | Values                          |
|--------|--------|----------|---------------------------------|
| `role` | string | ✅       | `viewer`, `analyst`, `admin`    |

**Success Response — `200 OK`:**

```json
{
  "success": true,
  "message": "User role updated successfully",
  "data": {
    "id": "cuid_abc123",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "analyst",
    "status": "active",
    "createdAt": "2026-04-03T13:00:00.000Z"
  }
}
```

---

### PATCH `/api/users/:id/status`

Update a user's status (activate or deactivate).

**Auth Required:** Yes (`admin`)

**Request Body:**

```json
{
  "status": "inactive"
}
```

| Field    | Type   | Required | Values              |
|----------|--------|----------|---------------------|
| `status` | string | ✅       | `active`, `inactive` |

**Success Response — `200 OK`:**

```json
{
  "success": true,
  "message": "User status updated successfully",
  "data": {
    "id": "cuid_abc123",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "viewer",
    "status": "inactive",
    "createdAt": "2026-04-03T13:00:00.000Z"
  }
}
```

---

### DELETE `/api/users/:id`

Soft delete a user.

**Auth Required:** Yes (`admin`)

**Success Response — `200 OK`:**

```json
{
  "success": true,
  "message": "User deleted successfully",
  "data": null
}
```

---

## 3. Records

> `viewer` role can only see their own records. `analyst` and `admin` can see all records.

---

### POST `/api/records`

Create a new financial record.

**Auth Required:** Yes (any role)

**Request Body:**

```json
{
  "amount": 5000,
  "type": "income",
  "category": "Salary",
  "date": "2026-04-01T00:00:00.000Z",
  "notes": "Monthly salary"
}
```

| Field      | Type   | Required | Description                        |
|------------|--------|----------|------------------------------------|
| `amount`   | number | ✅       | Positive number                    |
| `type`     | string | ✅       | `income` or `expense`              |
| `category` | string | ✅       | e.g. `Salary`, `Food`, `Rent`      |
| `date`     | string | ✅       | ISO 8601 date string               |
| `notes`    | string | No       | Optional description               |

**Success Response — `201 Created`:**

```json
{
  "success": true,
  "message": "Record created successfully",
  "data": {
    "id": "cuid_xyz789",
    "amount": 5000,
    "type": "income",
    "category": "Salary",
    "date": "2026-04-01T00:00:00.000Z",
    "notes": "Monthly salary",
    "createdAt": "2026-04-03T13:00:00.000Z",
    "updatedAt": "2026-04-03T13:00:00.000Z"
  }
}
```

---

### GET `/api/records`

Get all records with optional filters and pagination.

**Auth Required:** Yes  
- `viewer` → sees only their own records  
- `analyst` / `admin` → sees all records

**Query Parameters:**

| Param       | Type   | Required | Description                          |
|-------------|--------|----------|--------------------------------------|
| `type`      | string | No       | Filter by `income` or `expense`      |
| `category`  | string | No       | Filter by category (case-insensitive)|
| `startDate` | string | No       | ISO date — records on or after       |
| `endDate`   | string | No       | ISO date — records on or before      |
| `page`      | number | No       | Page number (default: `1`)           |
| `limit`     | number | No       | Items per page (default: `10`)       |

**Example:** `GET /api/records?type=expense&category=food&page=1&limit=5`

**Success Response — `200 OK`:**

```json
{
  "success": true,
  "message": "Records fetched successfully",
  "data": {
    "data": [
      {
        "id": "cuid_xyz789",
        "amount": 200,
        "type": "expense",
        "category": "Food",
        "date": "2026-04-01T00:00:00.000Z",
        "notes": "Groceries",
        "createdAt": "2026-04-03T13:00:00.000Z",
        "updatedAt": "2026-04-03T13:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 25,
      "page": 1,
      "limit": 5,
      "totalPages": 5
    }
  }
}
```

---

### GET `/api/records/:id`

Get a single record by ID.

**Auth Required:** Yes

**Success Response — `200 OK`:**

```json
{
  "success": true,
  "message": "Record fetched successfully",
  "data": {
    "id": "cuid_xyz789",
    "amount": 5000,
    "type": "income",
    "category": "Salary",
    "date": "2026-04-01T00:00:00.000Z",
    "notes": "Monthly salary",
    "createdAt": "2026-04-03T13:00:00.000Z",
    "updatedAt": "2026-04-03T13:00:00.000Z"
  }
}
```

**Error — Not found `404`:**

```json
{
  "success": false,
  "message": "No record found with that ID.",
  "data": null
}
```

---

### PATCH `/api/records/:id`

Update an existing record.

**Auth Required:** Yes

**Request Body** (all fields optional):

```json
{
  "amount": 6000,
  "type": "income",
  "category": "Freelance",
  "date": "2026-04-02T00:00:00.000Z",
  "notes": "Updated note"
}
```

**Success Response — `200 OK`:**

```json
{
  "success": true,
  "message": "Record updated successfully",
  "data": {
    "id": "cuid_xyz789",
    "amount": 6000,
    "type": "income",
    "category": "Freelance",
    "date": "2026-04-02T00:00:00.000Z",
    "notes": "Updated note",
    "createdAt": "2026-04-03T13:00:00.000Z",
    "updatedAt": "2026-04-03T14:00:00.000Z"
  }
}
```

---

### DELETE `/api/records/:id`

Soft delete a record (marks as deleted, not permanently removed).

**Auth Required:** Yes

**Success Response — `200 OK`:**

```json
{
  "success": true,
  "message": "Record deleted successfully",
  "data": null
}
```

---

## 4. Dashboard

> Requires authentication and `analyst` or `admin` role.

---

### GET `/api/dashboard/overview`

Get a financial summary with total income, total expenses, net balance, and 5 most recent transactions.

**Auth Required:** Yes (`analyst`, `admin`)

**Success Response — `200 OK`:**

```json
{
  "success": true,
  "message": "Dashboard overview fetched successfully",
  "data": {
    "summary": {
      "totalIncome": 50000,
      "totalExpenses": 20000,
      "netBalance": 30000
    },
    "recent": [
      {
        "id": "cuid_xyz789",
        "amount": 5000,
        "type": "income",
        "category": "Salary",
        "date": "2026-04-01T00:00:00.000Z"
      }
    ]
  }
}
```

---

### GET `/api/dashboard/categories`

Get total amounts grouped by category and type.

**Auth Required:** Yes (`analyst`, `admin`)

**Success Response — `200 OK`:**

```json
{
  "success": true,
  "message": "Category totals fetched successfully",
  "data": [
    {
      "category": "Salary",
      "type": "income",
      "total": 50000
    },
    {
      "category": "Food",
      "type": "expense",
      "total": 8000
    }
  ]
}
```

---

### GET `/api/dashboard/trends`

Get monthly income vs expense trends for the **last 6 months**.

**Auth Required:** Yes (`analyst`, `admin`)

**Success Response — `200 OK`:**

```json
{
  "success": true,
  "message": "Monthly trends fetched successfully",
  "data": [
    {
      "month": "Nov 2025",
      "income": 45000,
      "expense": 18000
    },
    {
      "month": "Dec 2025",
      "income": 50000,
      "expense": 22000
    },
    {
      "month": "Apr 2026",
      "income": 50000,
      "expense": 20000
    }
  ]
}
```

---

## 5. Standard Response Format

Every API response follows this consistent structure:

**Success:**
```json
{
  "success": true,
  "message": "Human readable message",
  "data": { }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Human readable error message",
  "data": null
}
```

---

## 6. Error Codes

| HTTP Status | Meaning                                              |
|-------------|------------------------------------------------------|
| `400`       | Bad Request — validation failed or duplicate data    |
| `401`       | Unauthorized — missing or invalid token              |
| `403`       | Forbidden — valid token but insufficient permissions |
| `404`       | Not Found — resource does not exist                  |
| `429`       | Too Many Requests — rate limit exceeded              |
| `500`       | Internal Server Error — unexpected server error      |

---

## 7. Rate Limiting

| Scope         | Routes         | Limit                    |
|---------------|----------------|--------------------------|
| Global        | All routes     | 100 requests / 15 min    |
| Auth (strict) | `/api/auth/*`  | 10 requests / 15 min     |

When the limit is exceeded, the API responds with `429 Too Many Requests`:

```json
{
  "success": false,
  "message": "Too many requests from this IP, please try again after 15 minutes.",
  "data": null
}
```

Rate limit headers are included in every response:
- `RateLimit-Limit` — max allowed requests
- `RateLimit-Remaining` — remaining requests in window
- `RateLimit-Reset` — timestamp when the window resets

---

## Role Reference

| Role      | Records          | Users     | Dashboard |
|-----------|-----------------|-----------|-----------|
| `viewer`  | Own records only | ❌         | ❌         |
| `analyst` | All records      | ❌         | ✅         |
| `admin`   | All records      | ✅ Full    | ✅         |
