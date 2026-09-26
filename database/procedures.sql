-- ============================================================
-- REAL ESTATE MANAGEMENT SYSTEM (REMS)
-- Stored Procedures: procedures.sql
-- ============================================================

USE real_estate_db;

DELIMITER $$

-- 1. Procedure: SearchAvailableProperties
DROP PROCEDURE IF EXISTS SearchAvailableProperties$$
CREATE PROCEDURE SearchAvailableProperties(
    IN p_city VARCHAR(100),
    IN p_type_name VARCHAR(50),
    IN p_min_price DECIMAL(14, 2),
    IN p_max_price DECIMAL(14, 2),
    IN p_bedrooms INT,
    IN p_listing_type VARCHAR(10)
)
BEGIN
    SELECT 
        p.property_id,
        p.title,
        p.address,
        p.city,
        p.state,
        p.price,
        p.area_sqft,
        p.bedrooms,
        p.bathrooms,
        p.floor_number,
        p.listing_type,
        p.property_status,
        p.image_url,
        pt.type_name AS property_type,
        a.agent_id,
        a.name AS agent_name,
        a.phone AS agent_phone,
        COALESCE(AVG(r.rating), 0) AS avg_rating,
        COUNT(r.review_id) AS total_reviews
    FROM properties p
    JOIN property_types pt ON p.property_type_id = pt.property_type_id
    JOIN agents a ON p.agent_id = a.agent_id
    LEFT JOIN reviews r ON p.property_id = r.property_id
    WHERE (p.property_status = 'Available')
      AND (p_city IS NULL OR p_city = '' OR p.city LIKE CONCAT('%', p_city, '%'))
      AND (p_type_name IS NULL OR p_type_name = '' OR pt.type_name = p_type_name)
      AND (p_min_price IS NULL OR p.price >= p_min_price)
      AND (p_max_price IS NULL OR p.price <= p_max_price)
      AND (p_bedrooms IS NULL OR p_bedrooms = 0 OR p.bedrooms >= p_bedrooms)
      AND (p_listing_type IS NULL OR p_listing_type = '' OR p.listing_type = p_listing_type)
    GROUP BY p.property_id
    ORDER BY p.price ASC;
END$$

-- 2. Procedure: GetCustomerBookings
DROP PROCEDURE IF EXISTS GetCustomerBookings$$
CREATE PROCEDURE GetCustomerBookings(IN p_customer_id INT)
BEGIN
    SELECT 
        b.booking_id,
        b.booking_date,
        b.booking_amount,
        b.booking_status,
        b.remarks,
        p.property_id,
        p.title AS property_title,
        p.city,
        p.price AS property_price,
        p.image_url,
        a.name AS agent_name,
        a.phone AS agent_phone,
        pm.payment_id,
        pm.amount AS paid_amount,
        pm.payment_method,
        pm.transaction_id,
        pm.payment_status
    FROM bookings b
    JOIN properties p ON b.property_id = p.property_id
    JOIN agents a ON b.agent_id = a.agent_id
    LEFT JOIN payments pm ON b.booking_id = pm.booking_id
    WHERE b.customer_id = p_customer_id
    ORDER BY b.booking_date DESC;
END$$

-- 3. Procedure: GetAgentSales
DROP PROCEDURE IF EXISTS GetAgentSales$$
CREATE PROCEDURE GetAgentSales(IN p_agent_id INT)
BEGIN
    SELECT 
        s.sale_id,
        s.sale_date,
        s.sale_price,
        s.commission_amount,
        s.sale_status,
        p.property_id,
        p.title AS property_title,
        p.city,
        c.customer_id,
        c.name AS customer_name,
        c.phone AS customer_phone
    FROM sales s
    JOIN properties p ON s.property_id = p.property_id
    JOIN customers c ON s.customer_id = c.customer_id
    WHERE s.agent_id = p_agent_id
    ORDER BY s.sale_date DESC;
END$$

-- 4. Procedure: ProcessPropertyBooking (Demonstrating Transaction, Commit & Rollback)
DROP PROCEDURE IF EXISTS ProcessPropertyBooking$$
CREATE PROCEDURE ProcessPropertyBooking(
    IN p_customer_id INT,
    IN p_property_id INT,
    IN p_agent_id INT,
    IN p_booking_amount DECIMAL(12, 2),
    IN p_payment_method VARCHAR(50),
    IN p_transaction_id VARCHAR(100),
    OUT p_out_booking_id INT,
    OUT p_out_status VARCHAR(50),
    OUT p_out_message VARCHAR(255)
)
proc_block: BEGIN
    DECLARE current_status VARCHAR(50);
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_out_booking_id = 0;
        SET p_out_status = 'ERROR';
        SET p_out_message = 'Transaction aborted due to a database exception.';
    END;

    START TRANSACTION;

    -- Concurrency check: lock the property row FOR UPDATE
    SELECT property_status INTO current_status 
    FROM properties 
    WHERE property_id = p_property_id 
    FOR UPDATE;

    IF current_status IS NULL THEN
        ROLLBACK;
        SET p_out_booking_id = 0;
        SET p_out_status = 'NOT_FOUND';
        SET p_out_message = 'Selected property does not exist.';
        LEAVE proc_block;
    END IF;

    IF current_status <> 'Available' THEN
        ROLLBACK;
        SET p_out_booking_id = 0;
        SET p_out_status = 'UNAVAILABLE';
        SET p_out_message = CONCAT('Property is no longer available. Current status: ', current_status);
        LEAVE proc_block;
    END IF;

    -- Step 1: Insert Booking Record
    INSERT INTO bookings (customer_id, property_id, agent_id, booking_amount, booking_status, remarks)
    VALUES (p_customer_id, p_property_id, p_agent_id, p_booking_amount, 'Confirmed', 'Booking processed via online gateway');
    
    SET p_out_booking_id = LAST_INSERT_ID();

    -- Step 2: Insert Payment Record
    INSERT INTO payments (booking_id, customer_id, amount, payment_method, transaction_id, payment_status)
    VALUES (p_out_booking_id, p_customer_id, p_booking_amount, p_payment_method, p_transaction_id, 'Completed');

    -- Step 3: Update Property Status to Booked
    UPDATE properties 
    SET property_status = 'Booked' 
    WHERE property_id = p_property_id;

    COMMIT;

    SET p_out_status = 'SUCCESS';
    SET p_out_message = 'Property successfully booked and payment confirmed.';
END proc_block$$

-- 5. Procedure: RecordPropertySale (Calculates commission & records sale)
DROP PROCEDURE IF EXISTS RecordPropertySale$$
CREATE PROCEDURE RecordPropertySale(
    IN p_property_id INT,
    IN p_customer_id INT,
    IN p_agent_id INT,
    IN p_sale_price DECIMAL(14, 2),
    OUT p_out_sale_id INT,
    OUT p_out_commission DECIMAL(12, 2)
)
BEGIN
    DECLARE v_comm_rate DECIMAL(5, 2);
    
    -- Retrieve agent's commission percentage
    SELECT commission_rate INTO v_comm_rate 
    FROM agents 
    WHERE agent_id = p_agent_id;

    IF v_comm_rate IS NULL THEN
        SET v_comm_rate = 2.00;
    END IF;

    SET p_out_commission = ROUND(p_sale_price * (v_comm_rate / 100.0), 2);

    INSERT INTO sales (property_id, customer_id, agent_id, sale_date, sale_price, commission_amount, sale_status)
    VALUES (p_property_id, p_customer_id, p_agent_id, CURDATE(), p_sale_price, p_out_commission, 'Completed');

    SET p_out_sale_id = LAST_INSERT_ID();

    UPDATE properties 
    SET property_status = 'Sold' 
    WHERE property_id = p_property_id;
END$$

DELIMITER ;
