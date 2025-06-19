
# Fiber Friends - Morgellons Disease Management Platform

## Firebase App Hosting Deployment

### Prerequisites
- Firebase CLI installed: `npm install -g firebase-tools`
- Firebase project with App Hosting enabled
- Blaze pricing plan activated

### Local Development
```bash
npm install
npm run dev
```

### Deployment to Firebase App Hosting
1. Build the project:
```bash
npm run build
```

2. Deploy to Firebase App Hosting:
```bash
firebase deploy --only hosting
```

### Environment Variables
Configure these secrets in Firebase Console:
- `GEMINI_API_KEY`: Your Google Gemini API key

### Firebase Services Used
- **Authentication**: Google OAuth sign-in
- **Firestore Database**: User data and symptom tracking
- **Storage**: File uploads and user-generated content
- **App Hosting**: Static site hosting with CDN

### Project Structure
- `client/` - React frontend application
- `dist/` - Built static files for deployment
- `firebase.json` - Firebase configuration
- `apphosting.yaml` - App Hosting specific configuration
