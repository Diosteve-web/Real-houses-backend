import 'dotenv/config';
import dns from 'node:dns';          // ← NEW
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import connectDB from './src/config/Database.js';

import { testCloudinaryConnection } from './src/config/cloudinary.js';

import propertyRoutes from './src/routes/propertyRoutes.js';
import aiRoutes from './src/routes/aiRoutes.js';
import authRoutes from './src/routes/authRoutes.js';

// ← NEW: use Google/Cloudflare DNS so MongoDB's address can be found
dns.setServers(['8.8.8.8', '1.1.1.1']);

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later."
});
app.use('/api', limiter);

app.use('/api/properties', propertyRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;

// ← CHANGED: connect to MongoDB first, then start the server
await connectDB();
testCloudinaryConnection();
app.listen(PORT, () => console.log(`🚀 Secure Server running on port ${PORT}`));