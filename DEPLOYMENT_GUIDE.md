# Fiber Friends - Firebase App Hosting Deployment Guide

## Overview
This application is configured for Firebase App Hosting, which supports both frontend and backend in a single deployment.

## Firebase Architecture
- **Frontend**: React/Vite client on Firebase App Hosting
- **Backend**: Express.js server with AI endpoints on Firebase App Hosting
- **Authentication**: Firebase Auth with Google Sign-in
- **Database**: Cloud Firestore
- **AI Services**: Gemini AI integration for health insights
- **Security**: Firestore security rules

## Prerequisites
1. Firebase CLI installed: `npm install -g firebase-tools`
2. Firebase project created
3. Required environment variables configured

## Required Environment Variables
Set these in your `.env.local` file:

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

## Deployment Steps

### 1. Create Backend in Firebase Console
1. Go to Firebase Console → App Hosting
2. Click "Create backend"
3. Connect your GitHub repository
4. Configure build settings:
   - Build command: `npm run build`
   - Output directory: `dist`
   - Start command: `npm start`

### 2. Configure Environment Variables
In Firebase Console → App Hosting → Your backend → Environment variables:
Add these secrets:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_PROJECT_ID` 
- `VITE_FIREBASE_APP_ID`
- `GEMINI_API_KEY`

### 3. Deploy Backend
```bash
firebase apphosting:backends:create
```

Or use the Firebase Console to trigger deployment from your connected repository.

### 4. Configure Authentication Domains
Your app will be deployed to a Firebase App Hosting URL like:
`https://your-backend-id--your-project-id.web.app`

In Firebase Console → Authentication → Settings → Authorized domains:
Add your App Hosting domain

In Google Cloud Console → APIs & Services → Credentials:
Add to OAuth 2.0 client:
- **Authorized JavaScript origins**: Your App Hosting URL
- **Authorized redirect URIs**: `https://your-app-url/__/auth/handler`

## Production URL
Your app will be available at:
- `https://your-backend-id--your-project-id.web.app`

## Custom Domain (Optional)
1. In Firebase Console → Hosting → Add custom domain
2. Follow DNS configuration steps
3. Update OAuth settings with your custom domain

## Files Configured for Firebase Hosting
- `firebase.json` - Hosting configuration with SPA routing
- `firestore.rules` - Database security rules
- `firestore.indexes.json` - Database indexes
- Build output in `dist/` folder

## Firebase App Hosting Features
✅ Full-stack application with Express.js backend
✅ AI-powered health insights via Gemini API
✅ Real-time data operations with Cloud Firestore
✅ Secure authentication via Firebase Auth
✅ Server-side API endpoints for advanced functionality
✅ Environment variable management for secrets
✅ Complete Firebase ecosystem integration

The application is now configured for Firebase App Hosting deployment with both frontend and backend capabilities.