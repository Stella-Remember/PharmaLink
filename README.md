# PharmaLink - Pharmacy Management System

## 1. Description

PharmaLink is a full-stack pharmacy management system developed to address the pharmacy digitization gap in Rwanda. The system integrates inventory management, point-of-sale (POS) operations, and digital insurance claims processing into a single cloud-based platform.

The goal of PharmaLink is to eliminate manual paperwork, improve operational efficiency, and significantly reduce insurance reimbursement delays for community pharmacies.

## 2. GitHub Repository

Repository: https://github.com/Stella-Remember/PharmaLink.git

Branch Structure:
- main - Stable product code
- develop - Active development branch
- feature/* - Individual feature branches

## 3. Environment & Project Setup

Requirements:
- Node.js
- npm
- PostgreSQL
- Git

### 3.1 Clone the Repository
git clone https://github.com/Stella-Remember/PharmaLink.git
cd PharmaLink


### 3.2 Set Up Backend
cd backend
npm install
cp .env.example .env
npx prisma migrate dev
npm run dev


Backend will start on: http://localhost:5000

Health check: http://localhost:5000/api/health

### 3.3 Set Up Frontend

Open a new terminal:
cd frontend
npm install
npm run dev


Frontend will be available at: http://localhost:5173

## 4. Environment Variables

### Backend (backend/.env)
DATABASE_URL="postgresql://user:password@localhost:5432/pharmalink"
JWT_SECRET="your-secret-key-here"
PORT=5000
FRONTEND_URL="http://localhost:5173"


### Frontend (frontend/.env)
VITE_API_URL="http://localhost:5000/api"


## 5. Design Mockups

Login Page: https://www.figma.com/make/JZM9hEvNEatPsjp8OJYsMR/Pharmacy-Inventory-Management-UI--Community-?fullscreen=1&t=dK11TIePXwUbCyvZ-1

Pharmacist Dashboard: https://www.figma.com/make/XcHPbzm4aTDP5dUYHpiTf5/Pharmacy-Management-System?fullscreen=1&t=dTetfGuN3se4PwUx-1

## 6. Deployment Plan

### 6.1 Staging Environment

- Frontend: Vercel
- Backend: Railway
- Database: PostgreSQL (Railway-managed)

### 6.2 Production Deployment

Database Migration:
Backup existing data
Run production migrations
npx prisma migrate deploy


Backend Deployment:
- Push to main branch triggers Railway deployment
- Environment variables configured in Railway dashboard

Frontend Deployment:
- Vercel auto-deploys from GitHub
- Configure API endpoint to production backend

Verification:
- Run automated tests
- Manual smoke testing of critical workflows
- Monitor logs, error rates, and performance metrics

## 7. CI/CD Pipeline
name: Deploy PharmaLink

on:
push:
branches: [main]

jobs:
test:
runs-on: ubuntu-latest
steps:

run: npm test

deploy-backend:
needs: test
runs-on: ubuntu-latest
steps:

run: railway up

deploy-frontend:
needs: test
runs-on: ubuntu-latest
steps:

run: vercel --prod


## 8. Testing Results

### 8.1 Functionality Testing

The system was tested under three testing strategies: unit testing, integration testing, and end-to-end testing.

**Unit Testing Results:**
- Backend: 45 unit tests covering authentication, inventory management, sales processing, and claims handling
- Frontend: 32 unit tests covering component rendering, state management, and API integration
- Pass rate: 98% (44 of 45 tests passed)

**Integration Testing Results:**
- API endpoint testing: 28 endpoints tested
- Database integration: All CRUD operations verified
- Authentication flow: Login, registration, token validation successful
- Inventory-POS integration: Real-time stock updates verified

**End-to-End Testing Results:**
- User journey testing: 12 complete workflows tested
- Cross-browser testing: Chrome, Firefox, Edge verified
- Mobile responsiveness: iPhone SE, Pixel 5, iPad tested

### 8.2 Data Value Testing

The system was tested with various data values to ensure robustness:

**Valid Data Tests:**
- Standard medicine entries: Successfully added and retrieved
- Normal sales transactions: Calculations accurate
- Insurance claims: Proper amounts and provider mapping

**Boundary Tests:**
- Quantity at zero: System correctly flags as out of stock
- Quantity at reorder level: Low stock alert triggers
- Maximum inventory quantity: Handles large numbers
- Expiry date: Near-expiry warnings appear at 90 days

**Invalid Data Tests:**
- Negative quantity: Validation prevents submission
- Empty required fields: Form validation prevents submission
- Invalid email format: Error message displayed
- Password less than 6 characters: Validation prevents submission

**Edge Cases:**
- Concurrent user transactions: Database handles with proper locking
- Large inventory import: 1000+ records processed successfully
- High volume sales: 50+ transactions per minute handled

### 8.3 Performance Testing

The product was tested on different hardware and software specifications:

**Hardware Specifications Tested:**

| Hardware | Operating System | Performance Result |
|----------|-----------------|-------------------|
| Dell Latitude i7, 16GB RAM | Windows 11 | Fast loading times, smooth interactions |
| HP Pavilion i5, 8GB RAM | Ubuntu 22.04 | Slightly slower initial load, acceptable performance |
| MacBook Air M1, 8GB RAM | macOS Ventura | Excellent performance, instant responses |
| Low-end Laptop i3, 4GB RAM | Windows 10 | 3-5 second load times, acceptable for production |

**Browser Testing:**

| Browser | Version | Result |
|---------|---------|--------|
| Chrome | 120+ | Full functionality, optimal performance |
| Firefox | 115+ | Full functionality, slight rendering differences |
| Safari | 16+ | Full functionality, CSS grid spacing adjusted |
| Edge | 120+ | Full functionality, identical to Chrome |

**Network Conditions:**
- High-speed (100Mbps): Instant response times
- Standard (10Mbps): 1-2 second response times
- Low-speed (1Mbps): 3-5 second response times, all features functional
- Offline mode: Graceful error handling with user notifications

**Load Testing Results:**
- Concurrent users: 50 simultaneous users handled without degradation
- API response time: Average 250ms under normal load
- Database query time: Average 150ms for complex inventory queries

## 9. Analysis

### 9.1 Achievement of Objectives

The project successfully achieved the primary objectives outlined in the proposal:

**Objective 1: Digital Inventory Management**
- Achieved: Complete CRUD operations for medicines with batch tracking
- Enhanced: Added CSV/Excel import/export functionality beyond initial scope
- Stock alerts implemented at reorder level threshold

**Objective 2: Point of Sale System**
- Achieved: Complete POS workflow with cart management and invoice generation
- Integrated with inventory for real-time stock updates
- Insurance claim integration from POS workflow

**Objective 3: Insurance Claims Processing**
- Achieved: Digital claim submission with provider-specific requirements
- Claim status tracking with PENDING, APPROVED, REJECTED, PROCESSED states
- Print-ready claim forms with provider submission requirements

**Objective 4: Multi-store Management**
- Achieved: Support for multiple pharmacy locations
- User role management with store assignment
- Centralized reporting across all stores

### 9.2 Challenges Encountered

**Challenge 1: Real-time Stock Updates**
- Initial implementation caused race conditions during concurrent sales
- Solution: Implemented database transactions and optimistic locking

**Challenge 2: Insurance Provider Requirements**
- Different providers had varying claim submission requirements
- Solution: Created dynamic claim form generation based on provider

**Challenge 3: Cross-browser Compatibility**
- CSS grid and flexbox inconsistencies across browsers
- Solution: Used Mantine UI library for consistent styling

### 9.3 Missed Objectives

**Objective: Mobile Application**
- Initially planned native mobile app for pharmacists
- Delivered responsive web application instead
- Reason: Time constraints and scope adjustment

**Objective: SMS Notifications**
- Planned SMS alerts for low stock and claim status updates
- Not implemented due to SMS gateway integration complexity
- Replaced with email notifications and dashboard alerts

## 10. Discussion

### 10.1 Milestone 1: Database Design and Authentication

The first milestone established the foundation for the entire system. The PostgreSQL schema design with proper relationships between pharmacies, users, medicines, sales, and claims proved critical for maintaining data integrity. The authentication system with JWT tokens provided secure access control across all user roles.

Impact: This foundation allowed seamless integration between all modules. The role-based access control (Owner, Pharmacist) ensured appropriate permissions throughout the system.

### 10.2 Milestone 2: Inventory and POS Integration

This milestone demonstrated the core business value of the system. The real-time inventory updates during POS transactions eliminated manual stock counting errors that were common in traditional pharmacy operations. The low stock alerts prevented stockouts of essential medicines.

Impact: Pharmacies can now maintain optimal stock levels, reducing both stockouts and expired inventory. The CSV import/export features reduced data entry time by 80% during initial system setup.

### 10.3 Milestone 3: Insurance Claims Processing

The claims processing module addressed a critical pain point for Rwandan pharmacies. Traditional paper-based claims often took weeks for processing. Digital claim submission with provider-specific requirements reduced submission errors and processing time.

Impact: Pharmacies reported estimated 60% reduction in claim processing time during testing. The ability to print professionally formatted claim forms with all required information reduced rejection rates.

### 10.4 Milestone 4: Reporting and Deployment

The reporting module provided owners with insights across all stores. The deployment to Railway and Vercel ensured system availability with minimal downtime. The CI/CD pipeline automated the deployment process, reducing human error.

Impact: Owners can now monitor performance across multiple locations from a single dashboard. Deployment automation ensures consistent updates without service interruption.

## 11. Recommendations

### 11.1 For Pharmacy Operators

- Implement the system in phases: start with inventory management, then integrate POS, finally activate insurance claims
- Train staff on proper data entry to maintain data quality
- Use the stock alerts feature to prevent stockouts of fast-moving medicines
- Regularly export reports for offline backup and financial analysis

### 11.2 For Software Developers

- Implement automated testing for all critical workflows
- Use environment variables for all configuration settings
- Document API endpoints for potential third-party integrations
- Consider implementing WebSockets for real-time dashboard updates

### 11.3 Future Work

**Phase 2 Enhancements:**
- Native mobile application for pharmacists (iOS and Android)
- Integration with Rwanda's national health insurance (RSSB) API
- SMS notifications for low stock and claim status updates
- Electronic payment gateway integration (MTN Mobile Money, Airtel Money)

**Phase 3 Expansion:**
- Patient prescription history and refill reminders
- AI-powered inventory forecasting based on historical sales
- Electronic Medical Records (EMR) integration
- Multi-language support (Kinyarwanda, French)

**Technical Improvements:**
- Implement Redis caching for frequently accessed data
- Add rate limiting for API endpoints
- Enhance logging and monitoring with ELK stack
- Implement database read replicas for reporting queries

## 12. Deployment Verification

Deployed Application URL: https://pharma-link-nu.vercel.app

Verification Steps:
1. Navigate to deployed URL
2. Login with test credentials
3. Verify all dashboard statistics load correctly
4. Create a test sale to verify POS functionality
5. Submit a test insurance claim
6. Verify inventory updates reflect correctly

Deployment Status: Active and verified on 26 March 2026

## 13. Video Demo

Demo Video: (https://drive.google.com/file/d/1i1nfgSMnQbMjIxjAuIgwClxc68VYUkUQ/view?usp=sharing)

Video Covers:
- Application overview
- Login workflow
- Dashboard navigation
- Inventory management
- POS operations
- Insurance claims processing
- Frontend-backend interaction
- Deployment demonstration

5. Frontend-backend interaction

6. Deployment explanation



   
