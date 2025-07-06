# Firebase Setup Guide

This project has been migrated from Supabase to Firebase for authentication and data storage. Follow these steps to set up Firebase:

## 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter a project name (e.g., "cityconnect-unite-share")
4. Choose whether to enable Google Analytics (optional)
5. Click "Create project"

## 2. Enable Authentication

1. In your Firebase project, go to "Authentication" in the left sidebar
2. Click "Get started"
3. Go to the "Sign-in method" tab
4. Enable "Email/Password" authentication
5. Click "Save"

## 3. Set up Firestore Database

1. In your Firebase project, go to "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in test mode" for development (you can add security rules later)
4. Select a location for your database
5. Click "Done"

## 4. Get Your Firebase Configuration

1. In your Firebase project, click the gear icon next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. Click the web icon (</>) to add a web app
5. Register your app with a nickname (e.g., "cityconnect-web")
6. Copy the Firebase configuration object

## 5. Update Firebase Configuration

1. Open `src/integrations/firebase/config.ts`
2. Replace the placeholder configuration with your actual Firebase config:

```typescript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id"
};
```

## 6. Set up Firestore Security Rules (Optional)

For production, you should set up proper security rules. Here's a basic example:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read and write their own profile
    match /profiles/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow authenticated users to read all profiles (for display purposes)
    match /profiles/{document=**} {
      allow read: if request.auth != null;
    }
    
    // Allow authenticated users to create and manage issues
    match /issues/{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // Allow authenticated users to manage comments
    match /comments/{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // Allow authenticated users to manage community features
    match /community/{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // Allow authenticated users to manage emergency alerts
    match /emergencyAlerts/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 7. Test Your Setup

1. Run the development server: `npm run dev`
2. Try to sign up for a new account
3. Test creating issues and comments
4. Verify that government users can post emergency alerts

## Features Implemented

- **Authentication**: Email/password sign up and sign in
- **User Profiles**: Automatic profile creation with role-based permissions
- **Issues Management**: Create, read, update issues with real-time updates
- **Comments**: Add comments to issues with role-based indicators
- **Community Chat**: Real-time chat functionality
- **Emergency Alerts**: Government-only emergency alert posting
- **Real-time Updates**: Live updates using Firestore listeners

## Data Structure

The app uses the following Firestore collections:

- `profiles`: User profiles with roles (citizen/government)
- `issues`: Community issues with status tracking
- `comments`: Comments on issues
- `community_chat`: Real-time community chat messages
- `emergency_alerts`: Emergency alerts from government officials

## Troubleshooting

- **Authentication errors**: Make sure Email/Password auth is enabled
- **Database errors**: Check that Firestore is created and in test mode
- **Permission errors**: Verify your security rules allow the operations you're trying to perform
- **Configuration errors**: Double-check your Firebase config values

## Next Steps

1. Set up proper security rules for production
2. Add email verification
3. Implement password reset functionality
4. Add social authentication (Google, Facebook, etc.)
5. Set up Firebase Hosting for deployment

## Current Configuration
Your Firebase project is configured with the following details:
- **Project ID**: cityconnect-f5099
- **Auth Domain**: cityconnect-f5099.firebaseapp.com
- **API Key**: AIzaSyDRZs0HYpV6-nDOEgTNIn6ON6K-lgQC_jc

## Troubleshooting Sign-Up Issues

### 1. Enable Email/Password Authentication
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `cityconnect-f5099`
3. Navigate to **Authentication** → **Sign-in method**
4. Enable **Email/Password** provider
5. Make sure **Email link (passwordless sign-in)** is disabled if you only want email/password

### 2. Check Firestore Security Rules
Your Firestore security rules should allow authenticated users to read/write their own profiles:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read and write their own profile
    match /profiles/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow authenticated users to read all profiles (for display purposes)
    match /profiles/{document=**} {
      allow read: if request.auth != null;
    }
    
    // Allow authenticated users to create and manage issues
    match /issues/{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // Allow authenticated users to manage comments
    match /comments/{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // Allow authenticated users to manage community features
    match /community/{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // Allow authenticated users to manage emergency alerts
    match /emergencyAlerts/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 3. Check Authorized Domains
1. Go to **Authentication** → **Settings** → **Authorized domains**
2. Make sure your development domain is added:
   - `localhost` (for development)
   - `127.0.0.1` (for development)
   - Your production domain (when deployed)

### 4. Enable Firestore Database
1. Go to **Firestore Database**
2. If not created, click **Create database**
3. Choose **Start in test mode** for development
4. Select a location (preferably close to your users)

### 5. Common Error Codes and Solutions

| Error Code | Meaning | Solution |
|------------|---------|----------|
| `auth/email-already-in-use` | Email already registered | Use a different email or sign in instead |
| `auth/weak-password` | Password too weak | Use at least 6 characters |
| `auth/invalid-email` | Invalid email format | Check email format |
| `auth/network-request-failed` | Network error | Check internet connection |
| `permission-denied` | Firestore permission error | Check security rules |
| `auth/operation-not-allowed` | Auth method disabled | Enable Email/Password in Firebase Console |

### 6. Testing Steps
1. Open browser developer tools (F12)
2. Go to Console tab
3. Try to sign up with a new email
4. Check for any error messages in the console
5. Use the "Test Firebase Connection" button to verify setup

### 7. Development vs Production
- **Development**: Use `localhost` or `127.0.0.1`
- **Production**: Add your actual domain to authorized domains
- **Firestore**: Use test mode for development, proper rules for production

### 8. Environment Variables (Optional)
For better security, consider using environment variables:

```env
VITE_FIREBASE_API_KEY=AIzaSyDRZs0HYpV6-nDOEgTNIn6ON6K-lgQC_jc
VITE_FIREBASE_AUTH_DOMAIN=cityconnect-f5099.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=cityconnect-f5099
VITE_FIREBASE_STORAGE_BUCKET=cityconnect-f5099.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=272482377466
VITE_FIREBASE_APP_ID=1:272482377466:web:17849cadf783cb9680b343
VITE_FIREBASE_MEASUREMENT_ID=G-4JXQL82DLZ
```

Then update `src/integrations/firebase/config.ts`:
```typescript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};
```

## Debug Information
The app includes debug logging to help identify issues:
- Firebase initialization logs
- Authentication process logs
- Profile creation logs
- Error details with codes and messages

Check the browser console for these logs when testing sign-up functionality. 