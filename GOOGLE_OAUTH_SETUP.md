# Google OAuth Setup Instructions

## Backend Setup

### 1. Environment Variables
Add the following environment variables to your `.env` file in the backend directory:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### 2. Google Cloud Console Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" and create OAuth 2.0 Client ID
5. Set authorized redirect URIs:
   - `http://localhost:5000/api/auth/google/callback` (for development)
   - `https://yourdomain.com/api/auth/google/callback` (for production)
6. Copy the Client ID and Client Secret to your `.env` file

## Frontend Setup

### 1. Environment Variables
Create a `.env` file in the frontend directory (`frountend/.env`) and add the following environment variable:

```env
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id_here
```

**Important:** Replace `your_google_client_id_here` with your actual Google Client ID from the Google Cloud Console.

### 2. Google Sign-In Configuration
The Google Sign-In button will automatically load and configure itself using the Google Sign-In JavaScript library.

## Features Implemented

### Backend Features
- ✅ Google OAuth strategy with Passport.js
- ✅ User model updated to support Google OAuth
- ✅ Google OAuth routes (`/api/auth/google`, `/api/auth/google/callback`)
- ✅ JWT token generation for Google-authenticated users
- ✅ Automatic user creation/linking for Google users

### Frontend Features
- ✅ Google Sign-In button integration
- ✅ Google OAuth success page
- ✅ Redux integration for Google authentication
- ✅ Automatic redirect after successful authentication
- ✅ Error handling for Google authentication

## Usage

### For Users
1. Go to the login or register page
2. Click the "Continue with Google" button
3. Complete Google authentication
4. User will be automatically logged in and redirected

### For Developers
The Google OAuth flow works as follows:
1. User clicks Google Sign-In button
2. Google authentication popup appears
3. User completes authentication
4. Frontend receives Google credential
5. Frontend sends credential to backend
6. Backend verifies credential and creates/links user
7. Backend returns JWT token
8. Frontend stores token and redirects user

## Testing

1. Start the backend server: `npm run dev` (in backend directory)
2. Start the frontend server: `npm start` (in frontend directory)
3. Navigate to `/login` or `/register`
4. Click the Google Sign-In button
5. Complete the authentication flow

## Troubleshooting

### Error: "Missing required parameter: client_id"
This error occurs when the `REACT_APP_GOOGLE_CLIENT_ID` environment variable is not set or is set to the placeholder value.

**Solution:**
1. Create a `.env` file in the `frountend` directory
2. Add your actual Google Client ID: `REACT_APP_GOOGLE_CLIENT_ID=your_actual_client_id_here`
3. Restart the React development server (`npm start`)

### Error: "Google Sign-In is not configured"
This message appears when the Google OAuth credentials are not properly set up.

**Solution:**
1. Follow the Google Cloud Console setup steps above
2. Make sure you've created the `.env` file with the correct Client ID
3. Restart the development server

### Google Sign-In Button Not Appearing
If the Google Sign-In button doesn't appear, check:
1. Browser console for JavaScript errors
2. Network tab to ensure the Google Sign-In script is loading
3. That your domain is authorized in Google Cloud Console

## Notes

- Google OAuth users don't need to provide phone numbers
- Google OAuth users are automatically email verified
- Existing users with the same email will have their accounts linked
- The system supports both local and Google authentication for the same user
- The frontend will show a helpful message if Google OAuth is not configured
