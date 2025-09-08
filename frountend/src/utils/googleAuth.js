// Google OAuth configuration - Hardcoded Client ID
const GOOGLE_CLIENT_ID = '992582811776-e3hmapsu1iquplaidp0ehp6p0fibg7qh.apps.googleusercontent.com';

console.log('Google Client ID loaded:', GOOGLE_CLIENT_ID);

// Function to initialize Google Sign-In
export const initializeGoogleSignIn = () => {
  return new Promise((resolve, reject) => {
    if (!GOOGLE_CLIENT_ID) {
      reject(new Error('Google OAuth is not configured.'));
      return;
    }

    if (window.google && window.google.accounts.id) {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });
      resolve();
    } else {
      reject(new Error('Google Sign-In library not loaded'));
    }
  });
};

// Function to render Google Sign-In button
export const renderGoogleSignInButton = (elementId, onSuccess, onError) => {
  if (window.google && window.google.accounts.id) {
    window.google.accounts.id.renderButton(
      document.getElementById(elementId),
      {
        theme: 'outline',
        size: 'large',
        width: '100%',
        text: 'continue_with',
        shape: 'rectangular',
        logo_alignment: 'left',
      }
    );
    
    // Store callbacks globally for the credential response handler
    window.googleAuthCallbacks = { onSuccess, onError };
  }
};

// Handle Google credential response
const handleCredentialResponse = async (response) => {
  try {
    const { onSuccess, onError } = window.googleAuthCallbacks || {};
    
    if (!response.credential) {
      throw new Error('No credential received from Google');
    }

    // Decode the JWT token to get user info
    const payload = JSON.parse(atob(response.credential.split('.')[1]));
    
    const userData = {
      googleId: payload.sub,
      name: payload.name,
      email: payload.email,
      picture: payload.picture,
      emailVerified: payload.email_verified,
    };

    if (onSuccess) {
      onSuccess(userData, response.credential);
    }
  } catch (error) {
    console.error('Error handling Google credential response:', error);
    const { onError } = window.googleAuthCallbacks || {};
    if (onError) {
      onError(error);
    }
  }
};

// Function to load Google Sign-In script
export const loadGoogleSignInScript = () => {
  return new Promise((resolve, reject) => {
    if (window.google && window.google.accounts.id) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      resolve();
    };
    script.onerror = () => {
      reject(new Error('Failed to load Google Sign-In script'));
    };
    document.head.appendChild(script);
  });
};

// Function to sign out from Google
export const signOutFromGoogle = () => {
  if (window.google && window.google.accounts.id) {
    window.google.accounts.id.disableAutoSelect();
  }
};

// Function to get Google user info from credential
export const getGoogleUserInfo = (credential) => {
  try {
    const payload = JSON.parse(atob(credential.split('.')[1]));
    return {
      googleId: payload.sub,
      name: payload.name,
      email: payload.email,
      picture: payload.picture,
      emailVerified: payload.email_verified,
    };
  } catch (error) {
    console.error('Error parsing Google credential:', error);
    throw error;
  }
};
