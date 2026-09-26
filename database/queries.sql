-- ============================================================
-- REAL ESTATE MANAGEMENT SYSTEM (REMS)
-- 32 Comprehensive SQL Queries: queries.sql
-- Demonstrating: SELECT, WHERE, ORDER BY, GROUP BY, HAVING,
-- INNER JOIN, LEFT JOIN, MULTI-TABLE JOINS, AGGREGATE FUNCTIONS,
-- SUBQUERIES, CORRELATED SUBQUERIES, VIEWS & TRANSACTIONS
-- ============================================================

USE real_estate_db;

-- 1. Show all available properties
SELECT property_id, title, city, price, listing_type, property_status 
FROM properties 
WHERE property_status = 'Available';

-- 2. Show properties located in Mohali
SELECT property_id, title, address, city, price, bedrooms, area_sqft 
FROM properties 
WHERE city = 'Mohali';

-- 3. Show properties under ₹70 Lakh (₹70,00,000)
SELECT property_id, title, city, price, listing_type 
FROM properties 
WHERE price <= 7000000.00
ORDER BY price DESC;

-- 4. Find all 3 BHK properties
SELECT property_id, title, city, area_sqft, bedrooms, bathrooms, price 
FROM properties 
WHERE bedrooms = 3;

-- 5. Sort properties by price in ascending order
SELECT property_id, title, city, price, listing_type 
FROM properties 
ORDER BY price ASC;

-- 6. Count total properties grouped by city
SELECT city, COUNT(property_id) AS total_properties 
FROM properties 
GROUP BY city 
ORDER BY total_properties DESC;

-- 7. Find average property price for properties on Sale
SELECT ROUND(AVG(price), 2) AS average_sale_price 
FROM properties 
WHERE listing_type = 'Sale';

-- 8. Find maximum property price in the system
SELECT MAX(price) AS highest_property_price 
FROM properties;

-- 9. Find minimum property price for Sale
SELECT MIN(price) AS lowest_sale_price 
FROM properties 
WHERE listing_type = 'Sale';

-- 10. Show customer booking history with joins
SELECT 
    b.booking_id, 
    c.name AS customer_name, 
    p.title AS property_title, 
    p.city, 
    b.booking_amount, 
    b.booking_status, 
    b.booking_date 
FROM bookings b
INNER JOIN customers c ON b.customer_id = c.customer_id
INNER JOIN properties p ON b.property_id = p.property_id
ORDER BY b.booking_date DESC;

-- 11. Show property owner details for every property
SELECT 
    p.property_id, 
    p.title AS property_title, 
    p.city, 
    o.name AS owner_name, 
    o.phone AS owner_phone, 
    o.email AS owner_email 
FROM properties p
INNER JOIN owners o ON p.owner_id = o.owner_id;

-- 12. Show agent assigned to each property
SELECT 
    p.property_id, 
    p.title, 
    p.city, 
    a.name AS agent_name, 
    a.phone AS agent_phone, 
    a.commission_rate 
FROM properties p
INNER JOIN agents a ON p.agent_id = a.agent_id;

-- 13. Find customers who have made confirmed bookings (Subquery with IN)
SELECT customer_id, name, email, phone 
FROM customers 
WHERE customer_id IN (
    SELECT DISTINCT customer_id 
    FROM bookings 
    WHERE booking_status = 'Confirmed' OR booking_status = 'Completed'
);

-- 14. Find properties that have never been booked (LEFT JOIN / NOT IN subquery)
SELECT p.property_id, p.title, p.city, p.price 
FROM properties p
LEFT JOIN bookings b ON p.property_id = b.property_id
WHERE b.booking_id IS NULL;

-- 15. Subquery: Find properties priced above the average price of all properties
SELECT property_id, title, city, price 
FROM properties 
WHERE price > (SELECT AVG(price) FROM properties)
ORDER BY price DESC;

-- 16. Calculate total sales revenue generated from closed sales
SELECT 
    COUNT(sale_id) AS total_deals_closed, 
    SUM(sale_price) AS total_sales_volume 
FROM sales 
WHERE sale_status = 'Completed';

-- 17. Calculate total revenue collected across all completed payments
SELECT 
    COUNT(payment_id) AS total_transactions, 
    SUM(amount) AS total_revenue_collected 
FROM payments 
WHERE payment_status = 'Completed';

-- 18. Calculate total agent commissions paid across all sales
SELECT 
    COUNT(sale_id) AS total_commissioned_sales, 
    SUM(commission_amount) AS total_commission_paid 
FROM sales;

-- 19. Find top-performing agents ranked by total sales volume
SELECT 
    a.agent_id, 
    a.name AS agent_name, 
    COUNT(s.sale_id) AS total_sales_count, 
    SUM(s.sale_price) AS total_volume_sold, 
    SUM(s.commission_amount) AS total_commission_earned 
FROM agents a
INNER JOIN sales s ON a.agent_id = s.agent_id
GROUP BY a.agent_id, a.name
ORDER BY total_volume_sold DESC;

-- 20. Find customers with successfully completed payments
SELECT DISTINCT 
    c.customer_id, 
    c.name, 
    c.phone, 
    p.transaction_id, 
    p.amount, 
    p.payment_method 
FROM customers c
INNER JOIN payments p ON c.customer_id = p.customer_id
WHERE p.payment_status = 'Completed';

-- 21. Show all upcoming scheduled visits
SELECT 
    v.visit_id, 
    v.visit_date, 
    v.visit_time, 
    c.name AS customer_name, 
    c.phone AS customer_phone, 
    p.title AS property_title, 
    p.city, 
    a.name AS agent_name 
FROM visits v
JOIN customers c ON v.customer_id = c.customer_id
JOIN properties p ON v.property_id = p.property_id
JOIN agents a ON v.agent_id = a.agent_id
WHERE v.visit_status = 'Scheduled'
ORDER BY v.visit_date ASC, v.visit_time ASC;

-- 22. Show cancelled visits with customer remarks
SELECT 
    v.visit_id, 
    v.visit_date, 
    c.name AS customer_name, 
    p.title AS property_title, 
    v.remarks 
FROM visits v
JOIN customers c ON v.customer_id = c.customer_id
JOIN properties p ON v.property_id = p.property_id
WHERE v.visit_status = 'Cancelled';

-- 23. Show pending payments requiring settlement
SELECT 
    pm.payment_id, 
    pm.booking_id, 
    c.name AS customer_name, 
    c.phone, 
    pm.amount, 
    pm.payment_status 
FROM payments pm
JOIN customers c ON pm.customer_id = c.customer_id
WHERE pm.payment_status = 'Pending';

-- 24. Show properties with an average rating of 4.5 or higher (GROUP BY & HAVING)
SELECT 
    p.property_id, 
    p.title, 
    p.city, 
    ROUND(AVG(r.rating), 2) AS average_rating, 
    COUNT(r.review_id) AS total_reviews 
FROM properties p
INNER JOIN reviews r ON p.property_id = r.property_id
GROUP BY p.property_id, p.title, p.city
HAVING AVG(r.rating) >= 4.5
ORDER BY average_rating DESC;

-- 25. Show most reviewed properties in the system
SELECT 
    p.property_id, 
    p.title, 
    p.city, 
    COUNT(r.review_id) AS review_count 
FROM properties p
INNER JOIN reviews r ON p.property_id = r.property_id
GROUP BY p.property_id, p.title, p.city
ORDER BY review_count DESC;

-- 26. Show available rental properties with monthly rent below ₹50,000
SELECT 
    property_id, 
    title, 
    city, 
    price AS monthly_rent, 
    bedrooms, 
    area_sqft 
FROM properties 
WHERE listing_type = 'Rent' 
  AND property_status = 'Available' 
  AND price < 50000.00
ORDER BY price ASC;

-- 27. Show available properties for Sale grouped by property type
SELECT 
    pt.type_name, 
    COUNT(p.property_id) AS total_available, 
    MIN(p.price) AS min_price, 
    MAX(p.price) AS max_price, 
    ROUND(AVG(p.price), 2) AS avg_price 
FROM properties p
JOIN property_types pt ON p.property_type_id = pt.property_type_id
WHERE p.listing_type = 'Sale' AND p.property_status = 'Available'
GROUP BY pt.type_name;

-- 28. Monthly sales trend (Year-Month breakdown)
SELECT 
    DATE_FORMAT(sale_date, '%Y-%m') AS sale_month, 
    COUNT(sale_id) AS total_sales_count, 
    SUM(sale_price) AS monthly_revenue 
FROM sales 
WHERE sale_status = 'Completed'
GROUP BY DATE_FORMAT(sale_date, '%Y-%m')
ORDER BY sale_month DESC;

-- 29. City-wise total sales revenue generated
SELECT 
    p.city, 
    COUNT(s.sale_id) AS units_sold, 
    SUM(s.sale_price) AS city_total_revenue 
FROM sales s
JOIN properties p ON s.property_id = p.property_id
WHERE s.sale_status = 'Completed'
GROUP BY p.city
ORDER BY city_total_revenue DESC;

-- 30. Customer-wise total spending across all bookings & purchases
SELECT 
    c.customer_id, 
    c.name AS customer_name, 
    c.email, 
    COALESCE(SUM(pm.amount), 0) AS total_amount_spent 
FROM customers c
LEFT JOIN payments pm ON c.customer_id = pm.customer_id AND pm.payment_status = 'Completed'
GROUP BY c.customer_id, c.name, c.email
ORDER BY total_amount_spent DESC;

-- 31. Multi-table comprehensive JOIN query for customer transaction ledger
SELECT 
    b.booking_id, 
    c.name AS customer_name, 
    p.title AS property_name, 
    pt.type_name AS property_category, 
    a.name AS servicing_agent, 
    pm.transaction_id, 
    pm.amount, 
    pm.payment_method, 
    pm.payment_status 
FROM bookings b
JOIN customers c ON b.customer_id = c.customer_id
JOIN properties p ON b.property_id = p.property_id
JOIN property_types pt ON p.property_type_id = pt.property_type_id
JOIN agents a ON b.agent_id = a.agent_id
JOIN payments pm ON b.booking_id = pm.booking_id
ORDER BY b.booking_date DESC;

-- 32. Correlated Subquery: Agents whose commission is higher than their peer average
SELECT a.agent_id, a.name, a.commission_rate 
FROM agents a
WHERE a.commission_rate > (
    SELECT AVG(a2.commission_rate) 
    FROM agents a2
);
