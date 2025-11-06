# KickIt - Backend API

RESTful API for KickIt, a bucket list adventure tracking application built with Express, Node.js, and MongoDB.

> [!NOTE]
> To reference adventure, tasks, or goals, we use the term "kicks" throughout this documentation.

## Frontend Repository

For complete project details, features, and documentation, visit the frontend repository:

**[KickIt Frontend](https://github.com/evanmarshall-dev/kickit-frontend)**

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (JSON Web Tokens)
- **Password Hashing:** bcrypt

## API Endpoints

### Authentication

- `POST /auth/signup` - Register new user
- `POST /auth/signin` - User login
- `GET /auth/verify` - Verify JWT token

### Kicks

- `GET /kicks` - Get all user's kicks
- `POST /kicks` - Create new kick
- `GET /kicks/:id` - Get single kick
- `PUT /kicks/:id` - Update kick
- `DELETE /kicks/:id` - Delete kick
- `PATCH /kicks/:id/complete` - Toggle completion status

### Comments

- `GET /kicks/:kickId/comments` - Get all comments for a kick
- `POST /kicks/:kickId/comments` - Create new comment
- `PUT /kicks/:kickId/comments/:id` - Update comment
- `DELETE /kicks/:kickId/comments/:id` - Delete comment

## Environment Variables

```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=1986
```

## Installation

```bash
pnpm install
pnpm start
```

## Deployment

Deployed on Heroku: [Live API URL]

---

**© 2025 KickIt** | Built with ❤️ as a full-stack capstone project
