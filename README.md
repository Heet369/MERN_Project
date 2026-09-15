# MERN Blog Platform

A modern, high-performance blog platform built with the **MERN** stack (MongoDB, Express, React, Node.js) and styled with **Tailwind CSS v4** in a sleek Dark AI aesthetic.

---

## ⚡ Architecture: Exactly 2 Servers

The application is organized into **2 components**:
1. **`backend/`** (Server 1 — Port `5000`): Express API connected to MongoDB.
   - Handles Admin authentication (`Admin` model in `admins` collection).
   - Handles Blog CRUD operations (with Multer file uploads & YouTube embeds).
   - Serves public endpoints for user reading, liking, commenting, and sharing.
2. **`frontend/`** (Server 2 — Single Port `5173`): Unified React application containing both views on the **same port**:
   - **User Reader Views**:
     - `http://localhost:5173/` ➔ Public blog feed with keyword search.
     - `http://localhost:5173/blog/:id` ➔ Full article reading, interactive like button, comments, and social sharing.
   - **Admin Management Views**:
     - `http://localhost:5173/admin/login` ➔ Security gateway authentication.
     - `http://localhost:5173/admin/dashboard` ➔ Operations console with live metrics.
     - `http://localhost:5173/admin/blog/new` ➔ Blog composer with media upload & live preview.
   - **Separate APIs**: `frontend/src/services/api.js` cleanly exports `userAPI` and `adminAPI`.

---

## 📂 Project Structure

```
MERN_Project/
├── backend/                         # SERVER 1: API (Port 5000)
│   ├── config/db.js                 # MongoDB Mongoose connection
│   ├── controllers/                 # authController (Admin), blogController, interactionController
│   ├── middleware/                  # auth.js (JWT), upload.js (Multer)
│   ├── models/                      # Admin.js, Blog.js, Comment.js (Zero user accounts)
│   ├── routes/                      # authRoutes, blogRoutes, interactionRoutes
│   ├── scripts/seed.js              # Database seeder (Admin + sample posts)
│   ├── uploads/                     # Uploaded media storage
│   ├── .env                         # PORT=5000, CLIENT_URL=http://localhost:5173
│   ├── package.json
│   └── server.js                    # Express entry point
│
├── frontend/                        # SERVER 2: Unified Frontend (Port 5173)
│   ├── src/
│   │   ├── components/              # Navbar, BlogCard, MediaRenderer, CommentSection, Footer, ProtectedRoute
│   │   ├── context/AuthContext.jsx  # Admin JWT session management
│   │   ├── pages/                   # Home, BlogPage, AdminLogin, AdminDashboard, BlogEditor
│   │   ├── services/api.js          # Separate userAPI & adminAPI (Vercel ready: VITE_API_URL)
│   │   ├── App.jsx                  # Single router hosting both user and admin paths
│   │   └── index.css                # Tailwind CSS v4 Dark AI Theme
│   ├── package.json
│   ├── vite.config.js               # Port 5173
│   └── index.html
│
├── package.json                     # Root orchestrator (runs both simultaneously)
└── README.md
```

---

## 🚀 Quick Start (Single Command)

### Prerequisites
- **Node.js** (v18+)
- **MongoDB** (Local Community Server running or MongoDB Atlas connection string)

---

### Step 1: Install Dependencies
In the root directory, install the root orchestrator, backend, and frontend dependencies:
```bash
npm install
npm install --prefix backend
npm install --prefix frontend
```

---

### Step 2: Seed the Database (Optional but Recommended)
Initialize the database with an admin account and sample blog posts with rich media:
```bash
npm run seed
```

---

### Step 3: Run Both Servers Simultaneously
From the root folder, run:
```bash
npm run dev
```

This single command boots both servers together:
- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend**: [http://localhost:5000](http://localhost:5000)

*(Or if you prefer running them in separate terminals, use `npm run dev:backend` and `npm run dev:frontend`).*

---

## 🔑 Default Admin Credentials
- **Email**: `admin@blogverse.com`
- **Password**: `adminpassword123`

---

## ☁️ Vercel & Production Deployment

1. **Frontend on Vercel**:
   - Point Vercel to the `frontend/` directory (Root Directory: `frontend`).
   - Add the environment variable: `VITE_API_URL=https://your-backend-api-url.com/api`.
   - Build Command: `npm run build`. Output Directory: `dist`.
2. **Backend on Render / Railway / Fly.io**:
   - Point to the `backend/` directory.
   - Set environment variables from `backend/.env` (`PORT`, `MONGO_URI`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `CLIENT_URL=https://your-vercel-frontend.vercel.app`).
   - Start Command: `npm start`.
