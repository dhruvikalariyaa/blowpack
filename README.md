# Packwell Plastic Industries - eCommerce Website

A complete full-stack eCommerce website built with MERN stack for Packwell Plastic Industries, specializing in plastic products manufacturing and sales.

## 🚀 Features

### User Features
- **Authentication & User Management**
  - User registration and login
  - Profile management
  - Address management
  - Password reset functionality

- **Product Browsing**
  - Homepage with featured products
  - Product listing with advanced filters
  - Product search functionality
  - Category-based browsing
  - Product detail pages with reviews

- **Shopping Experience**
  - Shopping cart functionality
  - Wishlist management
  - Order management (without payment integration)
  - Order tracking and history

- **Reviews & Ratings**
  - Product reviews and ratings
  - Verified purchase reviews
  - Review management

### Admin Features
- **Product Management**
  - Add/Edit/Delete products
  - Category management
  - Image upload with Cloudinary
  - Stock management
  - Featured products

- **Order Management**
  - Order approval and processing
  - Order status updates
  - Invoice generation
  - Order tracking

- **User Management**
  - User account management
  - Admin dashboard with analytics

### Technical Features
- **Responsive Design**
  - Mobile-first approach
  - TailwindCSS for styling
  - Modern UI components

- **Security**
  - JWT authentication
  - Role-based access control
  - Input validation
  - Rate limiting

- **Performance**
  - Image optimization
  - Lazy loading
  - Efficient state management

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Cloudinary** - Image storage
- **Nodemailer** - Email service
- **Bcryptjs** - Password hashing

### Frontend
- **React.js** - UI library
- **Redux Toolkit** - State management
- **React Router** - Routing
- **TailwindCSS** - Styling
- **React Hook Form** - Form handling
- **Axios** - HTTP client

## 📦 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- Cloudinary account
- Email service (Gmail recommended)

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the backend directory:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/packwell_plastic
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRE=7d
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   FRONTEND_URL=http://localhost:3000
   ```

4. **Start the backend server**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frountend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

## 🗄️ Database Setup

### MongoDB Collections
The application uses the following collections:
- `users` - User accounts and profiles
- `categories` - Product categories
- `products` - Product information
- `carts` - Shopping cart data
- `wishlists` - User wishlists
- `orders` - Order information
- `reviews` - Product reviews and ratings

### Sample Data
You can add sample data by creating an admin user and adding products through the admin dashboard.

## 🔧 Configuration

### Cloudinary Setup
1. Create a Cloudinary account
2. Get your cloud name, API key, and API secret
3. Add them to your `.env` file

### Email Configuration
1. Enable 2-factor authentication on your Gmail account
2. Generate an app password
3. Use the app password in your `.env` file

### Admin User Creation
To create an admin user, you can either:
1. Use MongoDB Compass to manually update a user's role to 'admin'
2. Create a script to seed admin data

## 📱 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/forgot-password` - Forgot password
- `POST /api/auth/reset-password` - Reset password

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `GET /api/products/featured` - Get featured products
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Cart & Wishlist
- `GET /api/cart` - Get user cart
- `POST /api/cart/add` - Add to cart
- `PUT /api/cart/update` - Update cart item
- `DELETE /api/cart/remove` - Remove from cart
- `GET /api/wishlist` - Get user wishlist
- `POST /api/wishlist/add` - Add to wishlist
- `DELETE /api/wishlist/remove` - Remove from wishlist

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get single order
- `PUT /api/orders/:id/cancel` - Cancel order

## 🚀 Deployment

### Backend Deployment
1. Deploy to platforms like Heroku, Railway, or DigitalOcean
2. Set up MongoDB Atlas for production database
3. Configure environment variables
4. Set up Cloudinary for image storage

### Frontend Deployment
1. Build the production version:
   ```bash
   npm run build
   ```
2. Deploy to platforms like Vercel, Netlify, or AWS S3

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- Rate limiting
- CORS configuration
- Helmet.js for security headers

## 📊 Admin Dashboard

The admin dashboard provides:
- Analytics and statistics
- Product management
- Order management
- User management
- Category management
- Review moderation

## 🎨 UI/UX Features

- Responsive design for all devices
- Modern and clean interface
- Intuitive navigation
- Loading states and error handling
- Toast notifications
- Modal dialogs
- Form validation

## 🔄 State Management

The application uses Redux Toolkit for state management with the following slices:
- `authSlice` - Authentication state
- `productSlice` - Product data and filters
- `cartSlice` - Shopping cart state
- `wishlistSlice` - Wishlist state
- `orderSlice` - Order management
- `categorySlice` - Category data

## 📝 Notes

- Payment integration is not included as per requirements
- Google login is prepared but not implemented
- Email notifications are configured but may need SMTP setup
- The application is designed for single-vendor use (Packwell Plastic Industries)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is proprietary software for Packwell Plastic Industries.

## 📞 Support

For support and questions, please contact:
- Email: info@packwellplastic.com
- Phone: +91 98765 43210

---

**Packwell Plastic Industries** - Premium Plastic Products for All Your Needs
