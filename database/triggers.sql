-- ============================================================
-- REAL ESTATE MANAGEMENT SYSTEM (REMS)
-- Database Triggers: triggers.sql
-- ============================================================

USE real_estate_db;

DELIMITER $$

-- 1. Trigger: Update Property Status to 'Booked' when Booking is Confirmed
DROP TRIGGER IF EXISTS trg_after_booking_update$$
CREATE TRIGGER trg_after_booking_update
AFTER UPDATE ON bookings
FOR EACH ROW
BEGIN
    IF NEW.booking_status = 'Confirmed' AND OLD.booking_status <> 'Confirmed' THEN
        UPDATE properties 
        SET property_status = 'Booked' 
        WHERE property_id = NEW.property_id;
    ELSEIF NEW.booking_status = 'Cancelled' AND OLD.booking_status = 'Confirmed' THEN
        UPDATE properties 
        SET property_status = 'Available' 
        WHERE property_id = NEW.property_id AND property_status = 'Booked';
    END IF;
END$$

-- 2. Trigger: Prevent booking non-available properties
DROP TRIGGER IF EXISTS trg_before_booking_insert$$
CREATE TRIGGER trg_before_booking_insert
BEFORE INSERT ON bookings
FOR EACH ROW
BEGIN
    DECLARE current_status VARCHAR(50);
    
    SELECT property_status INTO current_status 
    FROM properties 
    WHERE property_id = NEW.property_id;

    IF current_status IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Validation Error: Property does not exist.';
    ELSEIF current_status <> 'Available' AND current_status <> 'Reserved' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Booking Denied: Property is not available for booking.';
    END IF;
END$$

-- 3. Trigger: Automatically Update Property Status to 'Sold' upon Sale
DROP TRIGGER IF EXISTS trg_after_sale_insert$$
CREATE TRIGGER trg_after_sale_insert
AFTER INSERT ON sales
FOR EACH ROW
BEGIN
    IF NEW.sale_status = 'Completed' THEN
        UPDATE properties 
        SET property_status = 'Sold' 
        WHERE property_id = NEW.property_id;
    END IF;
END$$

-- 4. Trigger: Automatically Update Property Status to 'Rented' upon Rental Agreement
DROP TRIGGER IF EXISTS trg_after_rental_insert$$
CREATE TRIGGER trg_after_rental_insert
AFTER INSERT ON rentals
FOR EACH ROW
BEGIN
    IF NEW.rental_status = 'Active' THEN
        UPDATE properties 
        SET property_status = 'Rented' 
        WHERE property_id = NEW.property_id;
    END IF;
END$$

-- 5. Trigger: Validate Review Rating is within [1, 5]
DROP TRIGGER IF EXISTS trg_before_review_insert$$
CREATE TRIGGER trg_before_review_insert
BEFORE INSERT ON reviews
FOR EACH ROW
BEGIN
    IF NEW.rating < 1 OR NEW.rating > 5 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Validation Error: Review rating must be an integer between 1 and 5.';
    END IF;
END$$

DELIMITER ;
