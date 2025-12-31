# What’s In The Fridge  
**AI‑Powered Recipe Assistant** built with **Vue 3 · TypeScript · Express · SQLite · OpenAI · Docker**

Generate personalized, AI‑crafted recipes from the ingredients you already have, with secure authentication, admin tools, and a clean responsive UI.

---

## Tech Stack

- **Frontend:** Vue 3 (Composition API + TypeScript) · Tailwind CSS · DaisyUI  
- **Backend:** Express + SQLite + JWT Auth + OpenAI API integration  
- **AI:** GPT‑powered recipe generation & suggestions based on pantry input  
- **Security:** JWT cookies · Rate limiting · Role‑based access control  
- **Admin:** Dashboard for API logs, user management, and system health  
- **Deployment:** Fully containerized via Docker & CapRover on AWS EC2

---

## System Architecture

```
          ┌──────────────────────────┐
          │      FRONTEND (Vue)      │
          │  Vue 3 + TS + Tailwind   │
          │ • Pantry • Recipes • UI  │
          └────────────┬─────────────┘
                       │   REST API
                       ▼
┌──────────────────────────────────────────────┐
│               BACKEND (Express)              │
│         Node.js + Express + TypeScript       │
│                                              │
│ • /api/auth    → JWT login/signup/logout     │
│ • /api/pantry  → Ingredient CRUD operations  │
│ • /api/recipes → Generate/save recipes       │
│ • /api/admin   → Monitor logs, users, health │
│                                              │
└─────────────┬─────────────────────┬──────────┘
              │                     │
              ▼                     ▼
     ┌─────────────────┐   ┌─────────────────┐
     │  SQLite Database│   │   OpenAI API    │
     │ users, pantry,  │   │  Generates JSON │
     │ recipes, logs   │   │  recipe output  │
     └─────────────────┘   └─────────────────┘
```

---

## Features

### AI Recipe Generation
- Uses **OpenAI API** to create full recipes from given ingredients.  
- Supports filters for *cuisine*, *meal type*, *diet*, *difficulty*, & *language*.  
- Strict JSON format parsing and logging for traceability.

### Pantry Management
- Add / remove ingredients.  
- Prevents duplicates through unique constraints.  
- Pantry synced per user via JWT session.

### Authentication & Roles
- Secure cookie‑based JWT auth.  
- 7‑day rotating session tokens.  
- Admin accounts have elevated API access.

### Admin Dashboard
- **API Logs** viewer (with JSON pretty‑print modal)  
- **System Health** panel (uptime / status / timestamp)  
- **Available Routes** list  
- **User Management:** promote/demote/delete users  

### User Experience
- Responsive layout using Tailwind/DaisyUI  
- Live ingredient badges  
- Toast alerts for errors
- DaisyUI themes persist via localStorage

---

## Project Structure

```
whats-in-the-fridge/
├─ backend/
│  ├─ index.js               # Express entry + route mounts
│  ├─ db.js                  # SQLite schema + connection
│  ├─ auth.js                # Signup/login/logout routes (JWT)
│  ├─ pantry.js              # Pantry CRUD endpoints
│  ├─ recipes.js             # Recipe save & fetch endpoints
│  ├─ recipeHelper.js        # OpenAI model prompting
│  ├─ middleware.js          # Auth / Admin guards
│  ├─ admin.js               # Admin dashboard API
│  ├─ logger.js              # File logging middleware
│
├─ frontend/whats-in-the-fridge/
│  ├─ src/
│  │  ├─ components/         # Reusable UI (Toast, Tables, etc.)
│  │  ├─ composables/        # Auth & state logic
│  │  ├─ layouts/            # App shell / Navbar / Footer
│  │  ├─ router/             # Vue Router setup + guards
│  │  ├─ utils/              # API fetch wrapper
│  │  ├─ views/              # Main pages (Home, Saved, Admin, Auth)
│  │  ├─ App.vue / main.ts   # App entry points
│  │  └─ styles.css          # Tailwind + DaisyUI entry
│  ├─ index.html             # Vite entry file
│  ├─ vite.config.ts         # Vite + Tailwind plugin config
│
├─ dockerfile                # Full‑stack Docker build target
├─ captain-definition        # CapRover deployment manifest
```

---

## Quick Start

```bash
# 1. Install dependencies in the root folder
npm install

# 2. Go into the frontend folder and install its dependencies
cd frontend/whats-in-the-fridge
npm install

# 3. Go into the backend folder and install its dependencies
cd ../../backend
npm install

# 4. Go back to the root folder
cd ..

# 5. Start both the frontend and backend at the same time
npm run dev
```

This command runs **both servers concurrently**:
- Backend → **http://localhost:3000**  
- Frontend → **http://localhost:5173**  

The frontend automatically proxies API calls (`/api/*`) to the backend.  
Open your browser at **[http://localhost:5173](http://localhost:5173)** to start using the app.

---

## License
MIT © 2025 [Nicolas Benavides Linares](https://nicolasbenavides.ca)
