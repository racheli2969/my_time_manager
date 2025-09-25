# Google Authentication Integration

This document describes the Google OAuth 2.0 authentication integration in the Task Management application.

## Overview

The application now supports Google authentication alongside the existing email/password authentication. Users can sign in using their Google account, which provides a secure and convenient authentication method.

## Features

- **Google OAuth 2.0 Integration**: Secure authentication using Google Identity Services
- **Seamless User Experience**: Users can sign in with a single click
- **Account Linking**: Existing users can link their Google account
- **Automatic User Creation**: New users are automatically created from Google profile
- **Profile Picture Support**: User profile pictures from Google are stored and displayed
- **Backward Compatibility**: Existing email/password authentication continues to work

## Architecture

### Client-Side Components

1. **GoogleAuthService** (`client/src/services/googleAuth.ts`)
   - Handles Google Identity Services initialization
   - Manages OAuth flow and token parsing
   - Provides event-based authentication callbacks

2. **GoogleSignInButton** (`client/src/components/GoogleSignInButton.tsx`)
   - Renders Google-styled sign-in button
   - Handles loading states and error messages
   - Integrates with the existing authentication flow

3. **Updated LoginForm** (`client/src/components/LoginForm.tsx`)
   - Includes Google sign-in option alongside traditional login
   - Maintains consistent user experience

### Server-Side Components

1. **Google Auth Route** (`server/routes/auth.js`)
   - Verifies Google JWT tokens using `google-auth-library`
   - Creates or updates user accounts
   - Returns JWT tokens consistent with existing auth

2. **Database Schema Updates** (`server/database.js`)
   - Added `google_id` column for Google user identification
   - Added `profile_picture` column for Google profile images
   - Migration script for existing databases

## Setup Instructions

### Prerequisites

1. **Google Cloud Console Setup**:
   - Create a project in [Google Cloud Console](https://console.cloud.google.com/)
   - Enable the Google+ API
   - Create OAuth 2.0 credentials (Web application)
   - Add authorized domains (localhost for development)

### Environment Configuration

1. **Server Environment** (`.env`):
   ```bash
   GOOGLE_CLIENT_ID=your_google_client_id_here
   JWT_SECRET=your-super-secure-jwt-secret
   ```

2. **Client Environment** (`client/.env`):
   ```bash
   VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
   ```

### Installation

1. **Install Dependencies**:
   ```bash
   cd server && npm install google-auth-library
   ```

2. **Database Migration**:
   The database migration runs automatically on server startup, adding:
   - `google_id` column (with unique index)
   - `profile_picture` column

## Usage

### For End Users

1. **Google Sign-In**:
   - Click the "Sign in with Google" button on the login page
   - Authorize the application in the Google popup
   - Automatically logged in and redirected to the main application

2. **Account Linking**:
   - Existing users can sign in with Google using the same email
   - Google ID is automatically linked to their existing account

### For Developers

#### Client-Side Usage

```typescript
import GoogleSignInButton from './components/GoogleSignInButton';

// Basic usage
<GoogleSignInButton
  onSuccess={(user) => console.log('User logged in:', user)}
  onError={(error) => console.error('Login failed:', error)}
/>

// With custom configuration
<GoogleSignInButton
  onSuccess={handleLogin}
  onError={handleError}
  buttonConfig={{
    theme: 'filled_blue',
    size: 'large',
    text: 'signin_with'
  }}
  disabled={loading}
/>
```

#### Server-Side API

```javascript
// Google authentication endpoint
POST /api/auth/google
{
  "credential": "google_jwt_token_here"
}

// Response
{
  "token": "your_jwt_token",
  "user": {
    "id": "user_id",
    "name": "User Name",
    "email": "user@example.com",
    "role": "user",
    "profilePicture": "https://...",
    "workingHours": { ... }
  }
}
```

## Security Considerations

1. **Token Verification**: All Google tokens are verified server-side using Google's official library
2. **Secure Storage**: JWT tokens are stored securely in localStorage
3. **Environment Variables**: Sensitive configuration is stored in environment variables
4. **HTTPS Required**: Production deployments must use HTTPS for OAuth to work
5. **Domain Restrictions**: Google OAuth is configured for specific authorized domains

## Database Schema Changes

### Users Table Updates

```sql
-- New columns added
ALTER TABLE users ADD COLUMN google_id TEXT;
ALTER TABLE users ADD COLUMN profile_picture TEXT;

-- Unique index for Google ID
CREATE UNIQUE INDEX idx_users_google_id ON users(google_id) WHERE google_id IS NOT NULL;

-- Password is now optional (for Google-only users)
-- Note: Existing constraint handling maintained for backward compatibility
```

## Error Handling

### Client-Side Errors

- **Initialization Failures**: Google Identity Services loading issues
- **Authentication Failures**: Invalid tokens or user cancellation
- **Network Errors**: API communication failures

### Server-Side Errors

- **Invalid Tokens**: Malformed or expired Google tokens
- **Configuration Issues**: Missing Google Client ID
- **Database Errors**: User creation or update failures

## Testing

### Development Testing

1. **Mock Google Auth**: For development, use test credentials
2. **Local Testing**: Configure `localhost` as authorized domain
3. **Manual Testing**: Test both new user creation and existing user login

### Production Testing

1. **Domain Verification**: Ensure production domain is authorized
2. **HTTPS Certificate**: Verify SSL certificate is valid
3. **User Flow Testing**: Test complete authentication flow

## Troubleshooting

### Common Issues

1. **"Google Identity Services not loaded"**:
   - Check internet connection
   - Verify Google Client ID is set
   - Check browser console for script loading errors

2. **"Invalid Google credential"**:
   - Verify Google Client ID matches frontend and backend
   - Check token expiration
   - Ensure proper OAuth scope configuration

3. **Database Migration Errors**:
   - Backup database before migration
   - Check SQLite version compatibility
   - Verify file permissions

### Debug Mode

Enable debug logging by setting:
```bash
NODE_ENV=development
```

## Future Enhancements

1. **Multi-Provider Support**: Add Facebook, GitHub, etc.
2. **Account Merging**: Handle multiple OAuth providers for same email
3. **Advanced Profile Data**: Sync more Google profile information
4. **Offline Support**: Handle authentication in offline scenarios
5. **Session Management**: Advanced session handling and refresh tokens

## Contributing

When modifying Google authentication:

1. **Test Thoroughly**: Test both new and existing user flows
2. **Maintain Compatibility**: Ensure existing auth continues to work
3. **Update Documentation**: Keep this documentation current
4. **Security Review**: Have security implications reviewed
5. **Environment Handling**: Test with different environment configurations

## Support

For issues with Google authentication:

1. Check Google Cloud Console configuration
2. Verify environment variables are set correctly
3. Review server logs for detailed error messages
4. Test with a fresh browser session
5. Ensure all domains are properly authorized