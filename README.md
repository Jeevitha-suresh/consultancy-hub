# LinkedIn Clone

A full-stack LinkedIn-like web application built using modern web technologies.

## Features

- **Authentication**: JWT-based login/register with role-based access (User, Recruiter, Admin).
- **User Profiles**: Create/edit profiles, upload avatars (Multer), view connections.
- **Feed & Posts**: Create posts with images, like, comment, and view a dynamic feed.
- **Connections**: Send, accept, and reject connection requests. Manage your professional network.
- **Jobs Portal**: Recruiters can post jobs. Users can search and apply for jobs.
- **Real-time Messaging**: Socket.io integration for instant 1-on-1 chat with your connections.
- **Admin Dashboard**: Manage users, posts, and monitor the platform.

## Tech Stack

- **Frontend**: React (Vite), Tailwind CSS, Zustand (State Management), React Router, Axios, Socket.io-client.
- **Backend**: Node.js, Express.js, MongoDB (Mongoose), Socket.io, JSON Web Tokens (JWT), bcrypt.js, Multer.

## Setup Instructions

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB (running locally on `mongodb://localhost:27017` or use a MongoDB Atlas URI)

### Backend Setup
1. Navigate to the `backend` directory: `cd backend`
2. Install dependencies: `npm install`
3. Create a `.env` file based on the provided defaults (or just use the existing one):
   ```
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/linkedin_clone
   JWT_SECRET=supersecretlinkedinclonejwtkey
   NODE_ENV=development
   ```
4. Start the backend server: `node server.js` (or `npm run dev` if nodemon is installed). It will run on `http://localhost:5000`.

### Frontend Setup
1. Navigate to the `frontend` directory: `cd frontend`
2. Install dependencies: `npm install`
3. Start the Vite development server: `npm run dev`
4. Access the application at `http://localhost:5173`.

## Folder Structure

- `/backend`: Contains all Express controllers, routes, models, middleware, and multer config.
- `/frontend`: Contains the Vite+React application with Zustand stores, pages, and components.

## Default Roles
- During registration, you can choose between `User` and `Recruiter`.
- To create an `Admin` account, you will need to manually change the `role` field to `Admin` in your MongoDB database for a specific user, or create a seeder script.

## API Documentation
The REST API follows standard resource conventions:
- `/api/auth`: Register, Login, Get current user.
- `/api/users`: Profile CRUD, Search users.
- `/api/posts`: Feed CRUD, Likes, Comments.
- `/api/connections`: Connection requests, accept/reject, list connections.
- `/api/jobs`: Job CRUD, Apply, List applicants.
- `/api/messages`: Real-time chat history.
- `/api/admin`: Admin-only management routes.
