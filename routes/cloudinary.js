const express = require('express');
const router = express.Router();
const cloudinary = require('cloudinary').v2;

// GET signature for signed upload
router.get('/signature', (req, res) => {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    
    // Parameters to sign
    const params_to_sign = {
      timestamp: timestamp,
      folder: 'sm-vehicles'
    };
    
    // Generate the signature
    const signature = cloudinary.utils.api_sign_request(
      params_to_sign,
      cloudinary.config().api_secret
    );
    
    console.log('Generated signature:', {
      timestamp,
      signature: signature.substring(0, 10) + '...',
      api_key: cloudinary.config().api_key,
      cloud_name: cloudinary.config().cloud_name
    });
    
    res.json({
      signature: signature,
      timestamp: timestamp,
      api_key: cloudinary.config().api_key,
      cloud_name: cloudinary.config().cloud_name
    });
  } catch (error) {
    console.error('Signature generation error:', error);
    res.status(500).json({ 
      message: 'Error generating signature',
      error: error.message 
    });
  }
});

// DELETE image from Cloudinary
router.delete('/delete', async (req, res) => {
  try {
    const { public_id } = req.body;
    
    if (!public_id) {
      return res.status(400).json({ message: 'Public ID is required' });
    }
    
    console.log('Deleting Cloudinary image:', public_id);
    const result = await cloudinary.uploader.destroy(public_id);
    console.log('Delete result:', result);
    
    res.json({ 
      message: 'Image deleted successfully',
      result: result 
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ 
      message: 'Error deleting image',
      error: error.message 
    });
  }
});

module.exports = router;