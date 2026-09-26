-- ============================================================
-- REAL ESTATE MANAGEMENT SYSTEM (REMS)
-- Database Schema Script: schema.sql
-- Compatible with MySQL 8.x / MariaDB 10.x & MySQL Workbench
-- ============================================================

CREATE DATABASE IF NOT EXISTS real_estate_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE real_estate_db;

-- Disable foreign key checks during drop & recreate
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS rentals;
DROP TABLE IF EXISTS sales;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS visits;
DROP TABLE IF EXISTS properties;
DROP TABLE IF EXISTS property_types;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS agents;
DROP TABLE IF EXISTS owners;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- TABLE 1: Users (Authentication & User Accounts)
-- ============================================================
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('Admin', 'Agent', 'Customer', 'Owner') NOT NULL DEFAULT 'Customer',
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_email (email),
    INDEX idx_user_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE 2: Owners (Property Owners)
-- Relationship: Owner 1 : N Properties
-- ============================================================
CREATE TABLE owners (
    owner_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_owners_user FOREIGN KEY (user_id) 
        REFERENCES users(user_id) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_owner_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE 3: Agents (Real Estate Agents)
-- Relationship: Agent 1 : N Properties, Agent 1 : N Bookings
-- ============================================================
CREATE TABLE agents (
    agent_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    experience INT NOT NULL DEFAULT 1, -- in years
    commission_rate DECIMAL(5, 2) NOT NULL DEFAULT 2.00, -- percentage (e.g., 2.00%)
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_agents_user FOREIGN KEY (user_id) 
        REFERENCES users(user_id) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_agent_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE 4: Customers (Clients looking to buy/rent)
-- ============================================================
CREATE TABLE customers (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_customers_user FOREIGN KEY (user_id) 
        REFERENCES users(user_id) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_customer_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE 5: Property_Types (Apartment, House, Villa, Plot, Shop, Office, Warehouse)
-- ============================================================
CREATE TABLE property_types (
    property_type_id INT AUTO_INCREMENT PRIMARY KEY,
    type_name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE 6: Properties
-- ============================================================
CREATE TABLE properties (
    property_id INT AUTO_INCREMENT PRIMARY KEY,
    owner_id INT NOT NULL,
    agent_id INT NOT NULL,
    property_type_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(20) NOT NULL,
    area_sqft DECIMAL(10, 2) NOT NULL,
    bedrooms INT DEFAULT 0,
    bathrooms INT DEFAULT 0,
    floor_number INT DEFAULT 0,
    price DECIMAL(14, 2) NOT NULL,
    property_status ENUM('Available', 'Reserved', 'Booked', 'Sold', 'Rented', 'Under Maintenance', 'Pending Approval', 'Rejected') NOT NULL DEFAULT 'Available',
    listing_type ENUM('Sale', 'Rent') NOT NULL DEFAULT 'Sale',
    image_url VARCHAR(500) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_prop_owner FOREIGN KEY (owner_id) 
        REFERENCES owners(owner_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_prop_agent FOREIGN KEY (agent_id) 
        REFERENCES agents(agent_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_prop_type FOREIGN KEY (property_type_id) 
        REFERENCES property_types(property_type_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_prop_price CHECK (price > 0),
    CONSTRAINT chk_prop_area CHECK (area_sqft > 0),
    INDEX idx_prop_city (city),
    INDEX idx_prop_status (property_status),
    INDEX idx_prop_type (property_type_id),
    INDEX idx_prop_price (price),
    INDEX idx_prop_listing (listing_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE 7: Visits (Customer Property Visits)
-- ============================================================
CREATE TABLE visits (
    visit_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    property_id INT NOT NULL,
    agent_id INT NOT NULL,
    visit_date DATE NOT NULL,
    visit_time TIME NOT NULL,
    visit_status ENUM('Scheduled', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Scheduled',
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_visits_customer FOREIGN KEY (customer_id) 
        REFERENCES customers(customer_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_visits_property FOREIGN KEY (property_id) 
        REFERENCES properties(property_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_visits_agent FOREIGN KEY (agent_id) 
        REFERENCES agents(agent_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_visit_date (visit_date),
    INDEX idx_visit_status (visit_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE 8: Bookings (Property Reservation & Bookings)
-- ============================================================
CREATE TABLE bookings (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    property_id INT NOT NULL,
    agent_id INT NOT NULL,
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    booking_amount DECIMAL(12, 2) NOT NULL,
    booking_status ENUM('Pending', 'Confirmed', 'Cancelled', 'Completed') NOT NULL DEFAULT 'Pending',
    remarks TEXT,
    CONSTRAINT fk_bookings_customer FOREIGN KEY (customer_id) 
        REFERENCES customers(customer_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_bookings_property FOREIGN KEY (property_id) 
        REFERENCES properties(property_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_bookings_agent FOREIGN KEY (agent_id) 
        REFERENCES agents(agent_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_booking_amount CHECK (booking_amount > 0),
    INDEX idx_booking_status (booking_status),
    INDEX idx_booking_customer (customer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE 9: Payments (Payment Transactions for Bookings)
-- ============================================================
CREATE TABLE payments (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    customer_id INT NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    payment_method ENUM('Cash', 'UPI', 'Credit Card', 'Debit Card', 'Bank Transfer') NOT NULL DEFAULT 'UPI',
    transaction_id VARCHAR(100) NOT NULL UNIQUE,
    payment_status ENUM('Pending', 'Completed', 'Failed', 'Refunded') NOT NULL DEFAULT 'Completed',
    CONSTRAINT fk_payments_booking FOREIGN KEY (booking_id) 
        REFERENCES bookings(booking_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_payments_customer FOREIGN KEY (customer_id) 
        REFERENCES customers(customer_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_payment_amount CHECK (amount > 0),
    INDEX idx_payment_status (payment_status),
    INDEX idx_payment_txn (transaction_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE 10: Sales (Completed Property Sales)
-- ============================================================
CREATE TABLE sales (
    sale_id INT AUTO_INCREMENT PRIMARY KEY,
    property_id INT NOT NULL,
    customer_id INT NOT NULL,
    agent_id INT NOT NULL,
    sale_date DATE NOT NULL,
    sale_price DECIMAL(14, 2) NOT NULL,
    commission_amount DECIMAL(12, 2) NOT NULL,
    sale_status ENUM('Completed', 'Pending', 'Cancelled') NOT NULL DEFAULT 'Completed',
    CONSTRAINT fk_sales_property FOREIGN KEY (property_id) 
        REFERENCES properties(property_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_sales_customer FOREIGN KEY (customer_id) 
        REFERENCES customers(customer_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_sales_agent FOREIGN KEY (agent_id) 
        REFERENCES agents(agent_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_sales_date (sale_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE 11: Rentals (Rental Contracts & Agreements)
-- ============================================================
CREATE TABLE rentals (
    rental_id INT AUTO_INCREMENT PRIMARY KEY,
    property_id INT NOT NULL,
    customer_id INT NOT NULL,
    agent_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    monthly_rent DECIMAL(12, 2) NOT NULL,
    security_deposit DECIMAL(12, 2) NOT NULL,
    rental_status ENUM('Active', 'Expired', 'Terminated') NOT NULL DEFAULT 'Active',
    CONSTRAINT fk_rentals_property FOREIGN KEY (property_id) 
        REFERENCES properties(property_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_rentals_customer FOREIGN KEY (customer_id) 
        REFERENCES customers(customer_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_rentals_agent FOREIGN KEY (agent_id) 
        REFERENCES agents(agent_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_rental_status (rental_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE 12: Reviews (Ratings & Feedback)
-- ============================================================
CREATE TABLE reviews (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    property_id INT NOT NULL,
    rating INT NOT NULL,
    comment TEXT,
    review_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_reviews_customer FOREIGN KEY (customer_id) 
        REFERENCES customers(customer_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_reviews_property FOREIGN KEY (property_id) 
        REFERENCES properties(property_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT chk_review_rating CHECK (rating >= 1 AND rating <= 5),
    INDEX idx_review_prop (property_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE 13: In-App Notifications (Alerts & Activity Feed)
-- ============================================================
CREATE TABLE notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notif_user FOREIGN KEY (user_id) 
        REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_notif_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
