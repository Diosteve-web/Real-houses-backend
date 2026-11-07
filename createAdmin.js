import 'dotenv/config';
import mongoose from 'mongoose';
import User from './src/models/User.js'; // Import the User model

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB to create admin...');

    // Check if admin already exists
    const adminExists = await User.findOne({ email: 'admin@johnnyhouses.com' });
    if (adminExists) {
      console.log('Admin already exists!');
      process.exit();
    }



    // Create the Admin
    await User.create({
      name: 'Super Admin',
      email: 'admin@johnnyhouses.com',
      password: 'password123', // You will use this to log in later
      role: 'admin'
    });

    console.log('✅ Admin created successfully!');
    process.exit();
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    process.exit(1);
  }
};

createAdmin();