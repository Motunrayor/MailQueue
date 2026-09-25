# MailQueue — Project Overview

**MailQueue** is a full-stack bulk email application built around the capstone topic **Background Job Queue — queue long-running tasks and process them in the background.**

The application allows users to create an account, manage contacts, create email campaigns, select recipients, send campaigns, and monitor email delivery progress.

Instead of sending all emails during the user's request, MailQueue places email tasks in a **background job queue**. For this MVP, the queue is stored in **MongoDB**, and a separate background worker processes the queued jobs. This allows the API to respond quickly while email processing continues separately.

---

## Users

MailQueue has two roles:

### User
- Register and login
- Manage contacts
- Create and manage campaigns
- Select recipients
- Send/queue campaigns
- Monitor campaign progress
- View successful and failed email deliveries

### Admin
- Login
- View registered users
- View campaigns
- View basic application/campaign statistics

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
Oluwasegun Omotosh
Olagunju Quadri
Obinna Ekwealor
Oseni Usman
Motunrayo Fatumo
Okeke Peter
