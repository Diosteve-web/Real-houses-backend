import express from 'express';
import { upload } from '../config/cloudinary.js';
import { 
  uploadProperty, 
  getProperties, 
  getPropertyById 
} from '../controllers/propertyController.js';

const router = express.Router();

// Admin Route
router.post('/upload', upload.single('image'), uploadProperty);

// User Routes
router.get('/', getProperties);          
router.get('/:id', getPropertyById);     

export default router;