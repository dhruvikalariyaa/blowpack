const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();


const seedAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/blowpack', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@blowpack.com' });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // Create admin user
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@blowpack.com',
      phone: '9999999999',
      password: 'admin123', // This will be hashed by the pre-save middleware
      role: 'admin',
      isActive: true,
      emailVerified: true
    });

    await adminUser.save();
    console.log('Admin user created successfully');
    console.log('Email: admin@blowpack.com');
    console.log('Password: admin123');

  } catch (error) {
    console.error('Error seeding admin:', error);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
};

seedAdmin();

