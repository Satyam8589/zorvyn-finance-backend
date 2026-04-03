# 🏦 Zorvyn Finance Backend - Dashboard API

A professional, role-based backend system for financial records management and data-driven insights. Built with Node.js, Express, and Prisma ORM for the Zorvyn FinTech Backend Developer Intern assignment.

## 🚀 Overview

The **Zorvyn Finance Dashboard** is a backend system designed for efficient storage and management of financial entries, user roles, and summary-level analytics. It supports a hierarchical permissions model (Viewer, Analyst, Admin) and provides aggregated insights like income/expense trends and category-wise totals.

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Runtime** | Node.js |
| **Framework** | Express.js |
| **Database** | PostgreSQL (Neon Serverless) |
| **ORM** | Prisma v7 |
| **Authentication** | JWT + bcryptjs |
| **Validation** | Joi |
| **Rate Limiting** | express-rate-limit |
| **Error Handling** | Centralized `AppError` + `asyncHandler` pattern |

---

## 🔐 Roles & Permissions

The system enforces a clear access hierarchy:

| Role | Own Records | All Records | Dashboard Insights | Manage Users |
|---|:---:|:---:|:---:|:---:|
| `viewer`  | ✅ | ❌ | ❌ | ❌ |
| `analyst` | ✅ | ✅ | ✅ | ❌ |
| `admin`   | ✅ | ✅ | ✅ | ✅ |

---

## 📋 API Endpoints

> All protected routes require `Authorization: Bearer <token>` header.
> Full request/response details are in [`API_DOCUMENTATION.md`](./API_DOCUMENTATION.md).

### 🔑 Auth
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register a new account |
| `POST` | `/api/auth/login` | Public | Login and receive a 7-day JWT |

### 💰 Records
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/records` | All roles | Create a new income/expense entry |
| `GET` | `/api/records` | All roles | List filtered & paginated records |
| `GET` | `/api/records/:id` | All roles | Get a single record by ID |
| `PATCH` | `/api/records/:id` | All roles | Update an existing record |
| `DELETE` | `/api/records/:id` | All roles | Soft delete a record |

> `viewer` can only access their **own** records. `analyst` and `admin` can access all records.

### 📊 Dashboard
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/dashboard/overview` | Analyst, Admin | Financial summary + 5 recent entries |
| `GET` | `/api/dashboard/categories` | Analyst, Admin | Category-wise income/expense breakdown |
| `GET` | `/api/dashboard/trends` | Analyst, Admin | Last 6 months income vs expense trends |

### 👤 Users
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/users` | Admin | List all registered users |
| `GET` | `/api/users/:id` | Admin | Get a single user by ID |
| `PATCH` | `/api/users/:id/role` | Admin | Change a user's role |
| `PATCH` | `/api/users/:id/status` | Admin | Activate or deactivate a user |
| `DELETE` | `/api/users/:id` | Admin | Soft delete a user |

---

## 🛡️ Rate Limiting

The API is protected against abuse with IP-based rate limiting:

| Scope | Applies To | Limit |
|---|---|---|
| **Global** | All routes | 100 requests / 15 min |
| **Auth (strict)** | `/api/auth/*` | 10 requests / 15 min |

Exceeding the limit returns `429 Too Many Requests`.

---

## ⚙️ Local Setup

**1. Clone and Install:**
```bash
git clone https://github.com/Satyam8589/zorvyn-finance-backend.git
cd zorvyn-finance-backend
npm install
```

**2. Environment Setup:**

Create a `.env` file in the root:
```env
DATABASE_URL="your_postgresql_connection_string"
JWT_SECRET="your_secure_secret_key"
```

**3. Database Migration & Seed:**
```bash
npx prisma migrate dev --name init
npx prisma db seed
```

**4. Run Dev Server:**
```bash
npm run dev
```

Server starts at `http://localhost:3000`

---

## 📁 Project Structure

```
src/
├── app.js                    # Express app setup, middlewares, routes
├── lib/
│   └── prisma.js             # Prisma client instance
├── middlewares/
│   ├── auth.middleware.js    # JWT authentication
│   ├── role.middleware.js    # Role-based access control
│   ├── error.middleware.js   # Global error handler
│   └── rateLimiter.middleware.js  # Rate limiting (global + auth)
├── modules/
│   ├── auth/                 # Register & Login
│   ├── users/                # User management (Admin only)
│   ├── records/              # Financial records CRUD
│   └── dashboard/            # Analytics & insights
└── utils/
    ├── AppError.js           # Custom operational error class
    ├── asyncHandler.js       # Async error wrapper
    └── response.js           # Standardized API response helper
```

---

## ⚡ Design Decisions & Assumptions

### FinTech Data Precision
Financial amounts are stored as **integers (paisa)** in the database to prevent floating-point precision errors during aggregations.  
Example: `₹1,500.00` → stored as `150000` paisa.

### Soft Deletion
Records and users are never permanently deleted via the standard API to preserve the financial audit trail. An `isDeleted` flag is used, and all queries automatically filter these out.

### Authentication Strategy
A stateless JWT strategy with a **7-day expiration** was chosen for simplicity and ease of testing. Tokens must be passed in the `Authorization: Bearer <token>` header.

### Validation Pattern
Every module (`auth`, `users`, `records`) has its own `validation.js` using **Joi**. This ensures that invalid or malicious data never reaches the service layer or database.

### Rate Limiting
`express-rate-limit` is applied globally (100 req/15 min) with a stricter limit on auth routes (10 req/15 min) to prevent brute force attacks.

---

## 📄 License

This project is for evaluation purposes only.
