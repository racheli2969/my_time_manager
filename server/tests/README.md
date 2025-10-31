# Test Utilities

This folder contains standalone test and utility scripts for debugging and verification purposes.

## Files

### `test-google-auth.js`
Tests the Google OAuth authentication setup to verify that the Google Client ID is properly configured and the OAuth2Client can be instantiated correctly.

**Usage:**
```bash
node tests/test-google-auth.js
```

**Purpose:**
- Verifies environment variables are set
- Tests OAuth2Client creation
- Validates token verification setup
- Helps diagnose 500 errors related to Google authentication

### `test-jwt.js`
Tests JWT token generation and verification functionality.

**Usage:**
```bash
node tests/test-jwt.js
```

**Purpose:**
- Tests JWT token generation
- Verifies token validation
- Ensures JWT configuration is working correctly

### `check-schema.js`
Utility to inspect the database schema, particularly useful for debugging table structure issues.

**Usage:**
```bash
node tests/check-schema.js
```

**Purpose:**
- Displays users table schema
- Shows CREATE TABLE SQL
- Helps verify database migrations

## Notes

- These are **standalone utilities** and are not part of the main test suite in `/tests`
- The main test suite uses Jest and is located in `/server/tests`
- These utilities are meant for manual debugging and verification during development
- Do not use these in production environments
