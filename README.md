# PharmaLink [Initial Software Demonstration Document]
## 1. Description 
PharmaLink is a full-stack pharmacy management system developed to address the pharmacy digitization gap in Rwanda.
The system integrates inventory management, point-of-sale (POS) operations, and digital insurance claims processing into a single cloud-based platform.

The goal of PharmaLink is to eliminate manual paperwork, improve operational efficiency, and significantly reduce insurance reimbursement delays for community pharmacies.

## 2.GitHub Repository
Repository: https://github.com/Stella-Remember/PharmaLink.git

## Branch Structure:
```main```-Stable product code
```develop```-Active development branch
```feature/*```-Individual feature branhes

## 3.Environment  &Project Setup
- Node.js
- npm
- PostgreSQL
- Git

'''
## 3.1. Clone the repository
```
git clone https://github.com/yourusername/pharmalink-rwanda.git
cd pharmalink-rwanda

```

##3.2. Set up backend
```
cd backend
npm install
cp .env.example .env  # Configure your database credentials
npx prisma migrate dev
npm run dev
```
Backend will start on:
```
http://localhost:5000
```
Health check:
```
http://localhost:5000/api/health
```

## 3.3 Set up frontend (in new terminal)
```
cd ../frontend
npm install
npm run dev
```
Frontend will be available at:
```
http://localhost:5173
```

# 4. Environment Variables

Create .env files in both backend/ and frontend/ directories.

Backend (backend/.env)
```
DATABASE_URL="postgresql://user:password@localhost:5432/pharmalink"
JWT_SECRET="your-secret-key-here"
PORT=5000
FRONTEND_URL="http://localhost:5173"
```
Frontend (frontend/.env)
```
VITE_API_URL="http://localhost:5000/api"
```

## 5. Designs (Figma mockups, circuit diagram, screenshots of the app interfaces)

1. Login page: https://www.figma.com/make/JZM9hEvNEatPsjp8OJYsMR/Pharmacy-Inventory-Management-UI--Community-?fullscreen=1&t=dK11TIePXwUbCyvZ-1
2. Pharmacist Dashboard: https://www.figma.com/make/XcHPbzm4aTDP5dUYHpiTf5/Pharmacy-Management-System?fullscreen=1&t=dTetfGuN3se4PwUx-1

## 6. Deployment plan

## Staging Environment

- Frontend: Vercel
- Backend: Railway
- Database: PostgreSQL (Railway-managed)

## 6.2 Production Deployment


 Database Migration
```
# Backup existing data
# Run production migrations
npx prisma migrate deploy
```

 Backend Deployment
   - Push to ``` main``` branch triggers Railway deployment
   - Environment variables configured in Railway dashboard

 Frontend Deployment  
   - Vercel auto-deploys from GitHub
   - Configure API endpoint to production backend

 Verification
   - Run automated tests
   - Manual smoke testing of critical workflows
   - Monitor logs, error rates, and performance metrics

  

  ## 7. CI/CD Pipeline
  
  ```
  name: Deploy PharmaLink
on:
  push:
    branches: [main]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - run: npm test
  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - run: railway up
  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - run: vercel --prod
```

## 8. VIDEO DEMO
Demo Video:
https://drive.google.com/file/d/1_UcWW-IalNt-SoPXk5FG6V8-gP_NeS3I/view?usp=sharing

Video Covers:

1. Application overview

2. Login workflow

3. Dashboard navigation

4. Inventory and POS overview

5. Frontend-backend interaction

6. Deployment explanation



   
