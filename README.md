# 🌽 Maize Monitor AI System — Capstone Project

A full-stack AI-powered maize disease detection and plant progression monitoring system built with **Next.js**, **Node.js**, **MySQL**, and a **Python ML model**.

---

## 🚀 Features

- 📸 Upload maize plant images for instant AI disease detection
- 🌿 Register individual plants and track disease progression over time
- 📊 Severity comparison between scans (worsening / improving / stable)
- 🚨 Automatic alerts when disease severity increases
- 💬 Chat-based analysis sessions with history
- 👤 User authentication (login / signup / roles)
- 📱 Android mobile app download section on landing page
- 🌙 Dark / Light theme toggle

---

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, React 18, Tailwind CSS, Framer Motion |
| Backend API | Next.js API Routes (Node.js) |
| Database | MySQL / MariaDB |
| ML Model | Python (Flask) — separate service on port 5000 |
| Auth | JWT tokens + bcrypt |

---

## ⚙️ Setup & Run (Local)

### Prerequisites
- [Node.js 18+](https://nodejs.org/)
- [MySQL / XAMPP](https://www.apachefriends.org/) — start MySQL on port 3306
- [Python 3.9+](https://www.python.org/) — for the ML model (separate repo)

---

### 1. Clone the repository

```bash
git clone https://github.com/Patrickonly/maize_monitor-ai-system-capstone.git
cd maize_monitor-ai-system-capstone
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the root directory:

```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=maize_detection_systemai
DB_PORT=3306

# App
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_MAIZE_API_URL=http://localhost:5000
JWT_SECRET=your_secret_key_here
PORT=3000
```

> ⚠️ Leave `DB_PASSWORD` empty if your MySQL has no root password (default XAMPP setup).

### 4. Initialize the database

Make sure MySQL is running, then:

```bash
# Create all base tables
npm run db:init

# Add plant tracking tables & columns
npm run db:migrate
```

### 5. Start the development server

```bash
npm run dev
```

> The migration runs automatically every time you start the dev server.

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🐍 Python ML Model (Separate Service)

The AI detection model runs as a separate Flask server on port 5000.

Start your Python ML model:

```bash
cd your-python-model-folder
pip install flask
python app.py
```

The Next.js backend will call `http://localhost:5000/api/predict` automatically.

---

## 🗄️ Database Tables

| Table | Purpose |
|---|---|
| `users` | Registered farmers / admins |
| `roles` | User roles (admin, user) |
| `chat_sessions` | Analysis session per user |
| `chat_conversation` | Messages in each session |
| `diseases` | Disease reference data |
| `analysis_results` | ML detection results per scan |
| `maize_plants` | Individual plant registry |
| `plant_progression_alerts` | Severity increase alerts |

---

## 🌿 Plant Progression Tracking

Register a plant once → scan it over time → get severity trend alerts:

```
Scan 1 (June 1):  severity = low
Scan 2 (June 4):  severity = medium  → no alert
Scan 3 (June 8):  severity = high    → ⚠️ ALERT generated!
```

### API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/plants/register` | Register a new plant |
| `GET` | `/api/plants/register` | List all your plants |
| `GET` | `/api/plants/[plantId]/progression` | Full scan history + trend |
| `GET` | `/api/plants/[plantId]/alerts` | Severity alerts |
| `POST` | `/api/analysis/save-result` | Save a scan (with optional `plantId`) |
| `POST` | `/api/predict` | Proxy to Python ML model |

---

## 📁 Project Structure

```
├── database/               # DB init, migration scripts & schema
│   ├── schema.sql
│   ├── migrate.js          # Auto-runs on npm run dev
│   └── migrate-plant-tracking.sql
├── middleware/             # JWT auth middleware
├── pages/
│   └── api/               # All Next.js API routes
│       ├── auth/
│       ├── analysis/
│       ├── plants/
│       └── predict.ts      # Proxy to Python ML
├── src/
│   ├── pages/              # Frontend pages (Landing, Dashboard, etc.)
│   ├── components/         # Reusable React components
│   ├── contexts/           # Auth, Theme, Chat contexts
│   └── services/           # API call helpers
├── utils/                  # Auth helpers, CORS, user management
└── public/                 # Static assets + Android APK
```

---

## 📲 Android App

Place your APK file in the `public/` folder named `smart-maize.apk`.
The landing page download button will serve it automatically.

---

## 📜 Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server (migration runs first) |
| `npm run build` | Build for production |
| `npm run db:init` | Initialize database (first time) |
| `npm run db:migrate` | Run plant-tracking migration |

---

## 👨‍💻 Author

**Patrickonly** — Capstone Project  
Built for academic submission — Maize Disease Monitoring System
