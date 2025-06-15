# Firebase Authentication Troubleshooting Guide

## Current Issue
Getting authentication errors even after adding authorized domain to Firebase.

## Required Firebase Console Configuration

### 1. Firebase Project Settings
Go to Firebase Console → Project Settings → General tab:

**Your current domain to add:**
```
4d19c851-2eaf-4c4a-9580-23abce8e833f-00-1dpmj2gszsi8k.picard.replit.dev
```

### 2. Authentication Configuration
Go to Firebase Console → Authentication → Settings:

**Authorized domains section:**
Add these domains:
- `4d19c851-2eaf-4c4a-9580-23abce8e833f-00-1dpmj2gszsi8k.picard.replit.dev`
- `localhost` (for development)
- Your future production domain when deployed

### 3. Google Sign-in Method
Go to Firebase Console → Authentication → Sign-in method:

1. Click on "Google" provider
2. Enable it if not already enabled
3. Add your project's support email
4. Save changes

### 4. OAuth Configuration
Go to Google Cloud Console (console.cloud.google.com):

1. Select your Firebase project
2. Go to APIs & Services → Credentials
3. Find your OAuth 2.0 client ID (Web application)
4. Under "Authorized JavaScript origins", add:
   ```
   https://4d19c851-2eaf-4c4a-9580-23abce8e833f-00-1dpmj2gszsi8k.picard.replit.dev
   ```
5. Under "Authorized redirect URIs", add:
   ```
   https://4d19c851-2eaf-4c4a-9580-23abce8e833f-00-1dpmj2gszsi8k.picard.replit.dev/__/auth/handler
   ```
6. Save changes

## Common Issues and Solutions

### Issue 1: "popup-closed-by-user"
- User manually closed the popup
- Try the sign-in process again
- Ensure popups are not blocked in browser

### Issue 2: "auth/popup-blocked"
- Browser blocked the popup
- Allow popups for this site
- Try using a different browser

### Issue 3: "redirect_uri_mismatch"
- Domain not properly configured in OAuth settings
- Follow step 4 above carefully
- Wait 5-10 minutes after making changes

### Issue 4: "invalid_request"
- OAuth client configuration issue
- Verify all domains are properly added
- Check that OAuth client is correctly linked to Firebase

## Testing Steps
1. Clear browser cache and cookies
2. Try sign-in in incognito/private mode
3. Check browser console for detailed error messages
4. Verify all configuration changes are saved

## Alternative Solution: Test with Different Email
If issues persist, try signing in with a different Google account to isolate whether it's user-specific or configuration-specific.