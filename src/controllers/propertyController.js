import Property from '../models/Property.js';
import { cloudinary } from '../config/cloudinary.js';

// 1. Upload a property (Admin) - FIXES THE BUFFER ERROR
export const uploadProperty = async (req, res) => {
  try {
    const { title, description, price, locationName, bedrooms, bathrooms } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: "Please upload an image" });
    }

    // Helper function to stream the Buffer to Cloudinary
    const uploadToCloudinary = (buffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'johnny_houses' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(buffer); // Send the buffer to Cloudinary
      });
    };

    // Upload the image
    const result = await uploadToCloudinary(req.file.buffer);

    // Save to MongoDB
    const property = await Property.create({
      title,
      description,
      price,
      locationName,
      bedrooms,
      bathrooms,
      imageUrl: result.secure_url,
    });

    res.status(201).json({ 
      message: "Property Uploaded Successfully!", 
      property 
    });
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ error: error.message });
  }
};

// 2. Get all properties (For the Homepage/Browse page)
export const getProperties = async (req, res) => {
  try {
    const properties = await Property.find().sort({ createdAt: -1 });
    res.status(200).json(properties);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3. Get a single property by ID (For the Detail page)
export const getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }
    
    res.status(200).json(property);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};