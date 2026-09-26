function errorHandler(err, req, res, next) {
  console.error('API Error:', err);

  // MySQL specific error handling
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      success: false,
      message: 'Duplicate entry detected. A record with this unique identifier (email/phone) already exists.'
    });
  }

  if (err.code === 'ER_NO_REFERENCED_ROW_2' || err.code === 'ER_ROW_IS_REFERENCED_2') {
    return res.status(400).json({
      success: false,
      message: 'Foreign key referential constraint violation. Referenced record does not exist or is currently in use.'
    });
  }

  if (err.sqlState === '45000') {
    // Custom database trigger signal
    return res.status(400).json({
      success: false,
      message: err.sqlMessage || 'Database validation rule violated.'
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
}

module.exports = errorHandler;
