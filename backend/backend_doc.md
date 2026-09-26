# MailQueue Backend Developer Guide

This document is the required onboarding and working guide for every developer who will work on this backend project. Read it completely before changing any file.

## 1. Project purpose

This backend project is intended to support a MailQueue application. It should expose REST API endpoints for:

- authentication and user management
- admin operations
- campaign management
- contact management
- email sending and background job processing

At the moment, the project is in a scaffold stage. Several files exist, but most of them are placeholders. Do not assume that routes, controllers, models, or middleware already work.

---

## 2. Required setup before any coding

### Step 1: call for the node_module package

Run this command in the backend folder:

```bash
npm ci
```

If this fails, ensure Node.js and npm are installed properly.

### Step 2: configure environment variables

Create a local environment file from the example:

```bash
copy .env.example .env
```

Then edit the .env file and set:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI= use the conection string fron the group chet
```

Important:

- do not commit your local .env values to source control

### Step 3: verify the app starts

Do not run the project with the current package.json script as-is. The file src/server.js does not exist.

Use either of these commands instead:

```bash
node src/app.js
```

The app should respond on the configured port, and the health route should return a success message.

---

## 3. Important runtime rules for this project

Before touching files, follow these rules exactly:

1. Use CommonJS syntax. The project uses require(...) and module.exports, not ES module import/export.
2. Keep the application modular. Do not place route logic directly inside app.js.
3. Every route must be defined in a route file and then imported into app.js.
4. Every controller should contain request handling logic only; it should call services or model logic when needed.
5. Every model should be a Mongoose schema and exported as a model.
6. Middleware must be implemented separately and attached to routes in the route files.
7. Do not create duplicate logic in multiple places. If a task belongs to the controller layer, keep it there.
8. Write clear error handling with try/catch in async functions.
9. Use consistent naming: camelCase for variables and functions, PascalCase for Mongoose models.

---

## 4. Folder-by-folder responsibilities

### src/config/database.js

This file handles MongoDB connection.

Expected behavior:

- use mongoose.connect(process.env.MONGODB_URI)
- do not hardcode connection strings
- use environment variables only

### src/middleware/

This folder contains security and request processing logic.

Files:

- authMiddleware.js: validate JWT tokens and attach the authenticated user to req.user
- roleMiddleware.js: restrict access to admin or role-specific users
- errorMiddleware.js: centralize error responses

Rules:

- do not implement logic directly in controllers for auth checks
- if a route requires login, guard it with authMiddleware
- if a route requires admin access, guard it with roleMiddleware

#### How to use authMiddleware

The middleware expects the token in the Authorization header using the Bearer format:

```http
Authorization: Bearer <jwt_token>
```

Example route usage:

```js
const express = require("express");
const router = express.Router();
const { authToken } = require("../middleware/authMiddleware");
const { getProfile } = require("../controllers/authController");

router.get("/profile", authToken, getProfile);
module.exports = router;
```

The middleware reads the token, verifies it with `process.env.JWT_SECRET`, and then attaches the decoded payload to `req.user`.

Example controller usage:

```js
exports.getProfile = async (req, res, next) => {
  try {
    const user = req.user;
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};
```

Make sure your `.env` file contains:

```env
JWT_SECRET=your_super_secret_key
```

If the token is missing or invalid, the middleware responds with a 401 or 403 status code.

#### How to use errorMiddleware

The error middleware must be registered after all routes in `src/app.js`:

```js
const { errorMiddleware } = require("./middleware/errorMiddleware");

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/campaigns", campaignRoutes);
app.use(errorMiddleware);
```

Whenever a controller catches an error, pass it to `next(error)` so the central error handler can format the response:

````js
exports.loginUser = async (req, res, next) => {
  try {
    // do login logic
    res.status(200).json({ success: true, message: "Logged in" });
  } catch (error) {
    next(error);
  }
};

Important:

- import the middleware using the correct path: `./middleware/errorMiddleware`
- do not register the error middleware before the routes
- never send raw error objects directly to the client without using the middleware

### src/models/

This folder contains Mongoose schema definitions.

Files to implement:

- User.js
- Campaign.js
- Contact.js
- Job.js
- Notification.js

Note: you can change or add a new file if need after discussing it to your team

Rules:

- use mongoose.Schema
- add timestamps when appropriate
- use relevant validation rules
- do not create raw JavaScript objects as models

### src/controllers/

This folder holds HTTP request handlers.

Files:

- authController.js
- adminController.js
- campaignController.js
- contactController.js

Responsibilities:

- receive request data
- validate input
- call service or model logic
- return proper HTTP responses
- catch errors and forward them to middleware

Do not write database logic directly in this folder if it can be abstracted into a service.

### src/routes/

This folder contains API route definitions.

Files:

- authRoutes.js
- adminRoutes.js
- campaignRoutes.js
- contactRoutes.js

Responsibilities:

- define endpoint paths
- connect routes to controller functions
- apply middleware such as auth and admin checks

Example structure:

```js
const express = require("express");
const router = express.Router();
const { loginUser } = require("../controllers/authController");

router.post("/login", loginUser);

module.exports = router;
````

### src/services/

This folder is for business logic that is not directly tied to Express request/response handling.

File:

- emailService.js

Responsibilities:

- send emails
- prepare message payloads
- handle email provider integration
- centralize logic for campaigns or notifications

## 5 Correct development workflow

Follow this sequence every time you implement a feature:

1. Decide the endpoint path and method.
2. Add or update the route file.
3. Add or update the controller.
4. Add or update the needed model/schema.
5. Add or update service logic if the task requires business logic.
6. Add middleware only if auth, role validation, or centralized error handling is needed.
7. Start the server and test using Postman or curl.
8. Confirm the request and response format.
9. Verify the MongoDB records are being created or updated correctly.

Do not skip from route creation directly to raw database logic without following the layer structure.

---

## 7. What to do before editing any file

Before working on a file, every developer must do the following:

1. read the file’s purpose and its neighboring files
2. identify whether the file is a route, controller, model, middleware, or service
3. make sure the file matches the project architecture
4. check whether the related route is already mounted in src/app.js
5. ensure the change does not duplicate logic already handled elsewhere
6. test the endpoint or behavior after editing

If you are unsure where something belongs, do not invent a new structure. Ask which layer the feature belongs to before making the change.

---

## 8. Required implementation rules

### Database rules

- never hardcode database credentials
- always use environment variables
- validate required fields before saving to MongoDB
- use timestamps and unique indexes where needed

### Auth rules

- use bcryptjs for password hashing
- use jsonwebtoken for JWT creation and verification
- store user role values in a consistent format
- never trust client-supplied role information without server-side validation

### API response rules

Every endpoint should return:

- a clear success or error status code
- a consistent JSON response format
- a helpful message when validation fails

Recommended patterns:

```js
res.status(200).json({ success: true, data: ... });
res.status(201).json({ success: true, message: 'Created successfully', data: ... });
res.status(400).json({ success: false, message: 'Invalid request data' });
res.status(401).json({ success: false, message: 'Unauthorized' });
res.status(500).json({ success: false, message: 'Server error' });
```

### Error handling rules

- wrap async route code in try/catch
- pass errors to the next middleware
- do not leave unhandled promise rejections
- use a central error middleware for final error responses

---

### Priority 1: project bootstrap

- update package scripts if needed
- ensure the app runs from src/app.js
- configure .env correctly
- verify the database connection works
- confirm GET /health works

### Priority 2: core infrastructure

- implement User model
- implement auth middleware
- implement role middleware
- implement error middleware
- wire routes into app.js

### Priority 3: authentication feature

- implement auth routes
- implement auth controller
- add login/register logic
- add JWT generation and password hashing

### Priority 4: campaign and contact features

- implement schema and CRUD endpoints
- validate input carefully
- connect campaigns to contact data structures as needed

---

## 11. Useful validation commands

After implementing features, always test them with at least one of the following:

```bash
npm run dev
```

Then test in Postman or curl:

```bash
curl http://localhost:5000/health
```

Also verify MongoDB inserts/updates appear in the database.

---

## 12. One-line summary for the next developer

Build the backend in layers, keep the app bootable, wire routes correctly, use environment variables for secrets, and test every endpoint before considering it complete.
