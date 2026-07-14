
# Crypto ROI Platform

A professional crypto investment platform with multi-role user management, investment plans, MLM rewards, and peer-to-peer transfers.

## Project Overview

This is a full-stack application built with:
- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express + MongoDB
- **Features**: 
  - User authentication & authorization
  - Multiple dashboards (Client, Admin, Manager)
  - Investment plans with daily ROI
  - MLM (Multi-Level Marketing) tree structure
  - Peer-to-peer (P2P) transfers
  - Multiple wallet management
  - Deposit/Withdrawal system
  - Notifications & email system

## Directory Structure

```
Crypto ROI/
├── client/          # React frontend
└── server/          # Node.js backend
```

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## Setup Instructions

### 1. Clone or download the project

### 2. Backend Setup (Server)

1. Navigate to server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   Copy `server/.env.example` to `server/.env` and fill in your values.

4. Start the server:
   ```bash
   npm start
   ```
   Server will run on http://localhost:4000 (or your configured PORT)

### 3. Frontend Setup (Client)

1. Navigate to client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   Client will run on http://localhost:5173

## Environment Variables (Server)

Create a `.env` file in the `server/` directory with the following variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `4000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/crypto-roi` |
| `JWT_SECRET` | Secret key for JWT tokens | `your-secret-key-here` |
| `Client` | Frontend URL | `http://localhost:5173` |
| `CLIENT` | Frontend URL (alternative) | `http://localhost:5173` |
| `EMAIL_USER` | Email address for sending mails | `your-email@gmail.com` |
| `EMAIL_PASS` | Email password or app password | `your-app-password` |
| `SUPER_ADMIN_EMAILS` | Super admin email(s) | `admin@yourdomain.com` |
| `SUPER_ADMIN_EMAIL` | Super admin email (alternative) | `admin@yourdomain.com` |

## Tech Stack

### Frontend
- React 19
- Vite
- Tailwind CSS
- React Router DOM
- Axios
- Framer Motion
- Recharts

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Nodemailer
- Node-cron (for ROI calculations)

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

ISC

