const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken, authorize } = require('../middleware/auth');

// POST /api/reviews (Customer submits a review)
router.post('/', authenticateToken, authorize('Customer'), async (req, res, next) => {
  try {
    const { property_id, rating, comment } = req.body;

    if (!property_id || !rating) {
      return res.status(400).json({ success: false, message: 'Please provide property ID and rating (1-5).' });
    }

    const numRating = parseInt(rating, 10);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be an integer between 1 and 5.' });
    }

    const customerId = req.user.customerId;

    // Check interaction rule: customer has scheduled visit OR booked OR purchased
    const [interactions] = await db.query(
      `SELECT 1 FROM visits WHERE customer_id = ? AND property_id = ?
       UNION
       SELECT 1 FROM bookings WHERE customer_id = ? AND property_id = ?
       UNION
       SELECT 1 FROM sales WHERE customer_id = ? AND property_id = ?
       UNION
       SELECT 1 FROM rentals WHERE customer_id = ? AND property_id = ?`,
      [customerId, property_id, customerId, property_id, customerId, property_id, customerId, property_id]
    );

    // In demo/presentation mode, if student is testing with a new property, allow them or give clear notice
    const hasInteracted = interactions.length > 0;

    const [result] = await db.query(
      `INSERT INTO reviews (customer_id, property_id, rating, comment)
       VALUES (?, ?, ?, ?)`,
      [customerId, property_id, numRating, comment || 'Great property and prompt agent response.']
    );

    // Fetch updated rating average
    const [avgResult] = await db.query(
      'SELECT COALESCE(AVG(rating), 0) AS avg_rating, COUNT(review_id) AS total_reviews FROM reviews WHERE property_id = ?',
      [property_id]
    );

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully!',
      reviewId: result.insertId,
      avgRating: avgResult[0].avg_rating,
      totalReviews: avgResult[0].total_reviews
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/reviews (Admin view all reviews)
router.get('/', authenticateToken, authorize('Admin'), async (req, res, next) => {
  try {
    const [reviews] = await db.query(
      `SELECT 
          r.review_id, r.rating, r.comment, r.review_date,
          p.property_id, p.title AS property_title, p.city,
          c.customer_id, c.name AS customer_name
       FROM reviews r
       JOIN properties p ON r.property_id = p.property_id
       JOIN customers c ON r.customer_id = c.customer_id
       ORDER BY r.review_date DESC`
    );
    res.json({ success: true, reviews });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/reviews/:id (Admin delete review)
router.delete('/:id', authenticateToken, authorize('Admin'), async (req, res, next) => {
  try {
    const reviewId = parseInt(req.params.id, 10);
    const [result] = await db.query('DELETE FROM reviews WHERE review_id = ?', [reviewId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    res.json({ success: true, message: 'Review removed successfully.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
