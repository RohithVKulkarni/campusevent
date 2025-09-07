Campus Drive Event Management (Prototype)
Overview
This repository contains a full-stack prototype for a Campus Drive Event Management system. The project provides APIs and interfaces for event creation, student registrations, attendance, feedback collection, and essential reporting features. I designed this system to support both the administrative backend and student/mobile dashboards.

Stack:

Backend: Node.js + Express + SQLite (better-sqlite3)

Frontend: React / Next.js and React Native + Expo

Database: SQLite

Focus:
Backend with RESTful APIs and modular frontend app (both web and mobile).

Deliverables:

Source code

Design Document

Testing Report

AI Usage Proof (self-documented)

Features
Event Management
Admins can create, update, list, or delete campus events.

Student Registration
Secure student sign-up and login.

Register for events (duplicate prevention, field validation).

Attendance Tracking
Mark event attendance per student.

Tracks presence and optionally supports feedback recall.

Feedback Collection
Students can submit a rating and comment after attending an event.

Reporting
See registrations per event.

View attendance percentages.

Get average feedback for each event.

Project Structure
text
CAMPUS-EVENT-ADMIN/
│
├── campus-event-backend/
│   ├── server.js         # Express backend API with SQLite
│   ├── events.db         # Main SQLite database
│   ├── package.json      # Backend dependencies
│
├── src/
│   ├── app/              # Web frontend (Next.js app directory)
│   ├── components/
│   │   └── Providers.tsx # React context/providers for theme/auth
│   └── theme.ts          # Theme settings for frontend
│
├── StudentEventApp/      # Mobile app code (React Native/Expo)
│
├── public/               # Static assets for frontend (if web)
├── README.md             # Project instructions and overview (this file)
├── .env.local            # Local environment variables (not in repo)
├── .gitignore            # Files/folders not to track in Git
├── package.json          # Frontend dependencies
├── tsconfig.json         # TypeScript configuration
Setup Instructions
Backend
Navigate to campus-event-backend

Install backend dependencies:

bash
npm install
Start the backend server:

bash
node server.js
Server runs at http://localhost:4000

Web Frontend
In the project root, install dependencies:

bash
npm install
Start the Next.js development server:

bash
npm run dev
Access the frontend at http://localhost:3000

Mobile App (Optional)
Go to StudentEventApp directory

Install dependencies:

bash
npm install
Start Expo:

bash
npm start
Use Expo Go on your device to test the app.

API Endpoints (Summary)
Event Management
POST /events – Create event

GET /events – List all events

PUT /events – Update event

DELETE /events – Delete event

Student Registration
POST /students – Add a student

POST /login – Student login

POST /register – Register for event

Attendance
POST /attendance – Mark attendance

Feedback
POST /feedback – Send event feedback

Reporting
GET /reports/registrations – All registration stats

GET /reports/attendance – Attendance per event

GET /reports/feedback – Feedback summary

Notes
The backend and frontend projects are separated for modular development.

The SQLite database (events.db) holds all persistent data.

API security (auth, permissions) can be enhanced as a next step.

Contributions and optimizations are welcome!

Proof of AI Usage
While some architectural brainstorming involved AI tools, this README and major documentation reflect my direct understanding of the codebase and project intent.