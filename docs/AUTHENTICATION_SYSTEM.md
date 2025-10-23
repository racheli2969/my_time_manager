# Authentication System Documentation

## 📋 Overview

This document provides a comprehensive guide to the optimized authentication system, covering the communication between frontend and backend components, Google OAuth integration, and security best practices.

## 🏗️ Architecture

### Backend Components

#### 1. **`/server/routes/auth.js`** - Main Authentication Routes
- **Purpose**: Handles all authentication endpoints
- **Dependencies**: 
  - `google-auth-library` for Google JWT verification
  - `bcryptjs` for password hashing
  - `uuid` for generating unique user IDs
  - Custom JWT utilities from `/config/jwt.js`

#### 2. **`/server/config/google_client.js`** - Google OAuth Configuration
- **Purpose**: Centralized Google OAuth configuration
- **Contains**: Environment variable validation and configuration objects
- **Note**: No longer exports `oauth2Client` - OAuth2Client is instantiated directly in auth routes

### Frontend Components

#### 1. **`GoogleSignInButton.tsx`** - Google Sign-In Component
- **Purpose**: Handles Google OAuth authentication using `@react-oauth/google`
- **Communication**: Sends Google JWT credential to backend `/auth/google` endpoint

#### 2. **`LoginForm.tsx`** - Main Authentication Form
- **Purpose**: Provides email/password login, registration, and Google Sign-In integration
- **Features**: Form validation, error handling, loading states

#### 3. **`/services/api.ts`** - API Service Layer
- **Purpose**: Handles all HTTP communication with backend
- **Features**: Token management, automatic refresh, error handling

## 🔄 Authentication Flow

### 1. Traditional Email/Password Authentication

#### Registration Flow:
```
Frontend (LoginForm) 
    ↓ POST /api/auth/register { name, email, password }
Backend (auth.js) 
    ↓ Validates input, hashes password, creates user
    ↓ Generates JWT tokens
    ↓ Returns { accessToken, refreshToken, user }
Frontend (api.ts) 
    ↓ Stores tokens in localStorage
    ↓ Updates application state
```

#### Login Flow:
```
Frontend (LoginForm) 
    ↓ POST /api/auth/login { email, password }
Backend (auth.js) 
    ↓ Validates credentials with bcrypt
    ↓ Generates JWT tokens
    ↓ Returns { accessToken, refreshToken, user }
Frontend (api.ts) 
    ↓ Stores tokens in localStorage
    ↓ Updates application state
```

### 2. Google OAuth Authentication

#### Google Sign-In Flow:
```
Frontend (GoogleSignInButton) 
    ↓ User clicks Google Sign-In
    ↓ @react-oauth/google handles OAuth
    ↓ Receives Google JWT credential
    ↓ POST /api/auth/google { credential }
Backend (auth.js) 
    ↓ Verifies Google JWT with OAuth2Client
    ↓ Creates/updates user in database
    ↓ Generates app JWT tokens
    ↓ Returns { accessToken, refreshToken, user }
Frontend (api.ts) 
    ↓ Stores tokens in localStorage
    ↓ Updates application state
```

### 3. Token Refresh Flow

#### Automatic Token Refresh:
```
Frontend (api.ts) 
    ↓ API call receives 401 Unauthorized
    ↓ POST /api/auth/refresh (with refresh token in header)
Backend (auth.js) 
    ↓ Validates refresh token
    ↓ Generates new token pair
    ↓ Returns { accessToken, refreshToken }
Frontend (api.ts) 
    ↓ Updates stored tokens
    ↓ Retries original API call
```

## 📡 API Communication Details

### Request/Response Formats

#### POST `/api/auth/register`
**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "role": "user" // optional, defaults to "user"
}
```

**Response (Success - 201):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid-string",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "workingHours": {
      "start": "09:00",
      "end": "17:00",
      "daysOfWeek": [1, 2, 3, 4, 5]
    }
  }
}
```

**Response (Error - 400/409):**
```json
{
  "error": "User with this email already exists",
  "details": {
    "name": null,
    "email": "Email is required",
    "password": null
  }
}
```

#### POST `/api/auth/login`
**Request:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response (Success - 200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid-string",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "profilePicture": "https://...",
    "workingHours": {
      "start": "09:00",
      "end": "17:00",
      "daysOfWeek": [1, 2, 3, 4, 5]
    }
  }
}
```

#### POST `/api/auth/google`
**Request:**
```json
{
  "credential": "eyJhbGciOiJSUzI1NiIs..." // Google JWT token
}
```

**Response (Success - 200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid-string",
    "name": "Google User",
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

#### POST `/api/auth/refresh`
**Request Headers:**
```
Authorization: Bearer <refresh-token>
```

**Response (Success - 200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

## 🔧 Configuration Requirements

### Environment Variables

#### Backend (`.env`)
```bash
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Google OAuth (for Google Sign-In)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret  # Not needed for JWT verification
GOOGLE_REDIRECT_URI=http://localhost:3001/auth/google/callback  # Not needed for current flow

# Database
DATABASE_PATH=./data/database.sqlite
```

#### Frontend Google OAuth Setup
The frontend uses `@react-oauth/google` which requires:

1. **Google OAuth Provider Wrapper** (in your main App component):
```tsx
import { GoogleOAuthProvider } from '@react-oauth/google';

<GoogleOAuthProvider clientId="your-google-client-id.apps.googleusercontent.com">
  <App />
</GoogleOAuthProvider>
```

2. **Authorized JavaScript Origins** in Google Console:
   - `http://localhost:3000` (development)
   - `https://yourdomain.com` (production)

## 🔒 Security Features

### Password Security
- **Bcrypt Hashing**: Passwords hashed with cost factor 12
- **No Password Storage**: Plain text passwords never stored
- **Generic Error Messages**: Prevents user enumeration attacks

### JWT Token Security
- **Short Access Token Lifetime**: 24 hours (configurable)
- **Long Refresh Token Lifetime**: 7 days (configurable)
- **Token Rotation**: New refresh token issued on each refresh
- **Secure Claims**: Minimal user data in JWT payload

### Google OAuth Security
- **JWT Verification**: Google tokens verified server-side
- **Email Verification Check**: Only verified Google emails accepted
- **Audience Validation**: Tokens verified against correct client ID
- **No Client Secret Exposure**: Frontend never sees client secret

### Input Validation
- **Email Format Validation**: Regex validation for email format
- **Password Strength**: Minimum 6 characters (can be enhanced)
- **SQL Injection Prevention**: Prepared statements used
- **XSS Prevention**: Input sanitization and JSON responses

## 🧪 Testing

### Manual Testing Steps

1. **Start the servers:**
```bash
# Backend
cd server
npm run dev

# Frontend  
cd client
npm run dev
```

2. **Test Registration:**
   - Fill out registration form
   - Verify user created in database
   - Check tokens stored in localStorage

3. **Test Login:**
   - Login with created credentials
   - Verify successful authentication
   - Check token refresh works

4. **Test Google Sign-In:**
   - Click Google Sign-In button
   - Complete Google OAuth flow
   - Verify user created/logged in

### Automated Testing
Run the test suite:
```bash
cd server
node tests/test-auth.js
```

## 🚨 Troubleshooting

### Common Issues

#### 1. "Google credential not provided"
- **Cause**: Frontend not sending Google JWT token
- **Solution**: Check GoogleSignInButton integration and @react-oauth/google setup

#### 2. "Invalid Google token"
- **Cause**: Google token verification failed
- **Solutions**:
  - Check GOOGLE_CLIENT_ID environment variable
  - Verify token not expired
  - Check Google Console configuration

#### 3. "Invalid email or password"
- **Cause**: Login credentials incorrect or user doesn't exist
- **Solutions**:
  - Verify user exists in database
  - Check password hashing/comparison
  - Ensure email case-sensitivity handling

#### 4. Token refresh failures
- **Cause**: Refresh token invalid or expired
- **Solutions**:
  - Check refresh token storage
  - Verify token rotation logic
  - Check JWT_SECRET consistency

### Debug Logging
Enable debug logging by setting environment variables:
```bash
DEBUG=auth:*
NODE_ENV=development
```

## 📈 Performance Considerations

### Database Optimization
- **Indexes**: Email column should be indexed for fast lookups
- **Connection Pooling**: Consider connection pooling for production
- **Query Optimization**: Use prepared statements consistently

### Frontend Optimization
- **Token Caching**: Tokens cached in memory and localStorage
- **Request Deduplication**: Avoid multiple refresh requests
- **Error Boundaries**: Proper error handling for auth failures

### Security vs Performance
- **Bcrypt Cost**: Cost factor 12 balances security vs speed
- **JWT Size**: Minimal claims keep tokens small
- **Token Refresh**: Automatic refresh reduces login friction

## 🔄 Migration from Old System

If migrating from an older authentication system:

1. **Database Schema**: Ensure user table has required columns
2. **Token Format**: Update frontend to use `accessToken` instead of `token`
3. **Error Handling**: Update frontend error handling for new error formats
4. **Google Integration**: Replace old Google Auth with new JWT verification

## 📋 Maintenance

### Regular Tasks
- **Monitor Token Refresh Rates**: High refresh rates may indicate issues
- **Review Failed Login Attempts**: Implement rate limiting if needed
- **Update Dependencies**: Keep auth libraries updated
- **Rotate JWT Secrets**: Implement secret rotation strategy
- **Monitor Google Token Verification**: Watch for Google API changes

### Security Audits
- **Review JWT Claims**: Ensure no sensitive data in tokens
- **Test Input Validation**: Regular penetration testing
- **Check HTTPS Configuration**: Ensure secure transport
- **Review Error Messages**: Ensure no information leakage