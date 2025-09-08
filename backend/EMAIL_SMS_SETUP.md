# Email Setup Guide

## Email Configuration

### Gmail Setup (Recommended)
1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
3. Add these environment variables to your `.env` file:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
COMPANY_EMAIL=company@packwellplastic.com
```

### Alternative Email Providers
- **Outlook/Hotmail**: smtp-mail.outlook.com, port 587
- **Yahoo**: smtp.mail.yahoo.com, port 587
- **Custom SMTP**: Use your hosting provider's SMTP settings

## Environment Variables Required

Add these to your `backend/.env` file:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/packwell_plastic

# JWT Secret
JWT_SECRET=your_jwt_secret_here

# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
COMPANY_EMAIL=company@packwellplastic.com
```

## Testing the Setup

1. Create a `.env` file in the backend directory with the email configuration above
2. Start the backend server: `npm start`
3. Place a test order through the frontend
4. Check the console logs for email status (should show ✅ for successful emails)
5. Verify emails are received by customer and company

## Troubleshooting

If emails are not sending, check:
1. ✅ `.env` file exists in backend directory
2. ✅ All email environment variables are set correctly
3. ✅ Gmail app password is correct (not your regular password)
4. ✅ 2-Factor Authentication is enabled on Gmail
5. ✅ Check console logs for specific error messages

## Features Implemented

### Email Notifications
- ✅ Order confirmation email to customer
- ✅ Order notification email to company
- ✅ Order shipped email to customer
- ✅ Order delivered email to customer
- ✅ Order completed email to customer
- ✅ Order completed notification email to company

### Order Flow
- ✅ Complete checkout process
- ✅ Order confirmation page
- ✅ Order detail page
- ✅ Order management in admin panel
