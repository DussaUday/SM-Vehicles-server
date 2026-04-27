const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['car', 'bike'],
    required: [true, 'Vehicle type is required']
  },
  brand: {
    type: String,
    required: [true, 'Brand is required'],
    trim: true
  },
  model: {
    type: String,
    required: [true, 'Model is required'],
    trim: true
  },
  year: {
    type: Number,
    required: [true, 'Year is required'],
    min: [1990, 'Year must be 1990 or later'],
    max: [2030, 'Year must be 2030 or earlier']  // Updated to 2030
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  mileage: {
    type: Number,
    required: [true, 'Mileage is required'],
    min: [0, 'Mileage cannot be negative']
  },
  fuelType: {
    type: String,
    enum: ['petrol', 'diesel', 'electric', 'cng', 'hybrid'],
    required: [true, 'Fuel type is required']
  },
  transmission: {
    type: String,
    enum: ['manual', 'automatic'],
    required: function() {
      return this.type === 'car';
    }
  },
  color: {
    type: String,
    required: [true, 'Color is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    minlength: [10, 'Description must be at least 10 characters']
  },
  images: [{
    public_id: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    format: String,
    width: Number,
    height: Number
  }],
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
  },
  ownerName: {
    type: String,
    required: [true, 'Owner name is required'],
    trim: true
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  registrationNumber: {
    type: String,
    required: [true, 'Registration number is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  insurance: {
    type: String,
    enum: ['yes', 'no'],
    required: [true, 'Insurance status is required']
  },
  features: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isSold: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  },
  whatsappClicks: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

vehicleSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

vehicleSchema.index({ brand: 1, model: 1 });
vehicleSchema.index({ type: 1, isActive: 1 });
vehicleSchema.index({ price: 1 });
vehicleSchema.index({ year: 1 });

vehicleSchema.set('toJSON', { virtuals: true });
vehicleSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Vehicle', vehicleSchema);