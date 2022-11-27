// Require the cloudinary library
import { v2 as cloudinary } from 'cloudinary';

// Return "https" URLs by setting secure: true
cloudinary.config({
  secure: true,
});

// Log the configuration
console.log(cloudinary.config());

export default cloudinary;
