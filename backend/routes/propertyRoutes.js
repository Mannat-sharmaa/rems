const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken, authorize, optionalAuth } = require('../middleware/auth');

// GET /api/properties/types (List all property types)
router.get('/types', async (req, res, next) => {
  try {
    const [types] = await db.query('SELECT property_type_id, type_name, description FROM property_types ORDER BY property_type_id');
    res.json({ success: true, types });
  } catch (err) {
    next(err);
  }
});

// GET /api/properties/cities (Distinct cities with count)
router.get('/cities', async (req, res, next) => {
  try {
    const [cities] = await db.query(
      `SELECT city, COUNT(property_id) AS property_count,
              SUM(CASE WHEN property_status = 'Available' THEN 1 ELSE 0 END) AS available_count
       FROM properties
       GROUP BY city
       ORDER BY property_count DESC`
    );
    res.json({ success: true, cities });
  } catch (err) {
    next(err);
  }
});

// GET /api/properties/featured (Top 6 featured properties for homepage)
router.get('/featured', async (req, res, next) => {
  try {
    const [properties] = await db.query(
      `SELECT 
          p.property_id, p.title, p.address, p.city, p.state, p.price,
          p.area_sqft, p.bedrooms, p.bathrooms, p.floor_number,
          p.listing_type, p.property_status, p.image_url,
          pt.type_name AS property_type,
          a.agent_id, a.name AS agent_name, a.phone AS agent_phone,
          COALESCE(AVG(r.rating), 0) AS avg_rating,
          COUNT(r.review_id) AS total_reviews
       FROM properties p
       JOIN property_types pt ON p.property_type_id = pt.property_type_id
       JOIN agents a ON p.agent_id = a.agent_id
       LEFT JOIN reviews r ON p.property_id = r.property_id
       WHERE p.property_status = 'Available'
       GROUP BY p.property_id
       ORDER BY p.price DESC
       LIMIT 6`
    );
    res.json({ success: true, properties });
  } catch (err) {
    next(err);
  }
});

// GET /api/properties (Search & Filter properties)
router.get('/', async (req, res, next) => {
  try {
    const {
      city,
      type, // type_name or type_id
      listingType, // 'Sale' or 'Rent'
      status, // 'Available', etc. Default: all or 'Available'
      minPrice,
      maxPrice,
      bedrooms,
      bathrooms,
      search,
      sort,
      page = 1,
      limit = 12
    } = req.query;

    let query = `
      SELECT 
          p.property_id, p.title, p.description, p.address, p.city, p.state, p.pincode,
          p.price, p.area_sqft, p.bedrooms, p.bathrooms, p.floor_number,
          p.listing_type, p.property_status, p.image_url, p.created_at,
          pt.property_type_id, pt.type_name AS property_type,
          o.owner_id, o.name AS owner_name,
          a.agent_id, a.name AS agent_name, a.phone AS agent_phone, a.email AS agent_email,
          COALESCE(AVG(r.rating), 0) AS avg_rating,
          COUNT(r.review_id) AS total_reviews
      FROM properties p
      JOIN property_types pt ON p.property_type_id = pt.property_type_id
      JOIN owners o ON p.owner_id = o.owner_id
      JOIN agents a ON p.agent_id = a.agent_id
      LEFT JOIN reviews r ON p.property_id = r.property_id
      WHERE 1=1
    `;

    const params = [];

    // Filters
    if (city && city.trim() !== '') {
      query += ' AND p.city LIKE ?';
      params.push(`%${city.trim()}%`);
    }

    if (type && type !== 'All') {
      if (!isNaN(type)) {
        query += ' AND p.property_type_id = ?';
        params.push(parseInt(type, 10));
      } else {
        query += ' AND pt.type_name = ?';
        params.push(type);
      }
    }

    if (listingType && listingType !== 'All') {
      query += ' AND p.listing_type = ?';
      params.push(listingType);
    }

    if (status && status !== 'All') {
      query += ' AND p.property_status = ?';
      params.push(status);
    }

    if (minPrice && !isNaN(minPrice)) {
      query += ' AND p.price >= ?';
      params.push(parseFloat(minPrice));
    }

    if (maxPrice && !isNaN(maxPrice)) {
      query += ' AND p.price <= ?';
      params.push(parseFloat(maxPrice));
    }

    if (bedrooms && !isNaN(bedrooms) && parseInt(bedrooms, 10) > 0) {
      query += ' AND p.bedrooms >= ?';
      params.push(parseInt(bedrooms, 10));
    }

    if (bathrooms && !isNaN(bathrooms) && parseInt(bathrooms, 10) > 0) {
      query += ' AND p.bathrooms >= ?';
      params.push(parseInt(bathrooms, 10));
    }

    if (search && search.trim() !== '') {
      query += ' AND (p.title LIKE ? OR p.address LIKE ? OR p.city LIKE ? OR p.description LIKE ?)';
      const s = `%${search.trim()}%`;
      params.push(s, s, s, s);
    }

    query += ' GROUP BY p.property_id';

    // Sorting
    switch (sort) {
      case 'price-asc':
        query += ' ORDER BY p.price ASC';
        break;
      case 'price-desc':
        query += ' ORDER BY p.price DESC';
        break;
      case 'area-desc':
        query += ' ORDER BY p.area_sqft DESC';
        break;
      case 'rating-desc':
        query += ' ORDER BY avg_rating DESC';
        break;
      case 'newest':
      default:
        query += ' ORDER BY p.property_id DESC';
        break;
    }

    // Pagination
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit, 10), offset);

    const [properties] = await db.query(query, params);

    // Total count query for pagination
    let countQuery = `
      SELECT COUNT(DISTINCT p.property_id) AS total
      FROM properties p
      JOIN property_types pt ON p.property_type_id = pt.property_type_id
      WHERE 1=1
    `;
    const countParams = [];

    if (city && city.trim() !== '') {
      countQuery += ' AND p.city LIKE ?';
      countParams.push(`%${city.trim()}%`);
    }
    if (type && type !== 'All') {
      if (!isNaN(type)) {
        countQuery += ' AND p.property_type_id = ?';
        countParams.push(parseInt(type, 10));
      } else {
        countQuery += ' AND pt.type_name = ?';
        countParams.push(type);
      }
    }
    if (listingType && listingType !== 'All') {
      countQuery += ' AND p.listing_type = ?';
      countParams.push(listingType);
    }
    if (status && status !== 'All') {
      countQuery += ' AND p.property_status = ?';
      countParams.push(status);
    }
    if (minPrice && !isNaN(minPrice)) {
      countQuery += ' AND p.price >= ?';
      countParams.push(parseFloat(minPrice));
    }
    if (maxPrice && !isNaN(maxPrice)) {
      countQuery += ' AND p.price <= ?';
      countParams.push(parseFloat(maxPrice));
    }
    if (bedrooms && !isNaN(bedrooms) && parseInt(bedrooms, 10) > 0) {
      countQuery += ' AND p.bedrooms >= ?';
      countParams.push(parseInt(bedrooms, 10));
    }
    if (bathrooms && !isNaN(bathrooms) && parseInt(bathrooms, 10) > 0) {
      countQuery += ' AND p.bathrooms >= ?';
      countParams.push(parseInt(bathrooms, 10));
    }
    if (search && search.trim() !== '') {
      countQuery += ' AND (p.title LIKE ? OR p.address LIKE ? OR p.city LIKE ? OR p.description LIKE ?)';
      const s = `%${search.trim()}%`;
      countParams.push(s, s, s, s);
    }

    const [countResult] = await db.query(countQuery, countParams);
    const totalCount = countResult[0] ? countResult[0].total : properties.length;

    res.json({
      success: true,
      total: totalCount,
      page: parseInt(page, 10),
      totalPages: Math.ceil(totalCount / parseInt(limit, 10)),
      properties
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/properties/:id (Property Details)
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const propertyId = parseInt(req.params.id, 10);

    const [properties] = await db.query(
      `SELECT 
          p.property_id, p.title, p.description, p.address, p.city, p.state, p.pincode,
          p.price, p.area_sqft, p.bedrooms, p.bathrooms, p.floor_number,
          p.listing_type, p.property_status, p.image_url, p.created_at,
          pt.property_type_id, pt.type_name AS property_type, pt.description AS type_description,
          o.owner_id, o.name AS owner_name, o.phone AS owner_phone, o.email AS owner_email,
          a.agent_id, a.name AS agent_name, a.phone AS agent_phone, a.email AS agent_email,
          a.experience AS agent_experience, a.commission_rate AS agent_commission_rate,
          COALESCE(AVG(r.rating), 0) AS avg_rating,
          COUNT(r.review_id) AS total_reviews
       FROM properties p
       JOIN property_types pt ON p.property_type_id = pt.property_type_id
       JOIN owners o ON p.owner_id = o.owner_id
       JOIN agents a ON p.agent_id = a.agent_id
       LEFT JOIN reviews r ON p.property_id = r.property_id
       WHERE p.property_id = ?
       GROUP BY p.property_id`,
      [propertyId]
    );

    if (properties.length === 0) {
      return res.status(404).json({ success: false, message: 'Property not found.' });
    }

    const property = properties[0];

    // Fetch individual reviews
    const [reviews] = await db.query(
      `SELECT r.review_id, r.rating, r.comment, r.review_date,
              c.customer_id, c.name AS customer_name
       FROM reviews r
       JOIN customers c ON r.customer_id = c.customer_id
       WHERE r.property_id = ?
       ORDER BY r.review_date DESC`,
      [propertyId]
    );

    // Fetch 3 similar properties in the same city or type
    const [similar] = await db.query(
      `SELECT property_id, title, city, price, area_sqft, bedrooms, listing_type, image_url, property_status
       FROM properties
       WHERE property_id <> ? AND (city = ? OR property_type_id = ?) AND property_status = 'Available'
       LIMIT 3`,
      [propertyId, property.city, property.property_type_id]
    );

    res.json({
      success: true,
      property,
      reviews,
      similar
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/properties (Add new property - Agent or Admin)
router.post('/', authenticateToken, authorize('Admin', 'Agent'), async (req, res, next) => {
  try {
    const {
      title,
      description,
      address,
      city,
      state,
      pincode,
      area_sqft,
      bedrooms = 0,
      bathrooms = 0,
      floor_number = 0,
      price,
      listing_type = 'Sale',
      property_type_id,
      owner_id,
      agent_id,
      image_url
    } = req.body;

    if (!title || !address || !city || !state || !pincode || !area_sqft || !price || !property_type_id || !owner_id) {
      return res.status(400).json({ success: false, message: 'Please provide all mandatory property fields.' });
    }

    // Determine agent ID: If logged in user is Agent, force agent_id to their agentId
    let assignedAgentId = agent_id;
    if (req.user.role === 'Agent') {
      assignedAgentId = req.user.agentId;
    } else if (!assignedAgentId) {
      // Default to Agent 1 if admin didn't specify
      assignedAgentId = 1;
    }

    const defaultImage = image_url || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80';

    const [result] = await db.query(
      `INSERT INTO properties 
       (owner_id, agent_id, property_type_id, title, description, address, city, state, pincode,
        area_sqft, bedrooms, bathrooms, floor_number, price, property_status, listing_type, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Available', ?, ?)`,
      [
        owner_id,
        assignedAgentId,
        property_type_id,
        title,
        description || '',
        address,
        city,
        state,
        pincode,
        area_sqft,
        bedrooms,
        bathrooms,
        floor_number,
        price,
        listing_type,
        defaultImage
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Property listed successfully with status: Available.',
      propertyId: result.insertId
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/properties/:id (Update property)
router.put('/:id', authenticateToken, authorize('Admin', 'Agent'), async (req, res, next) => {
  try {
    const propertyId = parseInt(req.params.id, 10);
    const {
      title,
      description,
      address,
      city,
      state,
      pincode,
      area_sqft,
      bedrooms,
      bathrooms,
      floor_number,
      price,
      listing_type,
      property_status,
      image_url
    } = req.body;

    const [existing] = await db.query('SELECT property_id, agent_id FROM properties WHERE property_id = ?', [propertyId]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Property not found.' });
    }

    // If agent, ensure they manage this property
    if (req.user.role === 'Agent' && existing[0].agent_id !== req.user.agentId) {
      return res.status(403).json({ success: false, message: 'You are only authorized to edit your assigned properties.' });
    }

    await db.query(
      `UPDATE properties SET
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        address = COALESCE(?, address),
        city = COALESCE(?, city),
        state = COALESCE(?, state),
        pincode = COALESCE(?, pincode),
        area_sqft = COALESCE(?, area_sqft),
        bedrooms = COALESCE(?, bedrooms),
        bathrooms = COALESCE(?, bathrooms),
        floor_number = COALESCE(?, floor_number),
        price = COALESCE(?, price),
        listing_type = COALESCE(?, listing_type),
        property_status = COALESCE(?, property_status),
        image_url = COALESCE(?, image_url)
       WHERE property_id = ?`,
      [
        title, description, address, city, state, pincode,
        area_sqft, bedrooms, bathrooms, floor_number, price,
        listing_type, property_status, image_url,
        propertyId
      ]
    );

    res.json({ success: true, message: 'Property details updated successfully.' });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/properties/:id (Delete property - Admin or assigned Agent)
router.delete('/:id', authenticateToken, authorize('Admin', 'Agent'), async (req, res, next) => {
  try {
    const propertyId = parseInt(req.params.id, 10);
    const { force } = req.query;
    const [existing] = await db.query('SELECT property_id, agent_id, title FROM properties WHERE property_id = ?', [propertyId]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Property not found.' });
    }

    // If agent, ensure they manage this property
    if (req.user.role === 'Agent' && existing[0].agent_id !== req.user.agentId) {
      return res.status(403).json({ success: false, message: 'You are only authorized to delete your assigned properties.' });
    }

    // Check if property is referenced in confirmed bookings or sales
    const [activeBookings] = await db.query(
      "SELECT booking_id FROM bookings WHERE property_id = ? AND booking_status IN ('Confirmed', 'Completed')",
      [propertyId]
    );
    const [activeSales] = await db.query(
      'SELECT sale_id FROM sales WHERE property_id = ?',
      [propertyId]
    );

    if ((activeBookings.length > 0 || activeSales.length > 0) && force !== 'true') {
      return res.status(400).json({
        success: false,
        canForce: true,
        message: 'This property has linked booking or sales records.'
      });
    }

    // Clean up dependent child rows so FK restrict doesn't block deletion
    await db.query('DELETE FROM sales WHERE property_id = ?', [propertyId]);
    await db.query('DELETE FROM rentals WHERE property_id = ?', [propertyId]);
    await db.query('DELETE FROM visits WHERE property_id = ?', [propertyId]);
    await db.query('DELETE FROM reviews WHERE property_id = ?', [propertyId]);
    await db.query('DELETE FROM payments WHERE booking_id IN (SELECT booking_id FROM bookings WHERE property_id = ?)', [propertyId]);
    await db.query('DELETE FROM bookings WHERE property_id = ?', [propertyId]);

    const [result] = await db.query('DELETE FROM properties WHERE property_id = ?', [propertyId]);

    res.json({ success: true, message: `Property "${existing[0].title}" (#${propertyId}) was deleted successfully from database.` });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
