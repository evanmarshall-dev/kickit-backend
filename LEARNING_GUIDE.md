# KickIt Backend - Comprehensive Engineering Guide

> **Author:** Fullstack Engineer
> **Purpose:** A detailed learning document for junior engineers entering the industry
> **Project:** KickIt - A bucket list/adventure tracking application backend API

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture Fundamentals](#architecture-fundamentals)
3. [Technology Stack Deep Dive](#technology-stack-deep-dive)
4. [Project Structure & Organization](#project-structure--organization)
5. [Core Concepts](#core-concepts)
6. [Authentication & Security](#authentication--security)
7. [Database Design & Mongoose](#database-design--mongoose)
8. [RESTful API Design](#restful-api-design)
9. [Middleware Patterns](#middleware-patterns)
10. [Error Handling Best Practices](#error-handling-best-practices)
11. [Code Walkthrough](#code-walkthrough)
12. [Testing Strategies](#testing-strategies)
13. [Deployment & DevOps](#deployment--devops)
14. [Industry Best Practices](#industry-best-practices)
15. [Common Pitfalls & Solutions](#common-pitfalls--solutions)
16. [Next Steps & Career Growth](#next-steps--career-growth)

---

## Project Overview

### What is KickIt?

KickIt is a full-stack web application that allows users to create, manage, and track their "bucket list" adventures (called "kicks"). Users can:

- Create kicks with categories (Travel, Skills, Personal, Career, etc.)
- Track progress with statuses (Open, Completed)
- Add comments to kicks
- Set target dates and locations
- View their personal kick collection

### Business Logic

The application implements a **user-centric** model where:

- Each user owns their kicks
- Only the owner can modify/delete their kicks
- Users can comment on kicks
- Authentication is required for all operations (except signup/signin)

---

## Architecture Fundamentals

### What is a Backend API?

Think of a backend API as a **restaurant kitchen**:

- The frontend (dining room) sends orders (HTTP requests)
- The backend (kitchen) processes orders and prepares dishes (data)
- The database (pantry) stores ingredients (persistent data)
- The API routes are like menu items - predefined ways to request data

### The Request-Response Cycle

```
Client (Browser/Mobile App)
    ↓ HTTP Request (e.g., POST /kicks)
Express Server (Our API)
    ↓ Route Handler
Middleware (Authentication, Validation)
    ↓
Controller Logic
    ↓
Database Query (MongoDB)
    ↓
Response (JSON data)
    ↑
Client receives data
```

### MVC Pattern (Modified for API)

This project follows a **Model-Controller** pattern:

- **Models** (`models/`): Define data structure and database schema
- **Controllers** (`controllers/`): Handle business logic and HTTP requests
- **Middleware** (`middleware/`): Process requests before they reach controllers

**Why no "View"?** In a REST API, we return JSON data, not HTML views. The frontend (separate React app) handles the "View" layer.

---

## Technology Stack Deep Dive

### 1. Node.js

**What it is:** A JavaScript runtime built on Chrome's V8 engine that allows you to run JavaScript on the server.

**Why we use it:**

- JavaScript everywhere (frontend + backend)
- Non-blocking I/O (handles many concurrent requests efficiently)
- Massive ecosystem (npm packages)
- Fast development cycle

**Key Concept - Event Loop:**
Node.js uses a single-threaded event loop. When you make a database query, Node doesn't wait (block) - it continues processing other requests and handles the database response when it's ready.

```javascript
// ❌ BAD (Blocking - doesn't exist in Node.js)
const result = database.querySync("SELECT * FROM users");
console.log(result);

// ✅ GOOD (Non-blocking - async/await)
const result = await database.query("SELECT * FROM users");
console.log(result);
```

### 2. Express.js

**What it is:** A minimal, flexible web application framework for Node.js.

**Why we use it:**

- Simplifies routing (matching URLs to functions)
- Powerful middleware system
- Industry standard (most jobs use it)
- Large community and resources

**Core Concepts:**

```javascript
const express = require("express");
const app = express();

// Middleware - runs for every request
app.use(express.json()); // Parses JSON request bodies

// Route - specific endpoint
app.get("/api/data", (req, res) => {
  res.json({ message: "Hello" });
});

// Start server
app.listen(3000);
```

### 3. MongoDB & Mongoose

**MongoDB:** A NoSQL database that stores data as documents (similar to JSON objects).

**Mongoose:** An ODM (Object Data Modeling) library that provides:

- Schema definition (structure for documents)
- Validation (ensure data integrity)
- Type casting (convert strings to numbers, etc.)
- Query building (easier database operations)

**Why NoSQL for this project:**

- Flexible schema (easy to add new fields)
- Natural fit for JavaScript objects
- Scalable for growing data

**Document Structure Example:**

```javascript
// A "kick" document in MongoDB
{
  _id: ObjectId("507f1f77bcf86cd799439011"),
  title: "Learn Rock Climbing",
  category: "Adventure",
  status: "Open",
  author: ObjectId("507f1f77bcf86cd799439012"),
  comments: [
    {
      _id: ObjectId("507f1f77bcf86cd799439013"),
      text: "Let's do it!",
      author: ObjectId("507f1f77bcf86cd799439012")
    }
  ],
  createdAt: ISODate("2025-01-15T10:30:00Z"),
  updatedAt: ISODate("2025-01-15T10:30:00Z")
}
```

### 4. Additional Dependencies

| Package        | Purpose                         | Why It Matters                                   |
| -------------- | ------------------------------- | ------------------------------------------------ |
| `bcrypt`       | Password hashing                | Security - never store plain passwords           |
| `jsonwebtoken` | JWT token generation            | Stateless authentication                         |
| `cors`         | Cross-Origin Resource Sharing   | Allows frontend (different domain) to access API |
| `dotenv`       | Environment variable management | Keep secrets out of code                         |

---

## Project Structure & Organization

```
kickit-backend/
├── server.js              # Entry point - starts the server
├── .env                   # Environment variables (NOT in git)
├── package.json           # Dependencies and scripts
├── controllers/           # Business logic and route handlers
│   ├── AuthController.js  # Signup, signin
│   ├── KickController.js  # CRUD operations for kicks
│   └── UserController.js  # User profile operations
├── models/                # Database schemas
│   ├── User.js            # User model
│   └── Kick.js            # Kick model with comments subdocument
└── middleware/            # Request processing functions
    └── verifyToken.js     # JWT authentication
```

### Why This Structure?

**Separation of Concerns:** Each file has a single responsibility.

- **Controllers:** "How do we handle this HTTP request?"
- **Models:** "What does this data look like?"
- **Middleware:** "What checks/modifications do we apply to requests?"

**Scalability:** Easy to add new features:

- New feature = new controller
- New data type = new model
- New check = new middleware

**Team Collaboration:** Multiple developers can work on different controllers without conflicts.

---

## Core Concepts

### 1. Environment Variables

**Problem:** We need different settings for development vs. production (database URLs, API keys, ports).

**Solution:** Store configuration in environment variables.

```javascript
// server.js
require("dotenv").config(); // Loads .env file into process.env

const port = process.env.PORT || 1986; // Use PORT from .env or default
const dbUri = process.env.MONGODB_URI; // Database connection string
```

**`.env` file (example):**

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/kickit
JWT_SECRET=your-secret-key-here
```

**⚠️ CRITICAL:** Never commit `.env` to git! Add it to `.gitignore`.

### 2. Asynchronous JavaScript (async/await)

**Why it matters:** Database operations, API calls, and file I/O are slow. We need to handle them without blocking the server.

**Evolution:**

```javascript
// Old way: Callbacks (callback hell)
User.findOne({ username: "john" }, (err, user) => {
  if (err) {
    console.error(err);
  } else {
    Kick.find({ author: user._id }, (err, kicks) => {
      if (err) {
        console.error(err);
      } else {
        console.log(kicks);
      }
    });
  }
});

// Modern way: async/await (clean and readable)
async function getUserKicks() {
  try {
    const user = await User.findOne({ username: "john" });
    const kicks = await Kick.find({ author: user._id });
    console.log(kicks);
  } catch (err) {
    console.error(err);
  }
}
```

**Key Rules:**

1. `await` can only be used inside `async` functions
2. Always wrap in `try/catch` for error handling
3. `await` pauses execution until the promise resolves

### 3. HTTP Methods & REST

**REST** (Representational State Transfer) is an architectural style for APIs.

| Method | Purpose                | Example                   | Idempotent? |
| ------ | ---------------------- | ------------------------- | ----------- |
| GET    | Retrieve data          | `GET /kicks`              | Yes         |
| POST   | Create new resource    | `POST /kicks`             | No          |
| PUT    | Update entire resource | `PUT /kicks/123`          | Yes         |
| PATCH  | Partial update         | `PATCH /kicks/123/status` | Yes         |
| DELETE | Remove resource        | `DELETE /kicks/123`       | Yes         |

**Idempotent:** Making the same request multiple times produces the same result.

**Our API Endpoints:**

```
Authentication:
  POST   /auth/signup         - Create new user account
  POST   /auth/signin         - Login existing user

Users:
  GET    /users               - List all users
  GET    /users/:userId       - Get specific user

Kicks (Adventures):
  POST   /kicks               - Create new kick
  GET    /kicks               - Get all kicks for logged-in user
  GET    /kicks/:kickId       - Get specific kick
  PUT    /kicks/:kickId       - Update entire kick
  PATCH  /kicks/:kickId/status - Update just the status
  DELETE /kicks/:kickId       - Delete kick

Comments:
  POST   /kicks/:kickId/comments              - Add comment
  PUT    /kicks/:kickId/comments/:commentId   - Edit comment
  DELETE /kicks/:kickId/comments/:commentId   - Delete comment
```

### 4. Status Codes

HTTP status codes tell the client what happened:

| Code | Meaning               | When to Use                               |
| ---- | --------------------- | ----------------------------------------- |
| 200  | OK                    | Successful GET, PUT, PATCH                |
| 201  | Created               | Successful POST (new resource created)    |
| 400  | Bad Request           | Invalid input from client                 |
| 401  | Unauthorized          | Missing or invalid authentication         |
| 403  | Forbidden             | Authenticated but not authorized          |
| 404  | Not Found             | Resource doesn't exist                    |
| 409  | Conflict              | Duplicate resource (e.g., username taken) |
| 500  | Internal Server Error | Unexpected server error                   |

**Example:**

```javascript
// 201 - Created
res.status(201).json({ message: "Kick created", kick: newKick });

// 404 - Not Found
res.status(404).json({ error: "Kick not found" });

// 400 - Bad Request
res.status(400).json({ error: "Missing required field: title" });
```

---

## Authentication & Security

### Why Authentication?

Without authentication:

- Anyone could delete any user's kicks
- No way to know who created what
- No privacy or data protection

### JWT (JSON Web Tokens)

**What is a JWT?**
A JWT is a compact, URL-safe means of representing claims (user information) to be transferred between two parties.

**Structure:**

```
header.payload.signature

Example:
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjp7InVzZXJuYW1lIjoiam9obiIsIl9pZCI6IjEyMyJ9fQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

**Components:**

1. **Header:** Algorithm and token type
2. **Payload:** User data (not sensitive!)
3. **Signature:** Verifies token hasn't been tampered with

### Authentication Flow

```
1. User Signs Up/Signs In
   Client → POST /auth/signup → Server

2. Server Creates JWT
   - Hash password with bcrypt
   - Create user in database
   - Generate JWT with user info
   - Send JWT back to client

3. Client Stores JWT
   - Usually in localStorage or httpOnly cookie
   - Sends with every subsequent request

4. Client Makes Authenticated Request
   Client → GET /kicks (with JWT in header) → Server

5. Server Verifies JWT
   - Extract token from Authorization header
   - Verify signature with secret key
   - Decode user info from payload
   - Attach user to request object
   - Continue to route handler
```

### Password Security with bcrypt

**NEVER store plain text passwords!**

```javascript
// Signup - Hash password before saving
const saltRounds = 12; // Higher = more secure but slower
const hashedPassword = bcrypt.hashSync(plainPassword, saltRounds);

// Signin - Compare plain password with hash
const isValid = bcrypt.compareSync(plainPassword, hashedPassword);
```

**How bcrypt works:**

1. **Salt:** Random data added to password before hashing (prevents rainbow table attacks)
2. **Rounds:** Number of times the hash is computed (12 rounds = 2^12 iterations)
3. **One-way:** Can't reverse the hash to get the original password

### Implementation in KickIt

**Signup Process (`AuthController.js`):**

```javascript
router.post("/signup", async (req, res) => {
  try {
    // 1. Validate input
    if (!req.body.username || !req.body.password) {
      return res.status(400).json({ err: "Missing required fields" });
    }

    // 2. Check if user already exists
    const existingUser = await User.findOne({ username: req.body.username });
    if (existingUser) {
      return res.status(409).json({ err: "Username taken" });
    }

    // 3. Hash password and create user
    const user = await User.create({
      username: req.body.username,
      hashedPassword: bcrypt.hashSync(req.body.password, saltRounds),
    });

    // 4. Generate JWT
    const token = jwt.sign(
      { payload: { username: user.username, _id: user._id } },
      process.env.JWT_SECRET
    );

    // 5. Send token to client
    res.status(201).json({ token, user });
  } catch (err) {
    res.status(500).json({ err: "Signup failed" });
  }
});
```

**Token Verification Middleware (`verifyToken.js`):**

```javascript
function verifyToken(req, res, next) {
  try {
    // 1. Extract token from Authorization header
    const token = req.headers.authorization.split(" ")[1];
    // Expected format: "Bearer eyJhbGciOiJI..."

    // 2. Verify and decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Attach user info to request
    req.user = decoded.payload; // { username: "john", _id: "123" }

    // 4. Continue to next middleware/route handler
    next();
  } catch (err) {
    res.status(401).json({ err: "Invalid token" });
  }
}
```

**Using the Middleware:**

```javascript
// Apply to all routes in KickController
router.use(verifyToken);

// Now all kick routes require authentication
router.post("/", async (req, res) => {
  // req.user is available here!
  const kick = await Kick.create({
    title: req.body.title,
    author: req.user._id, // User ID from verified token
  });
});
```

---

## Database Design & Mongoose

### Schema Design

**User Model (`models/User.js`):**

```javascript
const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    hashedPassword: { type: String, required: true },
  },
  { timestamps: true } // Adds createdAt and updatedAt
);

// Transform JSON output to hide password
userSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    delete returnedObject.hashedPassword;
  },
});
```

**Key Features:**

- `required: true` - Field must be present
- `unique: true` - Creates index, ensures no duplicates
- `timestamps: true` - Auto-manages createdAt/updatedAt
- `toJSON` transform - Removes sensitive data when sending to client

**Kick Model (`models/Kick.js`):**

```javascript
// Subdocument schema for comments
const commentSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const kickSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    category: {
      type: String,
      required: true,
      enum: ["Travel", "Adventure", "Skills", "Personal", "Career", "Other"],
    },
    status: {
      type: String,
      required: true,
      enum: ["Open", "Completed"],
      default: "Open",
    },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    comments: [commentSchema], // Embedded subdocuments
  },
  { timestamps: true }
);
```

**Key Features:**

- `enum` - Restricts values to predefined list
- `default` - Value used if not provided
- `ObjectId` with `ref` - References another model (for population)
- Embedded subdocuments - Comments stored within kicks (faster reads)

### Embedded vs. Referenced Documents

**Embedded (what we use for comments):**

```javascript
// Comments are stored inside the kick document
{
  _id: "kick123",
  title: "Learn Surfing",
  comments: [
    { _id: "comment1", text: "Sounds fun!", author: "user1" },
    { _id: "comment2", text: "Let's go!", author: "user2" }
  ]
}
```

**Pros:** Faster reads (one query), atomic updates
**Cons:** Document size limits (16MB in MongoDB), harder to query comments independently

**Referenced (what we use for author):**

```javascript
// Author is stored as a reference to User collection
{
  _id: "kick123",
  title: "Learn Surfing",
  author: "user1" // ObjectId reference
}

// Separate User document
{ _id: "user1", username: "john" }
```

**Pros:** No duplication, unlimited growth, easier to update
**Cons:** Requires multiple queries (or populate)

### Population (Joins in MongoDB)

```javascript
// Without populate - just IDs
const kick = await Kick.findById(kickId);
// { title: "Learn Surfing", author: "507f1f77bcf86cd799439011" }

// With populate - full user object
const kick = await Kick.findById(kickId).populate("author");
// {
//   title: "Learn Surfing",
//   author: { _id: "507f...", username: "john", email: "john@example.com" }
// }

// Populate multiple fields
const kick = await Kick.findById(kickId).populate([
  "author",
  "comments.author",
]);
```

### Common Mongoose Operations

```javascript
// CREATE
const user = await User.create({ username: "john", ... });

// READ
const allUsers = await User.find(); // All documents
const oneUser = await User.findOne({ username: "john" }); // First match
const byId = await User.findById("507f1f77bcf86cd799439011");

// UPDATE
const updated = await User.findByIdAndUpdate(
  userId,
  { name: "John Doe" },
  { new: true } // Return updated document
);

// DELETE
await User.findByIdAndDelete(userId);

// QUERY BUILDING
const kicks = await Kick.find({ author: userId })
  .populate("author")
  .sort({ createdAt: "desc" })
  .limit(10)
  .select("title category status");
```

---

## RESTful API Design

### Resource-Based URLs

**Good URL Design:**

```
✅ GET    /kicks              - Collection
✅ POST   /kicks              - Create in collection
✅ GET    /kicks/123          - Specific resource
✅ PUT    /kicks/123          - Update resource
✅ DELETE /kicks/123          - Delete resource
✅ GET    /kicks/123/comments - Nested collection
```

**Bad URL Design:**

```
❌ GET /getAllKicks           - Action in URL
❌ POST /createKick           - Action in URL
❌ GET /kick?id=123           - Not using path parameters
❌ POST /deleteKick           - Wrong method for action
```

### Request & Response Format

**Request (Client → Server):**

```javascript
// HTTP Headers
POST /kicks HTTP/1.1
Host: api.kickit.com
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

// Request Body (JSON)
{
  "title": "Skydiving",
  "category": "Adventure",
  "location": "Dubai",
  "targetDate": "2025-12-31"
}
```

**Response (Server → Client):**

```javascript
// Success Response
HTTP/1.1 201 Created
Content-Type: application/json

{
  "_id": "507f1f77bcf86cd799439011",
  "title": "Skydiving",
  "category": "Adventure",
  "location": "Dubai",
  "targetDate": "2025-12-31T00:00:00.000Z",
  "status": "Open",
  "author": "507f1f77bcf86cd799439012",
  "comments": [],
  "createdAt": "2025-01-15T10:30:00.000Z",
  "updatedAt": "2025-01-15T10:30:00.000Z"
}

// Error Response
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "error": "Missing required field: title"
}
```

### Consistent Error Responses

```javascript
// All errors follow the same structure
{
  "error": "Human-readable error message",
  "details": {} // Optional: additional error info
}

// Examples:
{ "error": "Missing required fields: title, category" }
{ "error": "Invalid kick ID format." }
{ "error": "You do not have permission to delete this kick." }
```

### API Versioning

For future scalability, consider versioning:

```javascript
// Option 1: URL versioning
app.use("/api/v1/kicks", kickRouter);
app.use("/api/v2/kicks", kickRouterV2);

// Option 2: Header versioning
// Accept-Version: v1
```

---

## Middleware Patterns

### What is Middleware?

Middleware functions have access to:

- `req` (request object)
- `res` (response object)
- `next` (function to pass control to next middleware)

```javascript
function middleware(req, res, next) {
  // Do something with request/response
  console.log(`${req.method} ${req.url}`);

  // Pass control to next middleware
  next();
}

app.use(middleware);
```

### Types of Middleware in KickIt

**1. Application-Level Middleware (runs for all routes):**

```javascript
// server.js
kickitApp.use(
  cors({
    origin: ["https://kickit-app.netlify.app", "http://localhost:5173"],
  })
); // Enable CORS

kickitApp.use(express.json()); // Parse JSON request bodies
```

**2. Router-Level Middleware (runs for specific routes):**

```javascript
// KickController.js
router.use(verifyToken); // All kicks routes require authentication
```

**3. Error-Handling Middleware:**

```javascript
// Should be defined last
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});
```

### Custom Middleware: verifyToken

```javascript
function verifyToken(req, res, next) {
  try {
    // Extract token
    if (!req.headers.authorization) {
      return res.status(401).json({ err: "No token provided" });
    }

    const token = req.headers.authorization.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user to request
    req.user = decoded.payload;

    // Continue to route handler
    next();
  } catch (err) {
    res.status(401).json({ err: "Invalid token" });
  }
}
```

**Why this pattern?**

- **DRY (Don't Repeat Yourself):** Write authentication logic once, use everywhere
- **Separation of Concerns:** Controllers focus on business logic, middleware handles auth
- **Reusability:** Can apply to any route that needs authentication

---

## Error Handling Best Practices

### Defensive Programming

**Always validate user input:**

```javascript
router.post("/", async (req, res) => {
  // Check for required fields
  if (!req.body.title || !req.body.category) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Validate format
  if (!req.params.kickId.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ error: "Invalid ID format" });
  }

  // Validate authorization
  if (!kick.author.equals(req.user._id)) {
    return res.status(403).json({ error: "Permission denied" });
  }

  // Continue with operation...
});
```

### Try-Catch Pattern

**Every async route handler should have try-catch:**

```javascript
router.post("/", async (req, res) => {
  try {
    // Happy path - everything works
    const kick = await Kick.create(req.body);
    res.status(201).json(kick);
  } catch (error) {
    // Handle errors gracefully
    console.error("Error creating kick:", error);

    // Specific error handling
    if (error.name === "ValidationError") {
      return res.status(400).json({ error: "Invalid data" });
    }

    // Generic fallback
    res.status(500).json({ error: "Failed to create kick" });
  }
});
```

### Types of Errors

**1. Validation Errors (400):**

```javascript
if (error.name === "ValidationError") {
  const messages = Object.values(error.errors).map((e) => e.message);
  return res.status(400).json({ error: messages.join(". ") });
}
```

**2. Duplicate Key Errors (409):**

```javascript
if (error.code === 11000) {
  const field = Object.keys(error.keyPattern)[0];
  return res.status(409).json({
    error: `${field} already exists`,
  });
}
```

**3. Not Found (404):**

```javascript
const kick = await Kick.findById(kickId);
if (!kick) {
  return res.status(404).json({ error: "Kick not found" });
}
```

**4. Authorization Errors (403):**

```javascript
if (!kick.author.equals(req.user._id)) {
  return res.status(403).json({ error: "Permission denied" });
}
```

### User-Friendly Error Messages

```javascript
// ❌ BAD - Developer-focused
res.status(500).json({ error: error.message });
// "Cannot read property '_id' of null"

// ✅ GOOD - User-focused
res.status(500).json({
  error: "Failed to load kick. Please try again.",
});
```

---

## Code Walkthrough

### Server Initialization (`server.js`)

```javascript
// 1. IMPORT DEPENDENCIES
require("dotenv").config(); // Load environment variables
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// 2. CREATE EXPRESS APP
const kickitApp = express();
const port = process.env.PORT || 1986;

// 3. IMPORT ROUTERS (controllers)
const authRouter = require("./controllers/AuthController");
const userRouter = require("./controllers/UserController");
const kickRouter = require("./controllers/KickController");

// 4. CONNECT TO DATABASE
mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.on("connected", () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});

// 5. APPLY MIDDLEWARE
kickitApp.use(
  cors({
    origin: ["https://kickit-app.netlify.app", "http://localhost:5173"],
  })
);
kickitApp.use(express.json());

// 6. REGISTER ROUTES
kickitApp.use("/auth", authRouter);
kickitApp.use("/users", userRouter);
kickitApp.use("/kicks", kickRouter);

// 7. START SERVER
kickitApp.listen(port, () => {
  console.log(`Server ready on port ${port}!`);
});
```

**What happens when the server starts:**

1. Environment variables are loaded
2. Express app is created
3. Database connection is established
4. Middleware is registered (runs for every request)
5. Routes are registered (maps URLs to controllers)
6. Server starts listening for HTTP requests

### Creating a Kick (`KickController.js`)

```javascript
router.post("/", async (req, res) => {
  try {
    // 1. DESTRUCTURE REQUEST BODY
    const { title, description, category, location, targetDate, status } =
      req.body || {};

    // 2. VALIDATE REQUIRED FIELDS
    if (!title || !category) {
      const missingFields = [];
      if (!title) missingFields.push("title");
      if (!category) missingFields.push("category");

      return res.status(400).json({
        error: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    // 3. BUILD KICK DATA OBJECT
    const kickData = {
      title,
      category,
      author: req.user._id, // From verified JWT token
    };

    // Add optional fields if provided
    if (description) kickData.description = description;
    if (location) kickData.location = location;
    if (targetDate) kickData.targetDate = targetDate;
    if (status) kickData.status = status;

    // 4. CREATE DOCUMENT IN DATABASE
    const newKick = await Kick.create(kickData);

    // 5. SEND SUCCESS RESPONSE
    res.status(201).json(newKick);
  } catch (error) {
    // 6. HANDLE ERRORS
    console.error("Error creating kick:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        error: `Validation failed: ${messages.join(". ")}`,
      });
    }

    res.status(500).json({
      error: "Failed to create kick. Please try again.",
    });
  }
});
```

**Request Flow:**

1. Client sends POST request with JSON body
2. `express.json()` middleware parses body
3. `verifyToken` middleware verifies JWT and attaches `req.user`
4. Route handler executes
5. Data is validated
6. Database operation occurs
7. Response is sent back to client

### Updating a Kick

```javascript
router.put("/:kickId", async (req, res) => {
  try {
    const { kickId } = req.params;
    const { title, description, category, location, targetDate, status } =
      req.body || {};

    // 1. VALIDATE ID FORMAT
    if (!kickId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    // 2. CHECK IF UPDATE DATA PROVIDED
    if (
      !title &&
      !description &&
      !category &&
      !location &&
      !targetDate &&
      !status
    ) {
      return res.status(400).json({
        error: "Please provide at least one field to update",
      });
    }

    // 3. VERIFY KICK EXISTS AND USER IS AUTHORIZED
    const kick = await Kick.findById(kickId);
    if (!kick) {
      return res.status(404).json({ error: "Kick not found" });
    }

    if (!kick.author.equals(req.user._id)) {
      return res.status(403).json({ error: "Permission denied" });
    }

    // 4. BUILD UPDATE OBJECT (only provided fields)
    const updateFields = {};
    if (title !== undefined) updateFields.title = title;
    if (description !== undefined) updateFields.description = description;
    if (category !== undefined) updateFields.category = category;
    if (location !== undefined) updateFields.location = location;
    if (targetDate !== undefined) updateFields.targetDate = targetDate;
    if (status !== undefined) updateFields.status = status;

    // 5. UPDATE DOCUMENT
    const updatedKick = await Kick.findByIdAndUpdate(kickId, updateFields, {
      new: true,
      runValidators: true,
    });

    res.status(200).json(updatedKick);
  } catch (error) {
    console.error("Error updating kick:", error);
    res.status(500).json({ error: "Failed to update kick" });
  }
});
```

**Key Concepts:**

- **Partial updates:** Only update fields provided in request
- **Authorization check:** Verify user owns the resource
- **Validation:** Check ID format and input data
- **`new: true`:** Return updated document (not original)
- **`runValidators: true`:** Run schema validators on update

### Adding Comments (Subdocuments)

```javascript
router.post("/:kickId/comments", async (req, res) => {
  try {
    const { kickId } = req.params;
    const { text } = req.body || {};

    // Validate
    if (!text || !text.trim()) {
      return res.status(400).json({ error: "Comment text required" });
    }

    // Find parent document
    const kick = await Kick.findById(kickId);
    if (!kick) {
      return res.status(404).json({ error: "Kick not found" });
    }

    // Create comment object
    const newComment = {
      text: text.trim(),
      author: req.user._id,
    };

    // Add to comments array
    kick.comments.push(newComment);

    // Save parent document (triggers validation)
    await kick.save();

    res.status(201).json(newComment);
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ error: "Failed to add comment" });
  }
});
```

**Subdocument Operations:**

- `push()` - Add to array
- `pull()` - Remove from array by ID
- `.id()` - Find subdocument by ID
- `save()` - Required to persist changes

---

## Testing Strategies

### Manual Testing with Thunder Client / Postman

**1. Test Authentication:**

```javascript
// Signup
POST http://localhost:3000/auth/signup
Content-Type: application/json

{
  "username": "testuser",
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123"
}

// Expected: 201 Created with token

// Signin
POST http://localhost:3000/auth/signin
Content-Type: application/json

{
  "username": "testuser",
  "password": "password123"
}

// Expected: 200 OK with token
```

**2. Test Protected Routes:**

```javascript
// Create Kick (requires authentication)
POST http://localhost:3000/kicks
Content-Type: application/json
Authorization: Bearer <your-token-here>

{
  "title": "Learn Guitar",
  "category": "Skills"
}

// Expected: 201 Created
```

### Automated Testing (Jest + Supertest)

**Setup:**

```bash
pnpm install --save-dev jest supertest
```

**Example Test (`__tests__/kicks.test.js`):**

```javascript
const request = require("supertest");
const app = require("../server");
const mongoose = require("mongoose");

describe("Kicks API", () => {
  let token;
  let kickId;

  beforeAll(async () => {
    // Signup and get token
    const res = await request(app).post("/auth/signup").send({
      username: "testuser",
      name: "Test",
      email: "test@test.com",
      password: "password123",
    });
    token = res.body.token;
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  test("POST /kicks - should create new kick", async () => {
    const res = await request(app)
      .post("/kicks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Test Kick",
        category: "Travel",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("_id");
    expect(res.body.title).toBe("Test Kick");

    kickId = res.body._id;
  });

  test("GET /kicks - should return all kicks", async () => {
    const res = await request(app)
      .get("/kicks")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("POST /kicks - should fail without authentication", async () => {
    const res = await request(app)
      .post("/kicks")
      .send({ title: "Test", category: "Travel" });

    expect(res.statusCode).toBe(401);
  });
});
```

### Testing Checklist

- [ ] Happy path (successful operations)
- [ ] Error cases (missing fields, invalid data)
- [ ] Authentication (with/without token)
- [ ] Authorization (user can only modify own resources)
- [ ] Edge cases (empty strings, special characters)
- [ ] Database constraints (unique fields, required fields)

---

## Deployment & DevOps

### Environment Setup

**Development:**

```bash
# .env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/kickit-dev
JWT_SECRET=dev-secret-key
```

**Production:**

```bash
# Set in hosting platform (Render, Railway, Heroku)
NODE_ENV=production
PORT=443
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/kickit
JWT_SECRET=<strong-random-key>
```

### Deployment Platforms

**Backend Hosting Options:**

1. **Render** (Free tier available)
2. **Railway** (Free tier available)
3. **Heroku** (Paid after free hours)
4. **Fly.io** (Free tier)

**Database Hosting:**

1. **MongoDB Atlas** (Free 512MB cluster)
2. **Railway PostgreSQL** (if migrating to SQL)

### Deployment Steps (Render Example)

1. **Push code to GitHub**
2. **Connect Render to GitHub repo**
3. **Configure environment variables in Render dashboard**
4. **Set build command:** `pnpm install`
5. **Set start command:** `pnpm start`
6. **Deploy!**

### CORS Configuration for Production

```javascript
// server.js
const allowedOrigins = [
  "https://your-frontend-app.netlify.app",
  "https://your-custom-domain.com",
];

// Add localhost for development
if (process.env.NODE_ENV === "development") {
  allowedOrigins.push("http://localhost:5173");
}

kickitApp.use(cors({ origin: allowedOrigins }));
```

### Health Check Endpoint

```javascript
// server.js
kickitApp.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});
```

---

## Industry Best Practices

### Code Organization

**1. Use Consistent Naming:**

```javascript
// ✅ GOOD
router.get("/kicks", async (req, res) => {});
router.post("/kicks", async (req, res) => {});

// ❌ BAD
router.get("/getKicks", async (req, res) => {});
router.post("/createNewKick", async (req, res) => {});
```

**2. Single Responsibility Principle:**

```javascript
// ✅ GOOD - Each function does one thing
async function findUserByUsername(username) {
  return await User.findOne({ username });
}

async function hashPassword(password) {
  return bcrypt.hashSync(password, 12);
}

// ❌ BAD - Function does too much
async function createUserAndSendEmail(userData) {
  const user = await User.create(userData);
  await sendWelcomeEmail(user.email);
  await logUserCreation(user._id);
  return user;
}
```

**3. DRY (Don't Repeat Yourself):**

```javascript
// ✅ GOOD - Reusable validation function
function validateObjectId(id) {
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    throw new Error("Invalid ID format");
  }
}

router.get("/kicks/:kickId", async (req, res) => {
  try {
    validateObjectId(req.params.kickId);
    // Continue...
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
```

### Security Best Practices

**1. Input Sanitization:**

```javascript
const { text } = req.body;
const sanitizedText = text.trim(); // Remove whitespace
```

**2. Rate Limiting:**

```javascript
const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
});

app.use("/auth", limiter);
```

**3. Helmet (Security Headers):**

```javascript
const helmet = require("helmet");
app.use(helmet());
```

**4. Never Log Sensitive Data:**

```javascript
// ❌ BAD
console.log("User password:", req.body.password);

// ✅ GOOD
console.log("User signup attempt:", { username: req.body.username });
```

### Performance Optimization

**1. Database Indexing:**

```javascript
// In model definition
userSchema.index({ email: 1 }); // Create index on email
kickSchema.index({ author: 1, createdAt: -1 }); // Compound index
```

**2. Pagination:**

```javascript
router.get("/kicks", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const kicks = await Kick.find({ author: req.user._id })
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: "desc" });

  res.json({ kicks, page, limit });
});
```

**3. Selective Population:**

```javascript
// ❌ BAD - Loads entire user document
const kicks = await Kick.find().populate("author");

// ✅ GOOD - Only load needed fields
const kicks = await Kick.find().populate("author", "username email");
```

### Git Best Practices

**Commit Messages:**

```bash
# Format: type(scope): subject

feat(auth): add JWT token refresh
fix(kicks): prevent duplicate comment creation
docs(readme): update API endpoints
refactor(controllers): extract validation logic
```

**Branch Strategy:**

```bash
main              # Production code
├── develop       # Development branch
│   ├── feature/add-likes
│   ├── feature/user-profiles
│   └── bugfix/comment-deletion
```

### Code Review Checklist

- [ ] Does the code follow project conventions?
- [ ] Are there proper error handling and validation?
- [ ] Are there any security vulnerabilities?
- [ ] Is the code readable and well-commented?
- [ ] Are there any performance issues?
- [ ] Does it handle edge cases?
- [ ] Are there console.logs that should be removed?

---

## Common Pitfalls & Solutions

### 1. Forgetting async/await

```javascript
// ❌ PROBLEM
router.get("/kicks", (req, res) => {
  const kicks = Kick.find(); // Returns a Promise, not data!
  res.json(kicks); // Sends Promise object, not data
});

// ✅ SOLUTION
router.get("/kicks", async (req, res) => {
  const kicks = await Kick.find(); // Waits for data
  res.json(kicks);
});
```

### 2. Not Handling Promise Rejections

```javascript
// ❌ PROBLEM
router.post("/kicks", async (req, res) => {
  const kick = await Kick.create(req.body); // Can fail!
  res.json(kick);
});
// Unhandled rejection crashes server

// ✅ SOLUTION
router.post("/kicks", async (req, res) => {
  try {
    const kick = await Kick.create(req.body);
    res.json(kick);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### 3. Sending Multiple Responses

```javascript
// ❌ PROBLEM
router.get("/kicks/:id", async (req, res) => {
  const kick = await Kick.findById(req.params.id);
  if (!kick) {
    res.status(404).json({ error: "Not found" });
  }
  res.json(kick); // ERROR: Can't send two responses!
});

// ✅ SOLUTION
router.get("/kicks/:id", async (req, res) => {
  const kick = await Kick.findById(req.params.id);
  if (!kick) {
    return res.status(404).json({ error: "Not found" }); // RETURN!
  }
  res.json(kick);
});
```

### 4. Forgetting to Call next()

```javascript
// ❌ PROBLEM
function myMiddleware(req, res, next) {
  console.log("Middleware ran");
  // Forgot to call next()!
}
// Request hangs forever

// ✅ SOLUTION
function myMiddleware(req, res, next) {
  console.log("Middleware ran");
  next(); // Continue to next middleware
}
```

### 5. Exposing Sensitive Data

```javascript
// ❌ PROBLEM
router.get("/users/:id", async (req, res) => {
  const user = await User.findById(req.params.id);
  res.json(user); // Sends hashedPassword!
});

// ✅ SOLUTION
router.get("/users/:id", async (req, res) => {
  const user = await User.findById(req.params.id).select("-hashedPassword");
  res.json(user);
});
```

### 6. Not Validating ObjectIds

```javascript
// ❌ PROBLEM
const kick = await Kick.findById(req.params.kickId); // Crashes if invalid ID

// ✅ SOLUTION
if (!req.params.kickId.match(/^[0-9a-fA-F]{24}$/)) {
  return res.status(400).json({ error: "Invalid ID" });
}
const kick = await Kick.findById(req.params.kickId);
```

### 7. Mongoose Comparison Issues

```javascript
// ❌ PROBLEM
if (kick.author === req.user._id) {
  // Never true! Comparing ObjectId to string
}

// ✅ SOLUTION
if (kick.author.equals(req.user._id)) {
  // Correct ObjectId comparison
}

// Alternative
if (kick.author.toString() === req.user._id.toString()) {
  // Convert both to strings
}
```

---

## Next Steps & Career Growth

### Immediate Next Steps

1. **Add Features to KickIt:**

   - User profiles with avatars
   - Kick categories filtering
   - Like/favorite kicks
   - Share kicks with friends
   - Image uploads for kicks

2. **Learn Testing:**

   - Write unit tests for models
   - Write integration tests for APIs
   - Learn TDD (Test-Driven Development)

3. **Improve Error Handling:**

   - Implement centralized error handling
   - Add request logging (Morgan)
   - Set up error monitoring (Sentry)

4. **Optimize Performance:**
   - Add database indexes
   - Implement caching (Redis)
   - Add pagination to all list endpoints

### Intermediate Skills

1. **Real-Time Features (Socket.io):**

   - Live updates when kicks change
   - Real-time notifications

2. **Advanced Authentication:**

   - OAuth (Google, GitHub login)
   - Password reset via email
   - Two-factor authentication

3. **File Uploads:**

   - Profile pictures
   - Kick images
   - Use Cloudinary or AWS S3

4. **Email Integration:**
   - Welcome emails
   - Password reset emails
   - Notifications

### Advanced Topics

1. **Microservices Architecture:**

   - Split into separate services
   - API Gateway
   - Service discovery

2. **GraphQL:**

   - Alternative to REST
   - More flexible queries

3. **Message Queues:**

   - Background jobs (Bull, RabbitMQ)
   - Async processing

4. **DevOps:**
   - Docker containerization
   - CI/CD pipelines (GitHub Actions)
   - Kubernetes orchestration

### Resources for Learning

**Documentation:**

- [Express.js Docs](https://expressjs.com/)
- [Mongoose Docs](https://mongoosejs.com/)
- [JWT.io](https://jwt.io/)
- [MDN Web Docs](https://developer.mozilla.org/)

**Courses:**

- freeCodeCamp (Free)
- The Odin Project (Free)
- Udemy Node.js courses

**Practice:**

- Build clones of popular apps
- Contribute to open source
- Code daily on GitHub

### Interview Preparation

**Common Questions:**

1. Explain the request-response cycle in Express
2. What is middleware and how does it work?
3. Difference between authentication and authorization
4. How do you handle errors in async functions?
5. What is the difference between SQL and NoSQL?
6. How does JWT authentication work?
7. What are HTTP status codes? Give examples.
8. Explain REST principles
9. How do you prevent SQL injection?
10. What is CORS and why is it needed?

**Coding Challenges:**

- Implement user authentication from scratch
- Build a simple blog API
- Create a todo list API with full CRUD
- Add search/filtering to a list endpoint

---

## Conclusion

You've now explored a production-ready Express.js backend application. The patterns and practices used in KickIt are the same ones used at major tech companies. Here are the key takeaways:

**Core Principles:**

1. **Security First:** Always validate, always authenticate, never trust user input
2. **Error Handling:** Every async function needs try-catch
3. **RESTful Design:** Predictable, resource-based URLs
4. **Separation of Concerns:** Models, controllers, middleware have distinct roles
5. **DRY Code:** Reuse logic through functions and middleware

**Industry Mindset:**

- Write code that others (including future you) can understand
- Document your decisions
- Test your code
- Think about edge cases
- Prioritize security and user experience

**Remember:** The best developers are not those who know every syntax detail, but those who:

- Can break down complex problems
- Write maintainable code
- Debug effectively
- Learn continuously
- Communicate well with teams

Keep building, keep learning, and welcome to the industry! 🚀

---

## Quick Reference

### Common Commands

```bash
# Install dependencies
pnpm install

# Start development server (with nodemon)
pnpm run dev

# Start production server
pnpm start

# Install a new package
pnpm install package-name

# MongoDB connection string format
mongodb://localhost:27017/database-name
mongodb+srv://username:password@cluster.mongodb.net/database-name
```

### Express Cheat Sheet

```javascript
// Create router
const router = express.Router();

// Routes
router.get("/path", handler);
router.post("/path", handler);
router.put("/path/:id", handler);
router.patch("/path/:id", handler);
router.delete("/path/:id", handler);

// Route handler signature
async (req, res) => {
  // req.params - URL parameters
  // req.query - Query string (?key=value)
  // req.body - Request body (JSON)
  // req.headers - HTTP headers
  // req.user - Set by middleware
};

// Send responses
res.status(200).json({ data });
res.status(201).json({ created });
res.status(400).json({ error: "message" });
res.status(404).json({ error: "Not found" });
```

### Mongoose Cheat Sheet

```javascript
// Find operations
Model.find(); // All documents
Model.findOne({ field }); // First match
Model.findById(id); // By ID

// Create
Model.create({ data });

// Update
Model.findByIdAndUpdate(id, { data }, { new: true });

// Delete
Model.findByIdAndDelete(id);

// Query building
Model.find()
  .populate("field")
  .sort({ createdAt: "desc" })
  .limit(10)
  .select("field1 field2");
```

---

**Version:** 1.0
**Last Updated:** 2025-11-11
**Questions?** Open an issue or reach out to the team!
