import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a property title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
    },
    price: {
      type: Number,
      required: [true, 'Please add a price'],
    },
    locationName: {
      type: String,
      required: [true, 'Please add a location (e.g., Archie Street, OAU)'],
    },
    imageUrl: {
      type: String,
      required: [true, 'Please upload an image'],
    },
    bedrooms: {
      type: Number,
      required: true,
      default: 1,
    },
    bathrooms: {
      type: Number,
      required: true,
      default: 1,
    },
    // This links the house to the Admin who uploaded it
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false, // 👈 CHANGED TO FALSE SO POSTMAN UPLOAD WORKS
    },
  },
  {
    timestamps: true,
  }
);

// Add a text index so standard text search works much faster
propertySchema.index({ title: 'text', description: 'text', locationName: 'text' });

const Property = mongoose.model('Property', propertySchema);
export default Property;