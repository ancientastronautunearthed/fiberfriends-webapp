# Firebase Setup Instructions

## 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: `fiber-friends` (or your preferred name)
4. Enable Google Analytics (optional)
5. Create project

## 2. Configure Authentication
1. In Firebase Console → Authentication → Get started
2. Sign-in method → Google → Enable
3. Add support email address
4. Save

## 3. Create Firestore Database
1. In Firebase Console → Firestore Database → Create database
2. Start in test mode (security rules will be deployed later)
3. Choose location closest to your users
4. Done

## 4. Get Firebase Configuration
1. In Firebase Console → Project Settings (gear icon)
2. General tab → Your apps → Web app
3. Click "Add app" if not created, or click existing app
4. Copy the config values:
   - `apiKey` → `VITE_FIREBASE_API_KEY`
   - `projectId` → `VITE_FIREBASE_PROJECT_ID`
   - `appId` → `VITE_FIREBASE_APP_ID`

## 5. Configure Environment Variables
Create `.env.local` file in project root:
```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_PROJECT_ID=your_project_id_here
VITE_FIREBASE_APP_ID=your_app_id_here
```

## 6. Deploy to Firebase Hosting
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project
firebase init

# Select:
# - Hosting: Configure files for Firebase Hosting
# - Firestore: Configure security rules and indexes

# Build the app
npm run build

# Deploy everything
firebase deploy
```

## 7. Configure OAuth Domains
After deployment, your app will be at `https://your-project-id.web.app`

### Firebase Console
Authentication → Settings → Authorized domains → Add:
- `your-project-id.web.app`
- `your-project-id.firebaseapp.com`

### Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. APIs & Services → Credentials
4. Edit OAuth 2.0 client ID
5. Add to "Authorized JavaScript origins":
   - `https://your-project-id.web.app`
6. Add to "Authorized redirect URIs":
   - `https://your-project-id.web.app/__/auth/handler`
7. Save

## 8. Test Deployment
1. Visit your app at `https://your-project-id.web.app`
2. Test Google sign-in
3. Verify all features work

Your app is now completely independent and deployed on Firebase!