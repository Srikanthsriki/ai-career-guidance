# PathFinder AI – AI Career Guidance System

AI-powered career guidance for students: career matching, skills roadmap, resume analyzer, mock interviews, and the **APEX** AI assistant.

- `frontend/` – React + Vite website (host on **Vercel**)
- `backend/` – Node.js + Express API (host on **Render**)
- Database – MongoDB Atlas (connection string is added on Render, never in code)

## Deploy

### 1. Backend on Render
1. New → **Web Service** → connect this GitHub repo.
2. **Root Directory:** `backend`
3. **Build Command:** `npm install`
4. **Start Command:** `npm start`
5. **Instance type:** Free
6. **Environment Variables:**
   - `MONGODB_URI` = your MongoDB Atlas connection string
   - `NODE_ENV` = `production`
7. Deploy, then copy your URL, e.g. `https://pathfinder-ai-backend.onrender.com`.
   Test it: open `<your-url>/api/health` – you should see `"status":"online"`.

### 2. Frontend on Vercel
1. Add New → **Project** → import this GitHub repo.
2. **Root Directory:** `frontend` (Vercel detects Vite automatically)
3. **Environment Variables:**
   - `VITE_API_URL` = your Render URL from step 1 (no `/api` at the end)
4. Deploy. Your website link will look like `https://pathfinder-ai.vercel.app`.

> If you change `VITE_API_URL` later, redeploy the frontend on Vercel so it takes effect.

## Run locally
```bash
cd backend  && npm install && npm start      # API on http://localhost:5000
cd frontend && npm install && npm run dev    # Website on http://localhost:3000
```
For local MongoDB, copy `backend/.env.example` to `backend/.env` and fill in `MONGODB_URI`.
Without it, the app uses a built-in local file database.

