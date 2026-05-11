# PharmaLink - Pharmacy Management System

## Description

PharmaLink is a full-stack pharmacy management system developed to address the pharmacy digitization gap in Rwanda. The system integrates inventory management, point-of-sale (POS) operations, and digital insurance claims processing into a single cloud-based platform.

The goal of PharmaLink is to eliminate manual paperwork, improve operational efficiency, and significantly reduce insurance reimbursement delays for community pharmacies.

# PharmaLink — Integrated, Insurance-Ready Pharmacy Management System

> Final Year Capstone Project | Bachelor of Software Engineering | African Leadership University
> 
> **Student:** Habiyambere Remember Stella  
> **Supervisor:** Emmanuel Annor  
> **Submission:** March 2026

---

## Live Deployment

| Layer | URL |
|---|---|
| Frontend (Vercel) | https://pharma-link-nu.vercel.app |
| Backend API (Railway) | https://pharmalink-production.up.railway.app |

---

## Project Overview

PharmaLink is a cloud-based, full-stack Pharmacy Management System designed to digitise inventory management, point-of-sale transactions, and insurance claims processing for Rwandan community pharmacies. It bridges the structural gap between Rwanda's digitally advanced national health insurance infrastructure (RSSB, CBHI) and the predominantly paper-based operations of independent community pharmacies.

**Core modules:**
- JWT-based user authentication with role-based access control (Pharmacist / Manager)
- Inventory management with real-time low-stock alerts
- Point-of-sale with insurance co-payment calculation (RSSB, CBHI, Prime Insurance)
- Insurance claims generation, tracking, and submission
- Owner reporting dashboard with cross-pharmacy metrics

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js (Vite), Mantine UI, React Context API |
| Backend | Node.js, Express, TypeScript |
| ORM | Prisma |
| Database | PostgreSQL |
| Authentication | JWT (jsonwebtoken), bcrypt (work factor 12) |
| Frontend deployment | Vercel (auto CI/CD from GitHub) |
| Backend deployment | Railway |

---

## Prerequisites

Before running locally, ensure you have the following installed:

- **Node.js** v18 or higher — https://nodejs.org
- **npm** v9 or higher (comes with Node.js)
- **PostgreSQL** v14 or higher — https://www.postgresql.org/download/
- **Git** — https://git-scm.com

Verify your installations:

```bash
node --version    # should be v18+
npm --version     # should be v9+
psql --version    # should be v14+
git --version
```

---

## Repository Structure

```
pharmalink/
├── frontend/          # React.js SPA (Vite)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   └── main.tsx
│   ├── .env.example
│   └── package.json
├── backend/           # Node.js / Express API
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   └── index.ts
│   ├── prisma/
│   │   └── schema.prisma
│   ├── .env.example
│   └── package.json
└── README.md
```

---

## Installation and Local Setup

### Step 1 — Clone the repository

```bash
git clone https://github.com/[your-username]/pharmalink.git
cd pharmalink
```

### Step 2 — Set up the database

Create a PostgreSQL database locally:

```bash
psql -U postgres
CREATE DATABASE pharmalink_dev;
\q
```

### Step 3 — Configure environment variables

**Backend:**

```bash
cd backend
cp .env.example .env
```

Open `backend/.env` and fill in:

```env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/pharmalink_dev"
JWT_SECRET="your-secure-secret-key-minimum-32-characters"
PORT=5000
NODE_ENV=development
```

**Frontend:**

```bash
cd ../frontend
cp .env.example .env
```

Open `frontend/.env` and fill in:

```env
VITE_API_URL=http://localhost:5000
```

### Step 4 — Install dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### Step 5 — Run Prisma migrations

```bash
cd backend
npx prisma migrate dev --name init
npx prisma generate
```

This creates all database tables. You can verify with:

```bash
npx prisma studio
```

This opens a browser-based database viewer at http://localhost:5555.

### Step 6 — Start the backend

```bash
cd backend
npm run dev
```

The API will be running at http://localhost:5000. You should see:

```
Server running on port 5000
Database connected successfully
```

### Step 7 — Start the frontend

Open a second terminal:

```bash
cd frontend
npm run dev
```

The application will be available at http://localhost:5173.

---

## First-Time Setup in the App

1. Navigate to http://localhost:5173
2. Click **Create account**
3. Fill in your name, email, password, pharmacy name, and license number
4. You will be registered as a **Pharmacy Manager** (Owner role)
5. Log in and navigate to **Users** to add pharmacist accounts
6. Navigate to **Inventory → + Add Medicine** to begin adding stock

---

## Running Tests

```bash
cd backend
npm test
```

This runs the unit test suite covering authentication, inventory CRUD, POS co-payment calculation, and claims generation. All 10 unit tests and 6 validation tests should pass.

---

## Key API Endpoints

| Method | Endpoint | Auth required | Description |
|---|---|---|---|
| POST | /api/auth/login | No | User login, returns JWT |
| POST | /api/auth/register | No | Pharmacy registration |
| GET | /api/inventory | Pharmacist | List all inventory items |
| POST | /api/inventory | Pharmacist | Add medicine record |
| PUT | /api/inventory/:id | Pharmacist | Update medicine record |
| DELETE | /api/inventory/:id | Pharmacist | Remove medicine record |
| PATCH | /api/inventory/:id/stock | Pharmacist | Adjust stock level |
| POST | /api/sales | Pharmacist | Process sale transaction |
| GET | /api/claims | Any auth | List insurance claims |
| PUT | /api/claims/:id/status | Manager | Update claim status |
| GET | /api/dashboard | Manager | Cross-pharmacy metrics |

All authenticated endpoints require the header: `Authorization: Bearer <token>`

---

## Insurance Integration Note

PharmaLink's insurance integration operates against **mocked API endpoints** that simulate RSSB and CBHI eligibility verification and claims submission responses. This is by design for the academic pilot scope — no live RSSB or CBHI API credentials are required to run the system. Live insurer API integration is the primary future development priority identified in Chapter 6 of the project report.

During development and testing, the system displays a **PILOT MODE** indicator in the insurance payment modal to distinguish the simulated environment from live operational workflows.

---

## Accessing the Project Report

The final capstone report (PDF) is included in the repository root:

```
pharmalink/
└── Remember_Stella_Final_Report.pdf
```

---

## Contact

For access requests or questions about the codebase:

**Habiyambere Remember Stella**  
Bachelor of Software Engineering  
African Leadership University, Kigali
