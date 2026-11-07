import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';

// 1. Connect to Cloudinary using your .env secrets
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. Create a function to TEST the connection
export const testCloudinaryConnection = async () => {
  try {
    // This sends a tiny ping to Cloudinary to check if your keys are correct
    await cloudinary.api.ping();
    console.log('✅ Cloudinary Connected Successfully!');
  } catch (error) {
    console.error('❌ Cloudinary Connection Error:', error.message);
  }
};

// 3. Use Multer to catch the file from the frontend
const storage = multer.memoryStorage();
export const upload = multer({ storage });
export { cloudinary };