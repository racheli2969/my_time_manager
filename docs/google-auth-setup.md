# Google Authentication Setup Guide

This guide explains how to set up Google OAuth authentication for the task management application.

## 1. Google Cloud Console Setup

### Step 1: Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Identity API

### Step 2: Configure OAuth Consent Screen
1. Navigate to APIs & Services → OAuth consent screen
2. Choose "External" user type (or "Internal" if using Google Workspace)
3. Fill in the required information:
   - App name: "Task Management App"
   - User support email: Your email
   - Developer contact email: Your email
4. Add scopes: `email`, `profile`, `openid`
5. Save and continue

### Step 3: Create OAuth Credentials
1. Navigate to APIs & Services → Credentials
2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Add authorized origins:
   - `http://localhost:5173` (for development)
   - Your production domain
5. Add authorized redirect URIs:
   - `http://localhost:5173` (for development)
   - Your production domain
6. Save and copy the Client ID

## 2. Environment Configuration

### Step 1: Update Server Environment
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update the `.env` file with your Google Client ID:
   ```env
   GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
   JWT_SECRET=your-secure-jwt-secret
   ```

### Step 2: Update Client Configuration
1. Open `client/index.html`
2. Add the Google Identity Services script:
   ```html
   <script src="https://accounts.google.com/gsi/client" async defer></script>
   ```

3. Update any client configuration files with your Client ID if needed.

## 3. Testing Google Authentication

### Step 1: Start the Server
```bash
cd server
npm start
```

### Step 2: Start the Client
```bash
cd client
npm run dev
```

### Step 3: Test Login Flow
1. Navigate to the login page
2. Click the "Sign in with Google" button
3. Complete the Google OAuth flow
4. Verify that the user is created in the database

## 4. Troubleshooting

### Common Issues

#### Issue: "Google authentication not configured"
- **Cause**: `GOOGLE_CLIENT_ID` environment variable is not set
- **Solution**: Check your `.env` file and ensure the Client ID is correct

#### Issue: "Invalid Google credential"
- **Cause**: The JWT token from Google is invalid or expired
- **Solutions**:
  - Check that your Client ID matches the one in Google Cloud Console
  - Ensure authorized origins and redirect URIs are configured correctly
  - Try clearing browser cookies and cache

#### Issue: "Token expired"
- **Cause**: Google's JWT token has expired (they expire after 1 hour)
- **Solution**: This is normal behavior - users will need to sign in again

#### Issue: Google button doesn't appear
- **Cause**: Google Identity Services script not loaded or Client ID misconfigured
- **Solutions**:
  - Check browser console for errors
  - Verify the Google script is loading in the HTML
  - Check that the Client ID is valid

### Debug Mode
To enable debug logging for Google authentication:

1. Set `NODE_ENV=development` in your `.env` file
2. Check server logs for detailed error messages
3. Check browser console for client-side errors

## 5. Security Considerations

### Production Checklist
- [ ] Use HTTPS in production
- [ ] Set up proper CORS origins
- [ ] Use secure JWT secrets (32+ characters)
- [ ] Configure proper authorized origins in Google Cloud Console
- [ ] Enable rate limiting on authentication endpoints
- [ ] Implement proper session management

### Token Security
- JWT tokens expire after 24 hours (configurable)
- Google ID tokens are verified server-side
- User sessions are maintained securely
- Profile pictures and basic info are stored locally

## 6. Database Schema

The Google authentication creates/updates these user fields:
- `google_id`: Google's unique user identifier
- `profile_picture`: URL to user's Google profile picture
- `email`: User's Google email (verified by Google)
- `name`: User's display name from Google
- `working_hours_*`: Default working hours (9 AM - 5 PM, Mon-Fri)

## 7. API Endpoints

### POST /auth/google
Authenticates a user with Google OAuth credential.

**Request Body:**
```json
{
  "credential": "google-jwt-token"
}
```

**Response:**
```json
{
  "token": "your-app-jwt-token",
  "user": {
    "id": "user-uuid",
    "name": "User Name",
    "email": "user@gmail.com",
    "role": "user",
    "profilePicture": "https://lh3.googleusercontent.com/...",
    "workingHours": {
      "start": "09:00",
      "end": "17:00",
      "daysOfWeek": [1, 2, 3, 4, 5]
    }
  }
}
```

**Error Responses:**
- `400`: Invalid or missing credential
- `401`: Token expired
- `500`: Server configuration error