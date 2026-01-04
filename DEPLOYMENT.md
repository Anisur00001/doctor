# Doctor Consultation App - Deployment Guide

## Table of Contents

1. [Quick Start Guide](#quick-start-guide)
2. [Prerequisites](#prerequisites)
3. [Vercel Deployment](#vercel-deployment)
   - [Frontend Deployment (Next.js)](#frontend-deployment-nextjs)
   - [Backend Deployment (Node.js Serverless)](#backend-deployment-nodejs-serverless)
   - [Environment Configuration](#environment-configuration)
4. [Database Setup (MongoDB Atlas)](#database-setup-mongodb-atlas)
5. [Third-Party Service Configuration](#third-party-service-configuration)
6. [Git Integration & Automatic Deployments](#git-integration--automatic-deployments)
7. [Alternative Platforms](#alternative-platforms)
8. [Security & Performance](#security--performance)
9. [Troubleshooting](#troubleshooting)
10. [Version Compatibility](#version-compatibility)

---

## Quick Start Guide

**For experienced developers who want to deploy immediately:**

1. **Fork/Clone** this repository
2. **Create Vercel account** at [vercel.com](https://vercel.com)
3. **Set up MongoDB Atlas** database
4. **Configure environment variables** (see [Environment Configuration](#environment-configuration))
5. **Deploy frontend**: Connect frontend folder to Vercel
6. **Deploy backend**: Connect backend folder to Vercel
7. **Update CORS settings** in backend with your frontend URL

**Estimated time:** 15-20 minutes

---

## Prerequisites

Before deploying, ensure you have:

- **Git repository** (GitHub, GitLab, or Bitbucket)
- **Vercel account** (free tier available)
- **MongoDB Atlas account** (free tier available)
- **Node.js 18+** installed locally (for testing)
- **Third-party service accounts**:
  - Google Cloud Console (for OAuth)
  - Razorpay account (for payments)
  - ZegoCloud account (for video calls)

---

## Vercel Deployment

Vercel is the recommended platform for this application due to its excellent Next.js support and serverless Node.js capabilities.

### Frontend Deployment (Next.js)

#### Step 1: Prepare Frontend Configuration

The frontend is already configured with the following `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs"
}
```

#### Step 2: Deploy Frontend to Vercel

1. **Login to Vercel Dashboard**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with your Git provider

2. **Import Project**
   - Click "New Project"
   - Import your Git repository
   - Select the **frontend** folder as the root directory

3. **Configure Build Settings**
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend` (select this when importing)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

4. **Deploy**
   - Click "Deploy"
   - Wait for build completion (2-5 minutes)
   - Note your frontend URL (e.g., `https://your-app-frontend.vercel.app`)

#### Step 3: Configure Frontend Environment Variables

In Vercel Dashboard → Project Settings → Environment Variables, add:

```bash
# Backend API URL (replace with your backend URL)
NEXT_PUBLIC_API_URL=https://your-backend-api.vercel.app/api

# ZegoCloud Configuration
NEXT_PUBLIC_ZEGOCLOUD_APP_ID=your-zegocloud-app-id
NEXT_PUBLIC_ZEGOCLOUD_SERVER_SECRET=your-zegocloud-server-secret
```

### Backend Deployment (Node.js Serverless)

#### Step 1: Prepare Backend Configuration

The backend is configured with the following `vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/server.js",
      "methods": ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"]
    }
  ]
}
```

#### Step 2: Deploy Backend to Vercel

1. **Create New Project**
   - In Vercel Dashboard, click "New Project"
   - Import the same Git repository
   - Select the **backend** folder as the root directory

2. **Configure Build Settings**
   - **Framework Preset**: Other
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Output Directory**: Leave empty
   - **Install Command**: `npm install`

3. **Deploy**
   - Click "Deploy"
   - Wait for build completion
   - Note your backend URL (e.g., `https://your-backend-api.vercel.app`)

#### Step 3: Configure Backend Environment Variables

In Vercel Dashboard → Project Settings → Environment Variables, add:

```bash
# MongoDB Connection
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/doctor-consultation

# Server Configuration
PORT=8000
ALLOWED_ORIGINS=https://your-frontend-url.vercel.app

# JWT Secret (generate a strong random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://your-backend-api.vercel.app/api/auth/google/callback

# Razorpay Payment Gateway
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret

# Frontend URL
FRONTEND_URL=https://your-frontend-url.vercel.app
```

### Environment Configuration

#### Required Environment Variables

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/db` | ✅ |
| `JWT_SECRET` | Secret for JWT token signing | `your-super-secret-key` | ✅ |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | `123456789.apps.googleusercontent.com` | ✅ |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | `GOCSPX-xxxxxxxxxxxxx` | ✅ |
| `RAZORPAY_KEY_ID` | Razorpay API key ID | `rzp_test_xxxxxxxxxxxxx` | ✅ |
| `RAZORPAY_KEY_SECRET` | Razorpay API key secret | `xxxxxxxxxxxxxxxxxxxxx` | ✅ |
| `NEXT_PUBLIC_ZEGOCLOUD_APP_ID` | ZegoCloud app ID | `123456789` | ✅ |
| `NEXT_PUBLIC_ZEGOCLOUD_SERVER_SECRET` | ZegoCloud server secret | `xxxxxxxxxxxxxxxxxxxxx` | ✅ |
| `ALLOWED_ORIGINS` | Frontend URL for CORS | `https://your-app.vercel.app` | ✅ |
| `FRONTEND_URL` | Frontend URL for redirects | `https://your-app.vercel.app` | ✅ |
| `NEXT_PUBLIC_API_URL` | Backend API URL | `https://your-api.vercel.app/api` | ✅ |

#### Environment Variable Validation

**JWT_SECRET Requirements:**
- Minimum 32 characters
- Mix of letters, numbers, and symbols
- Generate with: `openssl rand -base64 32`

**URL Format Requirements:**
- Must start with `https://` in production
- No trailing slashes
- Valid domain format

---

## Database Setup (MongoDB Atlas)

### Step 1: Create MongoDB Atlas Account

1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Sign up for free account
3. Create new organization and project

### Step 2: Create Database Cluster

1. **Choose Deployment Type**: Serverless or Shared (M0 for free)
2. **Select Cloud Provider**: AWS (recommended)
3. **Choose Region**: Closest to your users
4. **Cluster Name**: `doctor-consultation-cluster`

### Step 3: Configure Database Access

1. **Create Database User**:
   - Username: `app-user`
   - Password: Generate secure password
   - Role: `readWrite` to any database

2. **Configure Network Access**:
   - Add IP: `0.0.0.0/0` (allow from anywhere)
   - Or add specific Vercel IP ranges for better security

### Step 4: Get Connection String

1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy connection string
4. Replace `<password>` with your database user password
5. Replace `<dbname>` with `doctor-consultation`

**Example connection string:**
```
mongodb+srv://app-user:your-password@doctor-consultation-cluster.abc123.mongodb.net/doctor-consultation?retryWrites=true&w=majority
```

---

## Third-Party Service Configuration

### Google OAuth Setup

#### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project: "Doctor Consultation App"
3. Enable Google+ API

#### Step 2: Configure OAuth Consent Screen

1. Go to APIs & Services → OAuth consent screen
2. Choose "External" user type
3. Fill required fields:
   - App name: "Doctor Consultation"
   - User support email: your email
   - Developer contact: your email

#### Step 3: Create OAuth Credentials

1. Go to APIs & Services → Credentials
2. Click "Create Credentials" → OAuth 2.0 Client IDs
3. Application type: Web application
4. Name: "Doctor Consultation Web Client"
5. Authorized redirect URIs:
   - `https://your-backend-api.vercel.app/api/auth/google/callback`
6. Save and copy Client ID and Client Secret

### Razorpay Setup

#### Step 1: Create Razorpay Account

1. Go to [razorpay.com](https://razorpay.com)
2. Sign up for account
3. Complete KYC verification

#### Step 2: Get API Keys

1. Go to Dashboard → Settings → API Keys
2. Generate new API key pair
3. Copy Key ID and Key Secret
4. **Important**: Use test keys for development, live keys for production

### ZegoCloud Setup

#### Step 1: Create ZegoCloud Account

1. Go to [zegocloud.com](https://www.zegocloud.com)
2. Sign up for account
3. Create new project

#### Step 2: Get App Credentials

1. Go to Project Management
2. Create new project: "Doctor Consultation"
3. Copy App ID and Server Secret
4. Configure authentication settings

---

## Git Integration & Automatic Deployments

### Step 1: Connect Git Repository

1. **In Vercel Dashboard**:
   - Go to Project Settings → Git
   - Connect to your Git repository
   - Configure branch settings

### Step 2: Configure Automatic Deployments

1. **Production Branch**: `main` or `master`
2. **Preview Deployments**: Enable for all branches
3. **Build Settings**:
   - Auto-deploy on push: ✅
   - Preview deployments: ✅

### Step 3: Branch Protection (Recommended)

1. **In GitHub/GitLab**:
   - Go to repository settings
   - Add branch protection rules for `main`
   - Require pull request reviews
   - Require status checks (Vercel deployments)

### Step 4: Deployment Workflow

```
Developer pushes to branch
         ↓
Vercel detects changes
         ↓
Automatic build starts
         ↓
Preview deployment created
         ↓
Merge to main branch
         ↓
Production deployment
```

---

## Alternative Platforms

### Netlify Deployment

**Pros:**
- Excellent static site hosting
- Built-in form handling
- Edge functions for serverless

**Cons:**
- Limited serverless function capabilities
- Less optimal for full-stack apps

**Quick Setup:**
1. Connect Git repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `frontend/.next`
4. Configure environment variables
5. Deploy

### AWS Deployment

**Pros:**
- Full control over infrastructure
- Scalable and enterprise-ready
- Comprehensive service ecosystem

**Cons:**
- More complex setup
- Higher learning curve
- Potentially higher costs

**Services Needed:**
- **Frontend**: S3 + CloudFront
- **Backend**: Lambda + API Gateway
- **Database**: DocumentDB or MongoDB Atlas
- **Authentication**: Cognito (optional)

---

## Security & Performance

### Security Configuration

#### HTTPS and Secure Headers

Vercel automatically provides:
- ✅ SSL/TLS certificates
- ✅ HTTPS redirects
- ✅ Security headers

**Additional Security Headers** (add to `vercel.json`):

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

#### JWT Security Best Practices

1. **Strong Secret**: Use 256-bit random key
2. **Short Expiration**: 15 minutes for access tokens
3. **Refresh Tokens**: Implement for longer sessions
4. **Secure Storage**: HttpOnly cookies preferred

#### Environment Variable Security

1. **Never commit** `.env` files to Git
2. **Use different keys** for development/production
3. **Rotate secrets** regularly
4. **Limit access** to production environment variables

### Performance Optimization

#### CDN and Caching

Vercel provides automatic:
- ✅ Global CDN distribution
- ✅ Static asset caching
- ✅ Image optimization
- ✅ Edge caching

#### Database Optimization

1. **Connection Pooling**: Use MongoDB connection pooling
2. **Indexes**: Add indexes for frequently queried fields
3. **Aggregation**: Use MongoDB aggregation for complex queries
4. **Caching**: Implement Redis for session/data caching

#### Frontend Optimization

1. **Code Splitting**: Next.js automatic code splitting
2. **Image Optimization**: Use Next.js Image component
3. **Bundle Analysis**: Run `npm run analyze` to check bundle size
4. **Lazy Loading**: Implement for non-critical components

---

## Troubleshooting

### Common Deployment Issues

#### Build Failures

**Error**: `Module not found`
```bash
# Solution: Check package.json dependencies
npm install
npm run build  # Test locally first
```

**Error**: `Environment variable not defined`
```bash
# Solution: Add missing environment variables in Vercel dashboard
# Check spelling and ensure all required variables are set
```

**Error**: `API routes not working`
```bash
# Solution: Check vercel.json configuration
# Ensure routes are properly configured for serverless functions
```

#### Database Connection Issues

**Error**: `MongoNetworkError`
```bash
# Solutions:
# 1. Check MongoDB Atlas network access settings
# 2. Verify connection string format
# 3. Ensure database user has correct permissions
# 4. Check if IP whitelist includes 0.0.0.0/0
```

**Error**: `Authentication failed`
```bash
# Solutions:
# 1. Verify database username and password
# 2. Check if user has readWrite permissions
# 3. Ensure password doesn't contain special characters that need encoding
```

#### Third-Party Service Issues

**Google OAuth Error**: `redirect_uri_mismatch`
```bash
# Solution: Update authorized redirect URIs in Google Cloud Console
# Add: https://your-backend-url.vercel.app/api/auth/google/callback
```

**Razorpay Error**: `Invalid key`
```bash
# Solution: Verify Razorpay key ID and secret
# Ensure using correct keys for environment (test vs live)
```

**ZegoCloud Error**: `Invalid app ID`
```bash
# Solution: Check ZegoCloud app ID and server secret
# Ensure credentials match your project settings
```

### Rollback Procedures

#### Vercel Rollback

1. **Via Dashboard**:
   - Go to Deployments tab
   - Find previous successful deployment
   - Click "Promote to Production"

2. **Via CLI**:
   ```bash
   npm i -g vercel
   vercel --prod --force
   ```

#### Git Rollback

```bash
# Revert to previous commit
git revert HEAD

# Or reset to specific commit
git reset --hard <commit-hash>
git push --force-with-lease
```

### Performance Issues

**Slow API Responses**
1. Check database query performance
2. Implement caching strategies
3. Optimize database indexes
4. Use MongoDB aggregation pipelines

**High Memory Usage**
1. Check for memory leaks in serverless functions
2. Optimize image sizes and formats
3. Implement lazy loading
4. Use Next.js dynamic imports

---

## Version Compatibility

### Current Version Requirements

| Component | Version | Notes |
|-----------|---------|-------|
| Node.js | 18.x or 20.x | LTS versions recommended |
| Next.js | 15.5.2 | Latest stable |
| React | 19.1.0 | Latest stable |
| MongoDB | 4.4+ | Atlas recommended |
| Vercel CLI | Latest | For local development |

### Dependency Compatibility Matrix

#### Frontend Dependencies
- **React 19.1.0** ✅ Compatible with Next.js 15.5.2
- **TypeScript 5.x** ✅ Full Next.js support
- **Tailwind CSS 4.x** ✅ Latest version
- **Radix UI** ✅ React 19 compatible

#### Backend Dependencies
- **Express 5.1.0** ✅ Latest stable
- **Mongoose 8.18.0** ✅ MongoDB 4.4+ support
- **JWT 9.0.2** ✅ Latest security updates
- **Passport 0.7.0** ✅ OAuth 2.0 support

### Upgrade Path

#### Minor Updates (Recommended)
```bash
# Update dependencies
npm update

# Check for security vulnerabilities
npm audit fix
```

#### Major Updates (Test Thoroughly)
```bash
# Check outdated packages
npm outdated

# Update major versions one at a time
npm install package@latest

# Test thoroughly before deploying
npm run test
npm run build
```

---

## Changelog

### v1.0.0 (Current)
- Initial deployment guide
- Vercel configuration
- MongoDB Atlas setup
- Third-party service integration
- Security and performance guidelines

### Maintenance Schedule

- **Weekly**: Check for security updates
- **Monthly**: Review dependency versions
- **Quarterly**: Update deployment procedures
- **Annually**: Review and update third-party service configurations

---

## Support

For deployment issues:

1. **Check this guide** for common solutions
2. **Review Vercel documentation** at [vercel.com/docs](https://vercel.com/docs)
3. **Check service status** pages for third-party services
4. **Create GitHub issue** with deployment logs and error messages

**Emergency Rollback**: Follow [Rollback Procedures](#rollback-procedures) section above.