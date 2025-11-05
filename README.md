# KickIt - Backend API

RESTful API for KickIt, a bucket list adventure tracking application built with Express, Node.js, and MongoDB.

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

### Adventures

- `GET /adventures` - Get all user's adventures
- `POST /adventures` - Create new adventure
- `GET /adventures/:id` - Get single adventure
- `PUT /adventures/:id` - Update adventure
- `DELETE /adventures/:id` - Delete adventure
- `PATCH /adventures/:id/complete` - Toggle completion status

### Comments

- `GET /adventures/:adventureId/comments` - Get all comments for an adventure
- `POST /adventures/:adventureId/comments` - Create new comment
- `PUT /adventures/:adventureId/comments/:id` - Update comment
- `DELETE /adventures/:adventureId/comments/:id` - Delete comment

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
