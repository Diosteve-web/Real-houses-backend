import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import connectDB from './src/config/Database.js';

// 1. Import Cloudinary Test Function
import { testCloudinaryConnection } from './src/config/cloudinary.js';

// 2. Import Routes
import propertyRoutes from './src/routes/propertyRoutes.js';
import aiRoutes from './src/routes/aiRoutes.js';
import authRoutes from './src/routes/authRoutes.js';

const app = express();

// Security Middleware
app.use(helmet()); 
app.use(cors());
app.use(express.json());

// Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: "Too many requests from this IP, please try again later."
});
app.use('/api', limiter); 

// 3. Connect to Database & Test Cloudinary
connectDB();
testCloudinaryConnection(); // <--- THIS CHECKS IF CLOUDINARY IS ON

// 4. Mount Routes
app.use('/api/properties', propertyRoutes); 
app.use('/api/ai', aiRoutes);
app.use('/api/auth', authRoutes);

// 5. Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Secure Server running on port ${PORT}`));