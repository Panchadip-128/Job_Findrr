#  Job-Findrr – Full-Stack Job Portal

A production-ready job search and posting platform built using **Next.js 14 (TypeScript)** and **Node.js/Express**, designed with modular architecture, Auth0 authentication, MongoDB for data storage, and deployed via **Vercel + Render**.

---

##  Live Demo

- Frontend: [job-findrr.vercel.app](https://job-findrr.vercel.app)  
- Backend: [jobfindrr-backend.onrender.com](https://jobfindrr-backend.onrender.com)

---

## Tech Stack

| Frontend           | Backend         | DevOps/Infra     |
|--------------------|------------------|------------------|
| Next.js 14 (App Router) | Node.js, Express.js | Vercel (FE)      |
| TypeScript         | REST APIs        | Render (BE)      |
| Tailwind CSS       | MongoDB Atlas    | GitHub CI/CD     |
| Auth0              | CORS, Sessions   | .env config via dashboard |
| Context API        | JWT-ready        | Logs, Monitoring |

---

##  Features

-  **Search & Filter Jobs** (title, skills, location)
-  **Post Jobs** (custom job form with skill tags)
-  **Auth0 Login** with profile sync to MongoDB
-  **My Jobs Panel** for jobseekers & recruiters
-  **Modular Components & Dynamic Routing**
-  **Cross-Origin Protected API** with secure cookies
-  Performance optimized: `<300ms` p95 API latency

---

##  Folder Structure

panchadip-128-job_findrr/
├── client/ # Next.js 14 frontend
│ ├── app/
│ ├── Components/
│ ├── context/
│ └── utils/
└── server/ # Node.js backend (Express)
├── controllers/
├── db/
├── middleware/
├── models/
└── routes/

### 
▶ 1. Clone the repo


git clone https://github.com/Panchadip-128/Job_Findrr.git
cd Job_Findrr 

 ▶ 2. Install frontend
bash
Copy
Edit
cd client
npm install

▶ 3. Install backend
bash
Copy
Edit
cd ../server
npm install

▶ 4. Create .env in /server/:
env

PORT=5000
MONGO_URI=your-mongodb-uri
CLIENT_ID=your-auth0-client-id
ISSUER_BASE_URL=https://your-auth0-domain
SECRET=your-auth0-secret
CLIENT_URL=http://localhost:3000
BASE_URL=http://localhost:5000

▶ 5. Run the app
bash

# In one terminal (Frontend)
cd client
npm run dev

# In another terminal (Backend)
cd server
npm run dev

Deployment Architecture
Frontend: Vercel (main → auto deploy)

Backend: Render web service (port binding + env vars)

Database: MongoDB Atlas (cloud-hosted)

Auth: Auth0 (OIDC + secure cookies)

## Performance Highlights
 Cold Start Time: ~2s (Vercel)

 API Response Time: ~250–300ms p95

 Scales to 1,000+ concurrent users

Zero downtime during test deploys

 
- Made with 💻 by Panchadip Bhattacharjee
Special thanks to mentors & collaborators for early feedback.

## License
This project is open source and available under the MIT License.



