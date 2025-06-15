# Quick Fix for Firebase Authentication

## The Real Issue
Adding domains to Firebase Console alone isn't enough. You need to configure Google Cloud Console OAuth settings.

## Required Steps (in order):

### 1. Go to Google Cloud Console
Visit: https://console.cloud.google.com/

### 2. Select Your Firebase Project
Make sure you're in the same project as your Firebase app

### 3. Navigate to Credentials
Go to: APIs & Services → Credentials

### 4. Find Your OAuth 2.0 Client
Look for "Web application" type client ID (created by Firebase)

### 5. Edit the OAuth Client
Click the pencil icon to edit

### 6. Add JavaScript Origins
Under "Authorized JavaScript origins", add:
```
https://4d19c851-2eaf-4c4a-9580-23abce8e833f-00-1dpmj2gszsi8k.picard.replit.dev
```

### 7. Add Redirect URIs
Under "Authorized redirect URIs", add:
```
https://4d19c851-2eaf-4c4a-9580-23abce8e833f-00-1dpmj2gszsi8k.picard.replit.dev/__/auth/handler
```

### 8. Save Changes
Click "SAVE" at the bottom

### 9. Wait 5-10 Minutes
OAuth changes take time to propagate

### 10. Test Again
Try the sign-in process again after waiting

## If Still Not Working
Clear browser cache completely or try incognito mode.