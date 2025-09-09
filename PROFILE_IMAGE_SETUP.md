# Profile Image Upload Feature

## Overview
This feature allows users to upload, change, and delete their profile images. The images are stored securely on Cloudinary and integrated with the user's profile.

## Backend Implementation

### 1. User Model Updates
- Added `profileImage` field to the User schema with `public_id` and `url` properties
- Located in: `backend/models/User.js`

### 2. API Endpoints
- **POST** `/api/users/profile/image` - Upload profile image
- **DELETE** `/api/users/profile/image` - Delete profile image
- Located in: `backend/routes/users.js`

### 3. Features
- Image validation (type and size)
- Automatic deletion of old images when uploading new ones
- Cloudinary integration for secure storage
- 5MB file size limit
- Support for PNG, JPG, GIF formats

## Frontend Implementation

### 1. Redux Integration
- Added `uploadProfileImage` and `deleteProfileImage` actions
- Updated auth slice with new reducers
- Located in: `frountend/src/store/slices/authSlice.js`

### 2. Profile Page
- Complete profile management interface
- Image upload with drag-and-drop functionality
- Real-time image preview
- Edit profile information
- Located in: `frountend/src/pages/Profile.js`

### 3. Features
- Click to upload image
- Hover effects for better UX
- Image preview before upload
- Delete image functionality
- Form validation
- Loading states
- Error handling
- Success notifications

## Usage

### For Users
1. Navigate to the Profile page
2. Click on the profile image area or "Add Photo" button
3. Select an image file (PNG, JPG, GIF up to 5MB)
4. The image will be uploaded automatically
5. To change the image, click on the current image
6. To delete the image, click the red X button

### For Developers
1. The profile image is automatically included in user data
2. Access via `user.profileImage.url` in the frontend
3. Backend returns profile image data in user profile responses
4. Images are stored in the `packwell/profiles` folder on Cloudinary

## API Usage Examples

### Upload Profile Image
```javascript
const formData = new FormData();
formData.append('image', imageFile);

const response = await axios.post('/api/users/profile/image', formData, {
  headers: { 
    Authorization: `Bearer ${token}`,
    'Content-Type': 'multipart/form-data'
  }
});
```

### Delete Profile Image
```javascript
const response = await axios.delete('/api/users/profile/image', {
  headers: { Authorization: `Bearer ${token}` }
});
```

## Security Features
- Authentication required for all profile image operations
- File type validation
- File size limits
- Automatic cleanup of old images
- Secure Cloudinary storage

## Error Handling
- File type validation errors
- File size limit errors
- Network errors
- Authentication errors
- Cloudinary upload errors

All errors are properly handled and displayed to the user with appropriate messages.

