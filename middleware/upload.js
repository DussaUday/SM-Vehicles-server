const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// Configure Cloudinary storage for vehicles
const vehicleStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'sm-vehicles/vehicles',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [
      { width: 1200, height: 800, crop: 'fill', quality: 'auto' },
      { fetch_format: 'auto' }
    ]
  }
});

// Configure Cloudinary storage for documents
const documentStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'sm-vehicles/documents',
    allowed_formats: ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'],
    resource_type: 'auto'
  }
});

// Create multer upload instances
const uploadVehicle = multer({ 
  storage: vehicleStorage,
  limits: { 
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

const uploadDocument = multer({ 
  storage: documentStorage,
  limits: { 
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Middleware for handling upload errors
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        message: 'File too large. Maximum size is 10MB'
      });
    }
    return res.status(400).json({
      message: `Upload error: ${err.message}`
    });
  }
  
  if (err) {
    return res.status(400).json({
      message: `Error uploading file: ${err.message}`
    });
  }
  
  next();
};

module.exports = {
  uploadVehicle,
  uploadDocument,
  handleUploadError
};