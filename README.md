# Doctor Consultation App

A full-stack doctor consultation application built with Next.js (frontend) and Express.js (backend), featuring video consultations, appointment booking, and payment integration.

## Project Structure

```
doctor-consultation-app/
├── backend/          # Express.js backend API
├── frontend/         # Next.js frontend application
└── README.md         # This file
```

## Prerequisites

Before setting up the project, make sure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (comes with Node.js)
- **MongoDB** (local installation or MongoDB Atlas account)
- **Git**

## Setup Instructions

### 1. Clone the Repository

The repository has already been cloned. If you need to clone it again:

```bash
git clone https://github.com/agraharidheeraj/doctor-consultation-app.git
cd doctor-consultation-app
```

### 2. Backend Setup

#### Install Dependencies

Dependencies are already installed. If you need to reinstall:

```bash
cd backend
npm install
```

#### Configure Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/doctor-consultation
# Or use MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/doctor-consultation

# Server Configuration
PORT=8000
ALLOWED_ORIGINS=http://localhost:3000

# JWT Secret (generate a strong random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Google OAuth (for Google Sign-In)
# Get these from: https://console.cloud.google.com/apis/credentials
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:8000/api/auth/google/callback

# Razorpay Payment Gateway
# Get these from: https://dashboard.razorpay.com/app/keys
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

**Important:** Replace all placeholder values with your actual credentials.

#### Start the Backend Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The backend server will run on `http://localhost:8000` (or the PORT you specified).

### 3. Frontend Setup

#### Install Dependencies

Dependencies are already installed. If you need to reinstall:

```bash
cd frontend
npm install
```

#### Configure Environment Variables

Create a `.env.local` file in the `frontend` directory with the following variables:

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# ZegoCloud Video Call Configuration
# Get these from: https://console.zegocloud.com/
NEXT_PUBLIC_ZEGOCLOUD_APP_ID=your-zegocloud-app-id
NEXT_PUBLIC_ZEGOCLOUD_SERVER_SECRET=your-zegocloud-server-secret
```

**Important:** Replace all placeholder values with your actual credentials.

#### Start the Frontend Development Server

```bash
# Development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

The frontend application will run on `http://localhost:3000`.

## Getting API Keys

### MongoDB

1. **Local MongoDB**: Install MongoDB locally and use `mongodb://localhost:27017/doctor-consultation`
2. **MongoDB Atlas**: 
   - Sign up at https://www.mongodb.com/cloud/atlas
   - Create a free cluster
   - Get your connection string from "Connect" → "Connect your application"

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Set authorized redirect URI: `http://localhost:8000/api/auth/google/callback`
6. Copy the Client ID and Client Secret

### Razorpay

1. Sign up at [Razorpay](https://razorpay.com/)
2. Go to Dashboard → Settings → API Keys
3. Generate Test/Live keys
4. Copy the Key ID and Key Secret

### ZegoCloud

1. Sign up at [ZegoCloud](https://www.zegocloud.com/)
2. Create a new project
3. Go to Project Settings
4. Copy the App ID and Server Secret

## Running the Application

1. **Start MongoDB** (if using local MongoDB):
   ```bash
   # On Windows
   mongod

   # On macOS/Linux
   sudo systemctl start mongod
   # or
   mongod
   ```

2. **Start the Backend Server**:
   ```bash
   cd backend
   npm run dev
   ```

3. **Start the Frontend Server** (in a new terminal):
   ```bash
   cd frontend
   npm run dev
   ```

4. **Open your browser** and navigate to `http://localhost:3000`

## Features

- 🔐 User Authentication (Email/Password & Google OAuth)
- 👨‍⚕️ Doctor and Patient Dashboards
- 📅 Appointment Booking System
- 💳 Payment Integration (Razorpay)
- 📹 Video Consultations (ZegoCloud)
- 📝 Prescription Management
- 👤 User Profiles

## API Endpoints

The backend API is available at `http://localhost:8000/api`:

- `/api/auth` - Authentication routes
- `/api/doctor` - Doctor-related routes
- `/api/patient` - Patient-related routes
- `/api/appointment` - Appointment management
- `/api/payment` - Payment processing
- `/health` - Health check endpoint

## Troubleshooting

### Backend Issues

- **MongoDB Connection Error**: Make sure MongoDB is running and the `MONGO_URI` is correct
- **Port Already in Use**: Change the `PORT` in `.env` or stop the process using port 8000
- **JWT Errors**: Make sure `JWT_SECRET` is set and is a strong random string

### Frontend Issues

- **API Connection Error**: Verify `NEXT_PUBLIC_API_URL` points to your backend server
- **Video Call Not Working**: Check ZegoCloud credentials in `.env.local`
- **Build Errors**: Make sure all dependencies are installed with `npm install`

## Development

### Backend Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon

### Frontend Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server

## License

This project is open source and available under the MIT License.

## Support

For issues and questions, please open an issue on the GitHub repository.

# Doctor
# doctor
