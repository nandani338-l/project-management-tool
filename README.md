# Taskboard — Project Management Tool
React + Vite + Tailwind · Node + Express · MongoDB (Mongoose) · JWT · Socket.IO

## Setup
1. Install Node 18+ and MongoDB (local, or a free MongoDB Atlas cluster).
2. Backend: `cd server && cp .env.example .env` → set `MONGO_URI` and a long random `JWT_SECRET` → `npm install && npm run dev` (API on :5000).
3. Frontend: `cd client && cp .env.example .env && npm install && npm run dev` → open http://localhost:5173 (Vite proxies `/api` and `/socket.io` to :5000).

## Features
Sign up / log in / log out (bcrypt-hashed passwords, 7-day JWT) · protected routes · projects with members (invite by email of a registered user) · tasks with title, description, assignee, status, due date, priority, created date · 3-column board (drag & drop or status dropdown) · edit/delete with confirmation · per-task comments with author and time · live updates via Socket.IO · in-app notifications for assignment, status change and new comments · responsive layout with loading, empty and error states.

## Structure
`server/src/{index,routes,models}.js` — API, auth, sockets, Mongoose models. `client/src/` — `App.jsx` (auth, layout, dashboard), `Board.jsx` (board, task modal, comments, members), `api.js`, `ui.jsx`.

## Deployment
- Database: MongoDB Atlas; use its connection string as `MONGO_URI`.
- API (Render/Railway/Fly): root `server`, start `npm start`, env `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL=<frontend URL>`. WebSockets must be enabled (default on these hosts).
- Frontend (Vercel/Netlify): root `client`, build `npm run build`, output `dist`, env `VITE_API_URL=<API URL>`; add an SPA fallback rewrite to `index.html`.
