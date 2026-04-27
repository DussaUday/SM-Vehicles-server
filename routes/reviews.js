const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const auth = require('../middleware/auth');

// GET all reviews (Public - for homepage)
router.get('/', async (req, res) => {
  try {
    const { active, featured } = req.query;
    let query = {};
    
    if (active === 'true') query.isActive = true;
    if (featured === 'true') query.isFeatured = true;
    
    const reviews = await Review.find(query).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Error fetching reviews' });
  }
});

// GET featured reviews for homepage
router.get('/featured', async (req, res) => {
  try {
    const reviews = await Review.find({ 
      isActive: true, 
      isFeatured: true 
    })
    .sort({ createdAt: -1 })
    .limit(6);
    
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching featured reviews' });
  }
});

// GET single review
router.get('/:id', async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    res.json(review);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching review' });
  }
});

// POST new review (Admin only)
router.post('/', auth, async (req, res) => {
  try {
    const { name, role, text, rating, isActive, isFeatured } = req.body;
    
    const reviewData = {
      name,
      role: role || 'Customer',
      text,
      rating: parseInt(rating) || 5,
      avatar: name.charAt(0).toUpperCase(),
      isActive: isActive !== undefined ? isActive : true,
      isFeatured: isFeatured !== undefined ? isFeatured : false
    };

    const review = new Review(reviewData);
    await review.save();
    
    res.status(201).json({ message: 'Review created successfully', review });
  } catch (error) {
    console.error('Error creating review:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ message: errors.join('. ') });
    }
    
    res.status(400).json({ message: error.message });
  }
});

// PUT update review (Admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    const updatedReview = await Review.findByIdAndUpdate(
      req.params.id,
      { 
        ...req.body, 
        avatar: req.body.name ? req.body.name.charAt(0).toUpperCase() : review.avatar,
        updatedAt: Date.now() 
      },
      { new: true, runValidators: true }
    );

    res.json({ message: 'Review updated successfully', review: updatedReview });
  } catch (error) {
    console.error('Error updating review:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ message: errors.join('. ') });
    }
    
    res.status(400).json({ message: error.message });
  }
});

// DELETE review (Admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH toggle review status
router.patch('/:id/toggle-status', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    review.isActive = !review.isActive;
    await review.save();

    res.json({ 
      message: `Review ${review.isActive ? 'activated' : 'deactivated'}`,
      review 
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PATCH toggle featured
router.patch('/:id/toggle-featured', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    review.isFeatured = !review.isFeatured;
    await review.save();

    res.json({ 
      message: `Review ${review.isFeatured ? 'marked as featured' : 'removed from featured'}`,
      review 
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;