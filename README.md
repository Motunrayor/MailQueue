# MailQueue — Project Overview

**MailQueue** is a full-stack bulk email application built around the capstone topic **Background Job Queue — queue long-running tasks and process them in the background.**

The application allows users to create an account, manage contacts, create email campaigns, select recipients, send campaigns, and monitor email delivery progress.

Instead of sending all emails during the user's request, MailQueue places email tasks in a **background job queue**. For this MVP, the queue is stored in **MongoDB**, and a separate background worker processes the queued jobs. This allows the API to respond quickly while email processing continues separately.

---

## Users

MailQueue has two roles:

## Users

MailQueue has two roles:

### User

* Register and login
* Manage contacts
* Create and manage campaigns
* Select recipients
* Send/queue campaigns
* Monitor campaign progress
* View successful and failed email deliveries

### Admin

* Login through the same authentication system
* Access a dedicated admin dashboard
* View registered users
* Search and paginate users
* View application and campaign statistics
* Monitor campaign and background job statuses

## Admin Access

Admin functionality is protected by role-based authorization. Only authenticated users with the `admin` role can access the admin dashboard and admin API endpoints.

### Admin Frontend Routes

* `/admin` — Admin dashboard
* `/admin/users` — User management

### Admin API Endpoints

* `GET /api/admin/stats` — Application, campaign, and job statistics
* `GET /api/admin/users` — Registered users with search, filtering, and pagination
* `GET /api/admin/campaigns` — Campaign information for administrative use

### Creating an Admin

An admin account can be created or promoted using the backend admin seed script.

The following environment variables are required:

```env
ADMIN_EMAIL=your-admin-email
ADMIN_PASSWORD=your-admin-password
ADMIN_FIRSTNAME=Admin
ADMIN_LASTNAME=User
```

The seed script creates/promotes the account with:

```text
role: admin
accountStatus: active
onboardingstatus: completed
```

Admin API routes require authentication and verify that the authenticated account has the `admin` role.


---

## Main Features

- Authentication and authorization
- User and Admin roles
- Contact CRUD
- Campaign CRUD
- Background job queue
- Background email processing
- Job retry/failure handling
- Campaign progress tracking
- Search, filtering, and pagination where appropriate
- Loading and error states
- Responsive frontend
- API documentation
- Basic testing
- Deployment

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React.js, React Router, Axios/Fetch |
| Backend | Node.js and Express.js |
| Database | MongoDB with Mongoose |
| Authentication | JWT and bcrypt |
| Background Queue | MongoDB Job collection with a separate Node.js worker |
| Testing | Jest and Supertest |
| API Documentation | Swagger/OpenAPI |

---

## API Documentation

Start the backend with `cd backend` and `npm run dev`. Swagger UI is available at
`http://localhost:5000/api-docs` (or your configured backend `PORT`). The OpenAPI
document is available at `http://localhost:5000/api-docs.json`.

Use `POST /api/auth/login` in Swagger, copy the returned `token`, and paste the
token into **Authorize** without the `Bearer` prefix. Protected endpoints use
that token, and `/api/admin` endpoints require an admin account. **Try it out**
executes real API requests; campaign delivery requires the separate email worker
(`npm run worker`).

The specification is maintained in `backend/src/config/openapi.js`. Update it
when changing API routes, request bodies, or responses.

## Core Flow

```
Register / Login
       ↓
Manage Contacts
       ↓
Create Campaign
       ↓
Select Recipients
       ↓
Send Campaign
       ↓
Jobs saved to MongoDB Queue
       ↓
API responds immediately
       ↓
Background Worker processes jobs
       ↓
Email status updated
       ↓
User monitors campaign progress
```

---

## Scope Note

MailQueue will remain an **MVP**. The focus is on delivering a complete working product that demonstrates frontend/backend integration, database operations, authentication, CRUD, and — most importantly — **background job processing**.

## Team Members
-Oluwasegun Omotosh
-Olagunju Quadri
-Obinna Ekwealor
-Oseni Usman
-Motunrayo Fatumo
-Okeke Peter
-Imran Muhammad Hamza 
