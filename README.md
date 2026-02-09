# PharmaLink [Initial Software Demonstration Document]
## 1. Description 
PharmaLink is a full stack pharmacy management system that was developed as a response to the Rwanda pharmacy digitization gap. It unites inventory, point-of-sale operations, and digital insurance claims processing in one cloud system, eliminating manual paperwork and expediting insurance payments to the community pharmacies.

## 2.GitHub Repository
Repository: https://github.com/Stella-Remember/PharmaLink.git

## Branch Structure:
'''main'''-Stable product code
'''develop'''-Active development branch
'''feature'''-Individual feature branhes

## Environment  &Project Setup
- Node.js
- npm
- PostgreSQL
- Git

'''
# 1. Clone the repository
git clone https://github.com/yourusername/pharmalink-rwanda.git
cd pharmalink-rwanda

# 2. Set up backend
cd backend
npm install
cp .env.example .env  # Configure your database credentials
npx prisma migrate dev
npm run dev

# 3. Set up frontend (in new terminal)
cd ../frontend
npm install
npm run dev

# 4. Access the application
# Frontend: http://localhost:5173
# Backend API: http://localhost:5000/api/health

'''
## Environment Variables

Create .env files in both backend/ and frontend/ folders

backend(.env):

'''
DATABASE_URL="postgresql://user:password@localhost:5432/pharmalink"
JWT_SECRET="your-secret-key-here"
PORT=5000
FRONTEND_URL="http://localhost:5173"
'''

Frontend(.env)

''' VITE_API_URL="http://localhost:5000/api" '''

## Designs (Figma mockups, circuit diagram, screenshots of the app interfaces)

1. Login page: https://www.figma.com/make/JZM9hEvNEatPsjp8OJYsMR/Pharmacy-Inventory-Management-UI--Community-?fullscreen=1&t=dK11TIePXwUbCyvZ-1
2. Pharmacist Dashboard: https://www.figma.com/make/XcHPbzm4aTDP5dUYHpiTf5/Pharmacy-Management-System?fullscreen=1&t=dTetfGuN3se4PwUx-1

## Deployment plan

## Staging Environment

Frontend: 
Backend: 
Database: 

## Production Deployment

'''
1. Database Migration
   - Backup existing data
   - Run production migrations: npx prisma migrate deploy

2. Backend Deployment
   - Push to main branch triggers Railway deployment
   - Environment variables configured in Railway dashboard

3. Frontend Deployment  
   - Vercel auto-deploys from GitHub
   - Configure API endpoint to production backend

4. Verification
   - Run automated tests
   - Manual smoke testing of critical paths
   - Monitor error rates and performance

  '''

  ## CI/CD Pipeline
  '''
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
      '''




## link to the GitHub repo


   
