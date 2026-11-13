# MCU Digital Passport

Monorepo with a React (Vite) frontend and a Node.js (Express) backend, authenticated via Microsoft Entra ID and backed by MySQL.

## Structure

- `frontend/` — React app (feature-based folders under `src/features`)
- `backend/` — Express REST API (modules under `src/modules`)
- `docs/` — architecture, ERD, API spec, authentication and deployment notes

## Backend

```bash
cd backend
cp .env.example .env   # fill in DB and Entra values
npm install
npm run dev            # nodemon, http://localhost:4000/api/health
```

## Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev            # http://localhost:5173
```
