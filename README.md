# TripFlow

A simple trip management application with user authentication.

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
npm install
```

### Running the app

```bash
npm start
```

The server will start on <http://localhost:3000>. Open that URL in your browser to see the login page.

### Running tests

```bash
npm test
```

## API

### `POST /api/auth/register`

Register a new user.

**Body**: `{ "username": "string", "password": "string" }`

**Response**: `201 Created` on success, `409 Conflict` if the username is taken.

### `POST /api/auth/login`

Login with existing credentials.

**Body**: `{ "username": "string", "password": "string" }`

**Response**: `200 OK` with `{ "token": "<jwt>" }` on success, `401 Unauthorized` on failure.
