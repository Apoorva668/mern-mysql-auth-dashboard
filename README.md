# MERN Auth + Dashboard CRUD (MySQL)

Full-stack app with **JWT authentication**, **password reset email**, and a **dashboard CRUD** for items using **MySQL**.

## Tech

- Backend: Node.js, Express, MySQL (`mysql2`), JWT, bcrypt, Nodemailer
- Frontend: React (Vite), React Router, Axios, Tailwind, Context API

## Folder structure

- `backend/`: Express API + MySQL
- `frontend/`: React UI

## 1) Prerequisites

- **Node.js (LTS)** installed (includes `node` + `npm`)
- **MySQL** running locally (or remote)

If `npm` says “not recognized”, install Node.js from the official site and reopen your terminal.

## 2) Database setup

Create the DB + tables:

- Run `backend/database.sql` in MySQL Workbench / CLI.

## 3) Backend setup

From `backend/`:

```bash
npm install
```

Create `backend/.env` from `backend/.env.example` and fill:

- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- `JWT_SECRET`
- Email values (`MAIL_*`) for password reset emails

Run:

```bash
npm run dev
```

Health check:

- `GET http://localhost:5000/api/health`

## 4) Frontend setup

From `frontend/`:

```bash
npm install
```

Create `frontend/.env` from `frontend/.env.example` (optional):

- `VITE_API_BASE_URL=http://localhost:5000`

Run:

```bash
npm run dev
```

Open:

- `http://localhost:5173`

## API routes (required by assignment)

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `GET /api/auth/me` (JWT required)

### Items (JWT required)

- `GET /api/items`
- `GET /api/items/:id`
- `POST /api/items`
- `PUT /api/items/:id`
- `DELETE /api/items/:id`

### Stats (JWT required)

- `GET /api/stats`

## Notes

- All DB queries use **parameterized queries** via `mysql2/promise`.
- Never commit `.env` files (use the `*.env.example` templates).

