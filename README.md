# Help Desk

A help desk ticket app with a Next.js frontend and an Express + MongoDB backend.

## Project structure

```
help-desk/
├── frontend/     # Next.js app (pages, components, styles)
├── backend/      # Express API + MongoDB
│   ├── data/     # Database schema
│   └── server.js
```

## Getting started

### Backend

1. Start MongoDB locally (`mongodb://localhost:27017`).
2. From `backend/`:

```bash
npm install
npm run dev
```

API runs at [http://localhost:4000](http://localhost:4000).

### Frontend

From `frontend/`:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).
