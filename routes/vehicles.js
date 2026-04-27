const express = require('express');
const router = express.Router();
const Vehicle = require('../models/Vehicle');
const auth = require('../middleware/auth');
const cloudinary = require('../config/cloudinary');

// GET all vehicles
router.get('/', async (req, res) => {
  try {
    const vehicles = await Vehicle.find().sort({ createdAt: -1 });
    res.json(vehicles);
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    res.status(500).json({ message: 'Error fetching vehicles' });
  }
});

// GET single vehicle
router.get('/:id', async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching vehicle' });
  }
});

// POST new vehicle
router.post('/', auth, async (req, res) => {
  try {
    console.log('📝 Creating vehicle...');

    const vehicleData = {
      type: req.body.type,
      brand: req.body.brand,
      model: req.body.model,
      year: parseInt(req.body.year) || new Date().getFullYear(),
      price: parseInt(req.body.price) || 0,
      mileage: parseInt(req.body.mileage) || 0,
      fuelType: req.body.fuelType || 'petrol',
      transmission: req.body.transmission || 'manual',
      color: req.body.color || 'White',
      description: req.body.description || 'No description provided for this vehicle',
      images: req.body.images || [],
      phoneNumber: req.body.phoneNumber || '0000000000',
      ownerName: req.body.ownerName || 'Unknown',
      location: req.body.location || 'Not specified',
      registrationNumber: (req.body.registrationNumber || `TEMP${Date.now()}`).toUpperCase(),
      insurance: req.body.insurance || 'yes',
      features: req.body.features 
        ? req.body.features.split(',').map(f => f.trim()).filter(f => f) 
        : []
    };

    console.log('📋 Vehicle data:', {
      ...vehicleData,
      images: `${vehicleData.images.length} images`
    });

    const vehicle = new Vehicle(vehicleData);
    await vehicle.save();
    
    console.log('✅ Vehicle created:', vehicle._id);
    res.status(201).json({ message: 'Vehicle created successfully', vehicle });
  } catch (error) {
    console.error('❌ Error creating vehicle:', error.message);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ message: errors.join('. ') });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Registration number already exists' });
    }
    
    res.status(400).json({ message: error.message });
  }
});

// PUT update vehicle
router.put('/:id', auth, async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });

    // Delete old images from Cloudinary if new ones provided
    if (req.body.images && req.body.images.length > 0) {
      for (const image of vehicle.images) {
        if (image.public_id) {
          await cloudinary.uploader.destroy(image.public_id).catch(err => {
            console.error('Error deleting old image:', err.message);
          });
        }
      }
    }

    const updateData = { ...req.body, updatedAt: Date.now() };
    
    const updated = await Vehicle.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({ message: 'Vehicle updated successfully', vehicle: updated });
  } catch (error) {
    console.error('Error updating vehicle:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ message: errors.join('. ') });
    }
    
    res.status(400).json({ message: error.message });
  }
});

// DELETE vehicle
router.delete('/:id', auth, async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });

    // Delete images from Cloudinary
    for (const image of vehicle.images) {
      if (image.public_id) {
        await cloudinary.uploader.destroy(image.public_id).catch(err => {
          console.error('Error deleting image:', err.message);
        });
      }
    }

    await Vehicle.findByIdAndDelete(req.params.id);
    res.json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting vehicle' });
  }
});
// GET all vehicles with optional type filter
router.get('/', async (req, res) => {
  try {
    const { type } = req.query;
    
    // Build query
    let query = {};
    if (type) {
      query.type = type; // This filters by 'car' or 'bike'
    }
    
    console.log('🔍 Fetching vehicles with query:', query);
    
    const vehicles = await Vehicle.find(query).sort({ createdAt: -1 });
    
    console.log(`📊 Found ${vehicles.length} vehicles${type ? ` (type: ${type})` : ''}`);
    
    res.json(vehicles);
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    res.status(500).json({ message: 'Error fetching vehicles' });
  }
});



module.exports = router;