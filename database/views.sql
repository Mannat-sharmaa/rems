-- ============================================================
-- REAL ESTATE MANAGEMENT SYSTEM (REMS)
-- Database Views: views.sql
-- ============================================================

USE real_estate_db;

-- 1. View: Available_Properties
DROP VIEW IF EXISTS Available_Properties;
CREATE VIEW Available_Properties AS
SELECT 
    p.property_id,
    p.title,
    p.address,
    p.city,
    p.state,
    p.pincode,
    p.price,
    p.area_sqft,
    p.bedrooms,
    p.bathrooms,
    p.floor_number,
    p.listing_type,
    p.property_status,
    p.image_url,
    pt.type_name AS property_type,
    o.name AS owner_name,
    o.phone AS owner_phone,
    a.agent_id,
    a.name AS agent_name,
    a.phone AS agent_phone,
    a.email AS agent_email,
    COALESCE(AVG(r.rating), 0) AS avg_rating,
    COUNT(r.review_id) AS total_reviews
FROM properties p
JOIN property_types pt ON p.property_type_id = pt.property_type_id
JOIN owners o ON p.owner_id = o.owner_id
JOIN agents a ON p.agent_id = a.agent_id
LEFT JOIN reviews r ON p.property_id = r.property_id
WHERE p.property_status = 'Available'
GROUP BY p.property_id;

-- 2. View: Sold_Properties
DROP VIEW IF EXISTS Sold_Properties;
CREATE VIEW Sold_Properties AS
SELECT 
    s.sale_id,
    p.property_id,
    p.title AS property_title,
    p.city,
    pt.type_name AS property_type,
    s.sale_date,
    s.sale_price,
    s.commission_amount,
    c.customer_id,
    c.name AS customer_name,
    c.email AS customer_email,
    c.phone AS customer_phone,
    a.agent_id,
    a.name AS agent_name,
    a.commission_rate
FROM sales s
JOIN properties p ON s.property_id = p.property_id
JOIN property_types pt ON p.property_type_id = pt.property_type_id
JOIN customers c ON s.customer_id = c.customer_id
JOIN agents a ON s.agent_id = a.agent_id;

-- 3. View: Rented_Properties
DROP VIEW IF EXISTS Rented_Properties;
CREATE VIEW Rented_Properties AS
SELECT 
    rt.rental_id,
    p.property_id,
    p.title AS property_title,
    p.city,
    pt.type_name AS property_type,
    rt.start_date,
    rt.end_date,
    rt.monthly_rent,
    rt.security_deposit,
    rt.rental_status,
    c.customer_id,
    c.name AS customer_name,
    c.phone AS customer_phone,
    a.agent_id,
    a.name AS agent_name
FROM rentals rt
JOIN properties p ON rt.property_id = p.property_id
JOIN property_types pt ON p.property_type_id = pt.property_type_id
JOIN customers c ON rt.customer_id = c.customer_id
JOIN agents a ON rt.agent_id = a.agent_id;

-- 4. View: Customer_Booking_History
DROP VIEW IF EXISTS Customer_Booking_History;
CREATE VIEW Customer_Booking_History AS
SELECT 
    b.booking_id,
    b.booking_date,
    b.booking_amount,
    b.booking_status,
    c.customer_id,
    c.name AS customer_name,
    c.email AS customer_email,
    c.phone AS customer_phone,
    p.property_id,
    p.title AS property_title,
    p.city,
    p.price AS property_price,
    p.listing_type,
    a.agent_id,
    a.name AS agent_name,
    COALESCE(pm.payment_status, 'Unpaid') AS payment_status,
    pm.payment_method,
    pm.transaction_id
FROM bookings b
JOIN customers c ON b.customer_id = c.customer_id
JOIN properties p ON b.property_id = p.property_id
JOIN agents a ON b.agent_id = a.agent_id
LEFT JOIN payments pm ON b.booking_id = pm.booking_id;

-- 5. View: Agent_Performance
DROP VIEW IF EXISTS Agent_Performance;
CREATE VIEW Agent_Performance AS
SELECT 
    a.agent_id,
    a.name AS agent_name,
    a.email,
    a.phone,
    a.experience,
    a.commission_rate,
    COUNT(DISTINCT p.property_id) AS total_assigned_properties,
    COUNT(DISTINCT s.sale_id) AS completed_sales,
    COALESCE(SUM(s.sale_price), 0) AS total_sales_volume,
    COALESCE(SUM(s.commission_amount), 0) AS total_commission_earned,
    COUNT(DISTINCT rt.rental_id) AS active_rentals,
    COUNT(DISTINCT v.visit_id) AS total_visits_conducted
FROM agents a
LEFT JOIN properties p ON a.agent_id = p.agent_id
LEFT JOIN sales s ON a.agent_id = s.agent_id
LEFT JOIN rentals rt ON a.agent_id = rt.agent_id
LEFT JOIN visits v ON a.agent_id = v.agent_id AND v.visit_status = 'Completed'
GROUP BY a.agent_id;

-- 6. View: City_Wise_Property_Stats
DROP VIEW IF EXISTS City_Wise_Property_Stats;
CREATE VIEW City_Wise_Property_Stats AS
SELECT 
    city,
    COUNT(property_id) AS total_properties,
    SUM(CASE WHEN property_status = 'Available' THEN 1 ELSE 0 END) AS available_count,
    SUM(CASE WHEN property_status = 'Sold' THEN 1 ELSE 0 END) AS sold_count,
    SUM(CASE WHEN property_status = 'Rented' THEN 1 ELSE 0 END) AS rented_count,
    AVG(price) AS average_price,
    MIN(price) AS min_price,
    MAX(price) AS max_price
FROM properties
GROUP BY city;
