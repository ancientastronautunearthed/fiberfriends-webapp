# Firebase Setup Instructions for Fiber Friends

## Required Firebase Configuration Steps

### 1. Firestore Security Rules
Copy the rules from `firestore.rules` into your Firebase Console:
1. Go to Firebase Console → Firestore Database → Rules
2. Replace the default rules with the content from `firestore.rules`
3. Click "Publish" to apply the rules

### 2. Authentication Setup
1. Go to Firebase Console → Authentication → Sign-in method
2. Enable Google Sign-in provider
3. Add your domain to authorized domains:
   - For development: `localhost`, `127.0.0.1`, your Replit preview URL
   - For production: your custom domain or `.replit.app` domain

### 3. Required Environment Variables
Ensure these Firebase secrets are configured in your Replit environment:
- `VITE_FIREBASE_API_KEY` - Your Firebase API key
- `VITE_FIREBASE_PROJECT_ID` - Your Firebase project ID  
- `VITE_FIREBASE_APP_ID` - Your Firebase app ID

### 4. Firestore Collections Structure
The application will automatically create these collections:
- `users` - User profiles and settings
- `dailySymptomLogs` - Daily health check-ins
- `aiCompanions` - AI companion configurations
- `conversationHistory` - Chat messages with AI companions
- `aiHealthInsights` - Personalized health insights
- `communityPosts` - Community forum posts
- `challenges` - Health challenges and activities
- `userChallenges` - User participation in challenges
- `achievements` - Available achievements
- `userAchievements` - User unlocked achievements
- `pointActivities` - Points earning history
- `anonymizedResearchData` - Anonymized health data for research

## Migration Status
✅ Firebase Authentication integrated
✅ Firestore service layer created
✅ Daily symptom logging converted
✅ Research data system converted
✅ Security rules defined
⚠️ Requires Firestore rules deployment in Firebase Console