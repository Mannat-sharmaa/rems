-- ============================================================
-- REAL ESTATE MANAGEMENT SYSTEM (REMS)
-- Sample Seed Data: sample_data.sql
-- ============================================================

USE real_estate_db;

-- 1. INSERT USERS
-- Default passwords:
-- Admin: admin123 ($2a$10$A19YGkclb2C3lgk9661JxuysVeMp3.zApoZK6OZU5n2XUjeAGUcQi)
-- All Others: password123 ($2a$10$7vpm/oRvkf9yN4aJ2IOK3eeD3oVRE9OUr6z7gaqe04zzurzMvti8K)

INSERT INTO users (user_id, name, email, phone, password, role, address) VALUES
(1, 'System Administrator', 'admin@rems.com', '+91 98765 00000', '$2a$10$A19YGkclb2C3lgk9661JxuysVeMp3.zApoZK6OZU5n2XUjeAGUcQi', 'Admin', 'REMS Corporate Tower, Cyber City, Gurugram'),
(2, 'Rahul Sharma', 'rahul.agent@rems.com', '+91 98765 11001', '$2a$10$7vpm/oRvkf9yN4aJ2IOK3eeD3oVRE9OUr6z7gaqe04zzurzMvti8K', 'Agent', 'Sector 70, Mohali, Punjab'),
(3, 'Priya Verma', 'priya.agent@rems.com', '+91 98765 11002', '$2a$10$7vpm/oRvkf9yN4aJ2IOK3eeD3oVRE9OUr6z7gaqe04zzurzMvti8K', 'Agent', 'Sector 35-C, Chandigarh'),
(4, 'Amit Patel', 'amit.agent@rems.com', '+91 98765 11003', '$2a$10$7vpm/oRvkf9yN4aJ2IOK3eeD3oVRE9OUr6z7gaqe04zzurzMvti8K', 'Agent', 'Sector 14, Panchkula, Haryana'),
(5, 'Sneha Kapoor', 'sneha.agent@rems.com', '+91 98765 11004', '$2a$10$7vpm/oRvkf9yN4aJ2IOK3eeD3oVRE9OUr6z7gaqe04zzurzMvti8K', 'Agent', 'Bandra West, Mumbai'),
(6, 'Vikram Singhania', 'vikram.agent@rems.com', '+91 98765 11005', '$2a$10$7vpm/oRvkf9yN4aJ2IOK3eeD3oVRE9OUr6z7gaqe04zzurzMvti8K', 'Agent', 'Indiranagar, Bengaluru'),
(7, 'Ananya Sen', 'ananya.agent@rems.com', '+91 98765 11006', '$2a$10$7vpm/oRvkf9yN4aJ2IOK3eeD3oVRE9OUr6z7gaqe04zzurzMvti8K', 'Agent', 'South Extension II, New Delhi'),
(8, 'Rohan Mehra', 'rohan.agent@rems.com', '+91 98765 11007', '$2a$10$7vpm/oRvkf9yN4aJ2IOK3eeD3oVRE9OUr6z7gaqe04zzurzMvti8K', 'Agent', 'Golf Course Road, Gurugram'),
(9, 'Kavita Joshi', 'kavita.agent@rems.com', '+91 98765 11008', '$2a$10$7vpm/oRvkf9yN4aJ2IOK3eeD3oVRE9OUr6z7gaqe04zzurzMvti8K', 'Agent', 'Koregaon Park, Pune'),
(10, 'Arjun Reddy', 'arjun.agent@rems.com', '+91 98765 11009', '$2a$10$7vpm/oRvkf9yN4aJ2IOK3eeD3oVRE9OUr6z7gaqe04zzurzMvti8K', 'Agent', 'Jubilee Hills, Hyderabad'),
(11, 'Deepak Chawla', 'deepak.agent@rems.com', '+91 98765 11010', '$2a$10$7vpm/oRvkf9yN4aJ2IOK3eeD3oVRE9OUr6z7gaqe04zzurzMvti8K', 'Agent', 'Sector 82, Mohali, Punjab'),

-- Customers
(12, 'Mannat Sharma', 'mannat@example.com', '+91 98111 22001', '$2a$10$7vpm/oRvkf9yN4aJ2IOK3eeD3oVRE9OUr6z7gaqe04zzurzMvti8K', 'Customer', 'Phase 7, Mohali, Punjab'),
(13, 'Aman Deep Singh', 'aman.deep@example.com', '+91 98111 22002', '$2a$10$7vpm/oRvkf9yN4aJ2IOK3eeD3oVRE9OUr6z7gaqe04zzurzMvti8K', 'Customer', 'Sector 22, Chandigarh'),
(14, 'Simran Kaur', 'simran.k@example.com', '+91 98111 22003', '$2a$10$7vpm/oRvkf9yN4aJ2IOK3eeD3oVRE9OUr6z7gaqe04zzurzMvti8K', 'Customer', 'Sector 11, Panchkula'),
(15, 'Rajesh Gupta', 'rajesh.g@example.com', '+91 98111 22004', '$2a$10$7vpm/oRvkf9yN4aJ2IOK3eeD3oVRE9OUr6z7gaqe04zzurzMvti8K', 'Customer', 'Greater Kailash 1, New Delhi'),
(16, 'Neha Malhotra', 'neha.m@example.com', '+91 98111 22005', '$2a$10$7vpm/oRvkf9yN4aJ2IOK3eeD3oVRE9OUr6z7gaqe04zzurzMvti8K', 'Customer', 'DLF Phase 5, Gurugram'),
(17, 'Karan Grover', 'karan.g@example.com', '+91 98111 22006', '$2a$10$7vpm/oRvkf9yN4aJ2IOK3eeD3oVRE9OUr6z7gaqe04zzurzMvti8K', 'Customer', 'HSR Layout, Bengaluru'),
(18, 'Pooja Bhatia', 'pooja.b@example.com', '+91 98111 22007', '$2a$10$7vpm/oRvkf9yN4aJ2IOK3eeD3oVRE9OUr6z7gaqe04zzurzMvti8K', 'Customer', 'Andheri West, Mumbai'),
(19, 'Siddharth Roy', 'siddharth.r@example.com', '+91 98111 22008', '$2a$10$7vpm/oRvkf9yN4aJ2IOK3eeD3oVRE9OUr6z7gaqe04zzurzMvti8K', 'Customer', 'Viman Nagar, Pune'),
(20, 'Divya Nair', 'divya.n@example.com', '+91 98111 22009', '$2a$10$7vpm/oRvkf9yN4aJ2IOK3eeD3oVRE9OUr6z7gaqe04zzurzMvti8K', 'Customer', 'Banjara Hills, Hyderabad'),
(21, 'Harpreet Singh', 'harpreet.s@example.com', '+91 98111 22010', '$2a$10$7vpm/oRvkf9yN4aJ2IOK3eeD3oVRE9OUr6z7gaqe04zzurzMvti8K', 'Customer', 'Sector 68, Mohali'),
(22, 'Gaurav Aggarwal', 'gaurav.a@example.com', '+91 98111 22011', '$2a$10$7vpm/oRvkf9yN4aJ2IOK3eeD3oVRE9OUr6z7gaqe04zzurzMvti8K', 'Customer', 'Civil Lines, Ludhiana'),
(23, 'Megha Bansal', 'megha.b@example.com', '+91 98111 22012', '$2a$10$7vpm/oRvkf9yN4aJ2IOK3eeD3oVRE9OUr6z7gaqe04zzurzMvti8K', 'Customer', 'Sector 9, Chandigarh'),
(24, 'Nikhil Saxena', 'nikhil.s@example.com', '+91 98111 22013', '$2a$10$7vpm/oRvkf9yN4aJ2IOK3eeD3oVRE9OUr6z7gaqe04zzurzMvti8K', 'Customer', 'Noida Sector 62, UP'),
(25, 'Ritu Sundaram', 'ritu.s@example.com', '+91 98111 22014', '$2a$10$7vpm/oRvkf9yN4aJ2IOK3eeD3oVRE9OUr6z7gaqe04zzurzMvti8K', 'Customer', 'Whitefield, Bengaluru'),
(26, 'Aditya Rao', 'aditya.r@example.com', '+91 98111 22015', '$2a$10$7vpm/oRvkf9yN4aJ2IOK3eeD3oVRE9OUr6z7gaqe04zzurzMvti8K', 'Customer', 'Gachibowli, Hyderabad'),
(27, 'Tanvi Deshmukh', 'tanvi.d@example.com', '+91 98111 22016', '$2a$10$7vpm/oRvkf9yN4aJ2IOK3eeD3oVRE9OUr6z7gaqe04zzurzMvti8K', 'Customer', 'Kothrud, Pune'),
(28, 'Vivek Khurana', 'vivek.k@example.com', '+91 98111 22017', '$2a$10$7vpm/oRvkf9yN4aJ2IOK3eeD3oVRE9OUr6z7gaqe04zzurzMvti8K', 'Customer', 'Sector 15, Panchkula'),
(29, 'Isha Talwar', 'isha.t@example.com', '+91 98111 22018', '$2a$10$7vpm/oRvkf9yN4aJ2IOK3eeD3oVRE9OUr6z7gaqe04zzurzMvti8K', 'Customer', 'Bandra Kurla Complex, Mumbai'),
(30, 'Jaspreet Kaur', 'jaspreet.k@example.com', '+91 98111 22019', '$2a$10$7vpm/oRvkf9yN4aJ2IOK3eeD3oVRE9OUr6z7gaqe04zzurzMvti8K', 'Customer', 'Sector 79, Mohali'),
(31, 'Varun Chopra', 'varun.c@example.com', '+91 98111 22020', '$2a$10$7vpm/oRvkf9yN4aJ2IOK3eeD3oVRE9OUr6z7gaqe04zzurzMvti8K', 'Customer', 'Saket, New Delhi'),

-- Owners
(32, 'Harbhajan Brar', 'harbhajan.owner@rems.com', '+91 98222 33001', '$2a$10$7vpm/oRvkf9yN4aJ2IOK3eeD3oVRE9OUr6z7gaqe04zzurzMvti8K', 'Owner', 'Sector 69, Mohali, Punjab'),
(33, 'Suresh Oberoi', 'suresh.owner@rems.com', '+91 98222 33002', '$2a$10$7vpm/oRvkf9yN4aJ2IOK3eeD3oVRE9OUr6z7gaqe04zzurzMvti8K', 'Owner', 'Sector 8, Chandigarh'),
(34, 'Rajendra Mittal', 'mittal.owner@rems.com', '+91 98222 33003', '$2a$10$7vpm/oRvkf9yN4aJ2IOK3eeD3oVRE9OUr6z7gaqe04zzurzMvti8K', 'Owner', 'Sector 6, Panchkula'),
(35, 'Sunil Raheja', 'sunil.owner@rems.com', '+91 98222 33004', '$2a$10$7vpm/oRvkf9yN4aJ2IOK3eeD3oVRE9OUr6z7gaqe04zzurzMvti8K', 'Owner', 'Worli Sea Face, Mumbai'),
(36, 'Naveen Jindal', 'naveen.owner@rems.com', '+91 98222 33005', '$2a$10$7vpm/oRvkf9yN4aJ2IOK3eeD3oVRE9OUr6z7gaqe04zzurzMvti8K', 'Owner', 'Golf Links, New Delhi'),
(37, 'Kiran Mazumdar', 'kiran.owner@rems.com', '+91 98222 33006', '$2a$10$7vpm/oRvkf9yN4aJ2IOK3eeD3oVRE9OUr6z7gaqe04zzurzMvti8K', 'Owner', 'Koramangala 3rd Block, Bengaluru'),
(38, 'Pawan Munjal', 'pawan.owner@rems.com', '+91 98222 33007', '$2a$10$7vpm/oRvkf9yN4aJ2IOK3eeD3oVRE9OUr6z7gaqe04zzurzMvti8K', 'Owner', 'DLF Phase 1, Gurugram'),
(39, 'Anil Kirloskar', 'anil.owner@rems.com', '+91 98222 33008', '$2a$10$7vpm/oRvkf9yN4aJ2IOK3eeD3oVRE9OUr6z7gaqe04zzurzMvti8K', 'Owner', 'Boat Club Road, Pune'),
(40, 'Chandra Shekhar Rao', 'chandra.owner@rems.com', '+91 98222 33009', '$2a$10$7vpm/oRvkf9yN4aJ2IOK3eeD3oVRE9OUr6z7gaqe04zzurzMvti8K', 'Owner', 'Madhapur, Hyderabad'),
(41, 'Gurpreet Dhillon', 'gurpreet.owner@rems.com', '+91 98222 33010', '$2a$10$7vpm/oRvkf9yN4aJ2IOK3eeD3oVRE9OUr6z7gaqe04zzurzMvti8K', 'Owner', 'Aerocity, Mohali, Punjab');

-- 2. INSERT OWNERS
INSERT INTO owners (owner_id, user_id, name, email, phone, address) VALUES
(1, 32, 'Harbhajan Brar', 'harbhajan.owner@rems.com', '+91 98222 33001', 'Sector 69, Mohali, Punjab'),
(2, 33, 'Suresh Oberoi', 'suresh.owner@rems.com', '+91 98222 33002', 'Sector 8, Chandigarh'),
(3, 34, 'Rajendra Mittal', 'mittal.owner@rems.com', '+91 98222 33003', 'Sector 6, Panchkula'),
(4, 35, 'Sunil Raheja', 'sunil.owner@rems.com', '+91 98222 33004', 'Worli Sea Face, Mumbai'),
(5, 36, 'Naveen Jindal', 'naveen.owner@rems.com', '+91 98222 33005', 'Golf Links, New Delhi'),
(6, 37, 'Kiran Mazumdar', 'kiran.owner@rems.com', '+91 98222 33006', 'Koramangala 3rd Block, Bengaluru'),
(7, 38, 'Pawan Munjal', 'pawan.owner@rems.com', '+91 98222 33007', 'DLF Phase 1, Gurugram'),
(8, 39, 'Anil Kirloskar', 'anil.owner@rems.com', '+91 98222 33008', 'Boat Club Road, Pune'),
(9, 40, 'Chandra Shekhar Rao', 'chandra.owner@rems.com', '+91 98222 33009', 'Madhapur, Hyderabad'),
(10, 41, 'Gurpreet Dhillon', 'gurpreet.owner@rems.com', '+91 98222 33010', 'Aerocity, Mohali, Punjab');

-- 3. INSERT AGENTS
INSERT INTO agents (agent_id, user_id, name, email, phone, experience, commission_rate, address) VALUES
(1, 2, 'Rahul Sharma', 'rahul.agent@rems.com', '+91 98765 11001', 7, 2.00, 'Sector 70, Mohali, Punjab'),
(2, 3, 'Priya Verma', 'priya.agent@rems.com', '+91 98765 11002', 5, 2.00, 'Sector 35-C, Chandigarh'),
(3, 4, 'Amit Patel', 'amit.agent@rems.com', '+91 98765 11003', 4, 1.80, 'Sector 14, Panchkula, Haryana'),
(4, 5, 'Sneha Kapoor', 'sneha.agent@rems.com', '+91 98765 11004', 8, 2.50, 'Bandra West, Mumbai'),
(5, 6, 'Vikram Singhania', 'vikram.agent@rems.com', '+91 98765 11005', 6, 2.00, 'Indiranagar, Bengaluru'),
(6, 7, 'Ananya Sen', 'ananya.agent@rems.com', '+91 98765 11006', 9, 2.20, 'South Extension II, New Delhi'),
(7, 8, 'Rohan Mehra', 'rohan.agent@rems.com', '+91 98765 11007', 5, 2.00, 'Golf Course Road, Gurugram'),
(8, 9, 'Kavita Joshi', 'kavita.agent@rems.com', '+91 98765 11008', 3, 1.75, 'Koregaon Park, Pune'),
(9, 10, 'Arjun Reddy', 'arjun.agent@rems.com', '+91 98765 11009', 7, 2.00, 'Jubilee Hills, Hyderabad'),
(10, 11, 'Deepak Chawla', 'deepak.agent@rems.com', '+91 98765 11010', 4, 2.00, 'Sector 82, Mohali, Punjab');

-- 4. INSERT CUSTOMERS
INSERT INTO customers (customer_id, user_id, name, email, phone, address) VALUES
(1, 12, 'Mannat Sharma', 'mannat@example.com', '+91 98111 22001', 'Phase 7, Mohali, Punjab'),
(2, 13, 'Aman Deep Singh', 'aman.deep@example.com', '+91 98111 22002', 'Sector 22, Chandigarh'),
(3, 14, 'Simran Kaur', 'simran.k@example.com', '+91 98111 22003', 'Sector 11, Panchkula'),
(4, 15, 'Rajesh Gupta', 'rajesh.g@example.com', '+91 98111 22004', 'Greater Kailash 1, New Delhi'),
(5, 16, 'Neha Malhotra', 'neha.m@example.com', '+91 98111 22005', 'DLF Phase 5, Gurugram'),
(6, 17, 'Karan Grover', 'karan.g@example.com', '+91 98111 22006', 'HSR Layout, Bengaluru'),
(7, 18, 'Pooja Bhatia', 'pooja.b@example.com', '+91 98111 22007', 'Andheri West, Mumbai'),
(8, 19, 'Siddharth Roy', 'siddharth.r@example.com', '+91 98111 22008', 'Viman Nagar, Pune'),
(9, 20, 'Divya Nair', 'divya.n@example.com', '+91 98111 22009', 'Banjara Hills, Hyderabad'),
(10, 21, 'Harpreet Singh', 'harpreet.s@example.com', '+91 98111 22010', 'Sector 68, Mohali'),
(11, 22, 'Gaurav Aggarwal', 'gaurav.a@example.com', '+91 98111 22011', 'Civil Lines, Ludhiana'),
(12, 23, 'Megha Bansal', 'megha.b@example.com', '+91 98111 22012', 'Sector 9, Chandigarh'),
(13, 24, 'Nikhil Saxena', 'nikhil.s@example.com', '+91 98111 22013', 'Noida Sector 62, UP'),
(14, 25, 'Ritu Sundaram', 'ritu.s@example.com', '+91 98111 22014', 'Whitefield, Bengaluru'),
(15, 26, 'Aditya Rao', 'aditya.r@example.com', '+91 98111 22015', 'Gachibowli, Hyderabad'),
(16, 27, 'Tanvi Deshmukh', 'tanvi.d@example.com', '+91 98111 22016', 'Kothrud, Pune'),
(17, 28, 'Vivek Khurana', 'vivek.k@example.com', '+91 98111 22017', 'Sector 15, Panchkula'),
(18, 29, 'Isha Talwar', 'isha.t@example.com', '+91 98111 22018', 'Bandra Kurla Complex, Mumbai'),
(19, 30, 'Jaspreet Kaur', 'jaspreet.k@example.com', '+91 98111 22019', 'Sector 79, Mohali'),
(20, 31, 'Varun Chopra', 'varun.c@example.com', '+91 98111 22020', 'Saket, New Delhi');

-- 5. INSERT PROPERTY_TYPES (7 Types)
INSERT INTO property_types (property_type_id, type_name, description) VALUES
(1, 'Apartment', 'High-rise & mid-rise multi-family residential apartments with modern amenities.'),
(2, 'House', 'Independent residential houses, bungalows, and duplex units.'),
(3, 'Villa', 'Luxury standalone estates featuring private gardens and premium architectural design.'),
(4, 'Plot', 'Residential and commercial land plots ready for custom development.'),
(5, 'Shop', 'Retail spaces, showroom fronts, and commercial shopping plaza units.'),
(6, 'Office', 'Corporate workspaces, tech parks, and commercial office suites.'),
(7, 'Warehouse', 'Industrial logistics centers and heavy storage storage facilities.');

-- 6. INSERT PROPERTIES (30 Properties)
INSERT INTO properties (property_id, owner_id, agent_id, property_type_id, title, description, address, city, state, pincode, area_sqft, bedrooms, bathrooms, floor_number, price, property_status, listing_type, image_url) VALUES
-- P101: Presentation Scenario Property (Mohali, 3 BHK, 65 Lakhs, Available)
(101, 1, 1, 1, '3BHK Luxury Skyline Apartment', 'Ultra modern apartment in prime Sector 67 with Italian marble flooring, panoramic balcony view, club membership, modular kitchen, and smart home automation.', 'Flat 502, Tower B, Sector 67', 'Mohali', 'Punjab', '160062', 1800.00, 3, 2, 5, 6500000.00, 'Available', 'Sale', 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80'),
(102, 2, 2, 3, 'Chandigarh Royale Heritage Villa', 'Exclusive French-colonial villa with a landscaped garden, private plunge pool, solar power, and home theater setup in a serene VIP sector.', 'House 142, Sector 8-B', 'Chandigarh', 'Chandigarh', '160008', 4200.00, 5, 5, 2, 12500000.00, 'Available', 'Sale', 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1000&q=80'),
(103, 3, 3, 2, 'Panchkula Pine Independent Duplex', 'Well-ventilated East-facing duplex overlooking the Shivalik foothills with private terrace and double parking.', 'Kothi 88, Sector 6', 'Panchkula', 'Haryana', '134109', 2400.00, 4, 3, 2, 8500000.00, 'Available', 'Sale', 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1000&q=80'),
(104, 1, 1, 1, 'Parkview Heights 2BHK Flat', 'Cozy modern apartment close to IT City with 24/7 security, gym, children play area, and lift access.', 'Flat 204, Tower A, Sector 82', 'Mohali', 'Punjab', '160055', 1250.00, 2, 2, 2, 4200000.00, 'Available', 'Sale', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1000&q=80'),
(105, 10, 10, 5, 'Prime High-Street Retail Shop', 'Commercial corner shop with double facade visibility on the main airport road corridor.', 'SCO 23, Aerocity Commercial Zone', 'Mohali', 'Punjab', '140306', 950.00, 0, 1, 1, 5500000.00, 'Available', 'Sale', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=80'),
(106, 2, 2, 1, 'Sector 35 Executive 3BHK Residence', 'Spacious semi-furnished apartment in the heart of Chandigarh with park facing balconies and lift.', 'Apartment 3A, Sector 35-C', 'Chandigarh', 'Chandigarh', '160035', 1650.00, 3, 3, 3, 7200000.00, 'Available', 'Sale', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=80'),
(107, 7, 7, 1, 'Golf Course Modern Penthouse', 'Ultra-luxury penthouse offering 360-degree skyline views, personal elevator, and concierge service.', 'Penthouse 2101, Golf Links Tower', 'Gurugram', 'Haryana', '122002', 3800.00, 4, 4, 21, 24000000.00, 'Available', 'Sale', 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80'),
(108, 5, 6, 2, 'South Ex Signature Bungalow', 'Prime location private property in South Delhi with basement, stilt parking, and servant quarter.', 'B-14, South Extension Part 2', 'New Delhi', 'Delhi', '110049', 3200.00, 4, 4, 3, 31000000.00, 'Available', 'Sale', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80'),
(109, 4, 4, 1, 'Bandra Sea-Breeze Luxury Flat', 'Stunning sea-view 2BHK flat in Bandra West with modern interiors and valet parking.', 'Sea Crest, Carter Road', 'Mumbai', 'Maharashtra', '400050', 1100.00, 2, 2, 12, 18500000.00, 'Available', 'Sale', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1000&q=80'),
(110, 6, 5, 6, 'Indiranagar Commercial Tech Hub', 'Plug and play corporate office floor with conference rooms, cafeteria, and high speed fiber.', '100 Feet Road, Indiranagar', 'Bengaluru', 'Karnataka', '560038', 5500.00, 0, 4, 2, 38000000.00, 'Available', 'Sale', 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=80'),

-- Rentals
(111, 1, 1, 1, 'Fully Furnished 2BHK for Rent', 'Designer interiors, high-speed Wi-Fi, air conditioners in all rooms, modular kitchen, ready to move.', 'Tower 4, Sector 70', 'Mohali', 'Punjab', '160071', 1150.00, 2, 2, 4, 28000.00, 'Available', 'Rent', 'https://images.unsplash.com/photo-1502005229762-ee1b2da94e0a?auto=format&fit=crop&w=1000&q=80'),
(112, 2, 2, 1, 'Green Valley 1BHK Studio Apartment', 'Sunny studio apartment with balcony view, ideal for working professionals and small families.', 'Sector 20', 'Chandigarh', 'Chandigarh', '160020', 650.00, 1, 1, 2, 16000.00, 'Available', 'Rent', 'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=1000&q=80'),
(113, 6, 5, 1, 'Whitefield Techie 3BHK Flat', 'Gated society next to IT corridor with swimming pool, gym, tennis court, and power backup.', 'Prestige Palms, Whitefield', 'Bengaluru', 'Karnataka', '560066', 1700.00, 3, 3, 8, 48000.00, 'Available', 'Rent', 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1000&q=80'),
(114, 8, 8, 2, 'Koregaon Park Green Villa for Rent', 'Scenic private villa with outdoor patio, lawn, and high-end wooden woodwork.', 'Lane 5, Koregaon Park', 'Pune', 'Maharashtra', '411001', 2800.00, 3, 3, 2, 65000.00, 'Available', 'Rent', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=80'),
(115, 9, 9, 6, 'Hitec City Corporate Office Suite', 'Modern 20-seater office space with executive cabin and reception area.', 'Cyber Towers, Hitec City', 'Hyderabad', 'Telangana', '500081', 1800.00, 0, 2, 5, 95000.00, 'Available', 'Rent', 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1000&q=80'),

-- Booked & Sold & Rented Properties for realistic historical records
(116, 1, 1, 1, 'Sector 68 Elite 3BHK Corner Suite', 'Premium apartment with 3-side open balcony and covered parking.', 'Flat 801, Sector 68', 'Mohali', 'Punjab', '160062', 1750.00, 3, 3, 8, 6200000.00, 'Booked', 'Sale', 'https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&w=1000&q=80'),
(117, 3, 3, 3, 'Panchkula Hills Spanish Villa', 'Opulent Spanish styled villa with Italian marble and landscaped courtyard.', 'Villa 12, Sector 2', 'Panchkula', 'Haryana', '134112', 3600.00, 4, 5, 2, 11000000.00, 'Booked', 'Sale', 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=80'),
(118, 2, 2, 1, 'Sector 15 Modern Floor Flat', 'Renovated 3BHK flat near educational hub and market.', 'Floor 2, Sector 15', 'Chandigarh', 'Chandigarh', '160015', 1500.00, 3, 2, 2, 5800000.00, 'Sold', 'Sale', 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80'),
(119, 7, 7, 1, 'Cyber City Premium 4BHK Residency', 'Ultra-luxury high rise apartment next to Cyber Hub.', 'Tower C, Phase 2', 'Gurugram', 'Haryana', '122008', 2900.00, 4, 4, 15, 17500000.00, 'Sold', 'Sale', 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1000&q=80'),
(120, 10, 1, 4, 'Aerocity Residential Plot 250 Sqyd', 'Prime East facing plot ready for construction with all government approvals.', 'Plot 450, Block C, Aerocity', 'Mohali', 'Punjab', '140306', 2250.00, 0, 0, 0, 7500000.00, 'Sold', 'Sale', 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=80'),
(121, 4, 4, 1, 'Andheri West Cozy 2BHK Apartment', 'Sea-facing high rise close to metro station and Lokhandwala.', 'Tower 2, Andheri West', 'Mumbai', 'Maharashtra', '400058', 980.00, 2, 2, 11, 14000000.00, 'Sold', 'Sale', 'https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?auto=format&fit=crop&w=1000&q=80'),
(122, 6, 5, 2, 'Koramangala Serene Duplex Home', 'Independent home with rooftop garden and solar water heater.', '4th Cross, Koramangala', 'Bengaluru', 'Karnataka', '560034', 2100.00, 3, 3, 2, 16000000.00, 'Sold', 'Sale', 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1000&q=80'),
(123, 9, 9, 3, 'Jubilee Hills Royal Retreat Villa', 'Architectural marvel with private swimming pool and deck.', 'Road No 36, Jubilee Hills', 'Hyderabad', 'Telangana', '500033', 4800.00, 5, 6, 2, 26000000.00, 'Sold', 'Sale', 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1000&q=80'),
(124, 1, 1, 1, 'Sector 71 Furnished 3BHK Flat', 'Family flat with modular kitchen, fans, lights, and wardrobes.', 'Block D, Sector 71', 'Mohali', 'Punjab', '160071', 1600.00, 3, 2, 3, 32000.00, 'Rented', 'Rent', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1000&q=80'),
(125, 2, 2, 1, 'Sector 42 Executive Penthouse', 'Top floor penthouse with panoramic city view and open private terrace.', 'Flat 901, Sector 42', 'Chandigarh', 'Chandigarh', '160036', 2200.00, 3, 3, 9, 55000.00, 'Rented', 'Rent', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=80'),

-- Additional diverse properties
(126, 10, 10, 7, 'Mohali Industrial Logistics Warehouse', 'High-ceiling industrial warehouse with 4 loading docks and 3-phase power.', 'Plot 18, Industrial Area Phase 9', 'Mohali', 'Punjab', '160062', 12000.00, 0, 2, 1, 45000000.00, 'Available', 'Sale', 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1000&q=80'),
(127, 8, 8, 4, 'Pune Smart City Residential Plot', 'Corner plot in gated township with clear title and club privileges.', 'Plot 88, Hinjewadi Phase 1', 'Pune', 'Maharashtra', '411057', 1800.00, 0, 0, 0, 4800000.00, 'Available', 'Sale', 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=80'),
(128, 5, 6, 5, 'Connaught Place Premium Retail Showroom', 'High-visibility ground floor retail showroom in Delhi commercial core.', 'Block M, Connaught Place', 'New Delhi', 'Delhi', '110001', 1400.00, 0, 1, 1, 62000000.00, 'Available', 'Sale', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=80'),
(129, 3, 3, 1, 'Panchkula Sector 20 Smart 2BHK', 'Energy efficient apartment with solar hot water and gym.', 'Tower 1, Sector 20', 'Panchkula', 'Haryana', '134117', 1100.00, 2, 2, 4, 3800000.00, 'Available', 'Sale', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1000&q=80'),
(130, 1, 1, 1, 'Sector 66 IT City 3BHK Haven', 'Minutes away from Infosys campus and International Airport.', 'Skyline Tower, Sector 66', 'Mohali', 'Punjab', '160062', 1700.00, 3, 2, 7, 6800000.00, 'Available', 'Sale', 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80');

-- 7. INSERT VISITS (20 Visits)
INSERT INTO visits (visit_id, customer_id, property_id, agent_id, visit_date, visit_time, visit_status, remarks) VALUES
(1, 1, 101, 1, '2026-09-28', '11:00:00', 'Scheduled', 'Customer Mannat Sharma scheduled visit for 3BHK Luxury Apartment in Sector 67.'),
(2, 2, 102, 2, '2026-09-29', '14:30:00', 'Scheduled', 'Wants to inspect garden and swimming pool maintenance.'),
(3, 3, 103, 3, '2026-09-30', '10:00:00', 'Scheduled', 'Interested in family duplex in Sector 6 Panchkula.'),
(4, 4, 107, 7, '2026-09-27', '16:00:00', 'Scheduled', 'Client requested private concierge elevator access.'),
(5, 5, 108, 6, '2026-09-28', '12:00:00', 'Scheduled', 'Evaluating property for embassy lease.'),
(6, 6, 110, 5, '2026-09-25', '11:00:00', 'Completed', 'Tech startup team inspected seating capacity and server room.'),
(7, 7, 109, 4, '2026-09-24', '15:00:00', 'Completed', 'Liked the sea view, discussing parking space allocation.'),
(8, 8, 114, 8, '2026-09-23', '16:30:00', 'Completed', 'Inspected rental villa with family, satisfied with lawn.'),
(9, 9, 115, 9, '2026-09-22', '10:30:00', 'Completed', 'Verified lease agreement terms for corporate office.'),
(10, 10, 104, 1, '2026-09-21', '17:00:00', 'Completed', 'Satisfied with park facing balcony.'),
(11, 11, 105, 10, '2026-09-20', '11:30:00', 'Completed', 'Inspected footfall potential on Airport Road corridor.'),
(12, 12, 106, 2, '2026-09-19', '12:00:00', 'Completed', 'Liked the central Chandigarh location.'),
(13, 13, 111, 1, '2026-09-18', '14:00:00', 'Completed', 'Inspected furnished apartment; requested microwave inclusion.'),
(14, 14, 113, 5, '2026-09-17', '18:00:00', 'Completed', 'Inspected society clubhouse and swimming pool.'),
(15, 15, 112, 2, '2026-09-16', '10:00:00', 'Completed', 'Studio apartment visit finished smoothly.'),
(16, 16, 116, 1, '2026-09-15', '11:00:00', 'Completed', 'Proceeded to token booking after visit.'),
(17, 17, 117, 3, '2026-09-14', '15:00:00', 'Completed', 'Villa inspection finalized with architect.'),
(18, 18, 101, 1, '2026-09-10', '12:00:00', 'Cancelled', 'Client rescheduled due to out of station travel.'),
(19, 19, 102, 2, '2026-09-11', '16:00:00', 'Cancelled', 'Personal emergency at customer end.'),
(20, 20, 103, 3, '2026-09-12', '14:00:00', 'Cancelled', 'Buyer opted for another location.');

-- 8. INSERT BOOKINGS (15 Bookings)
INSERT INTO bookings (booking_id, customer_id, property_id, agent_id, booking_date, booking_amount, booking_status, remarks) VALUES
(1001, 16, 116, 1, '2026-09-15 14:20:00', 500000.00, 'Confirmed', 'Booking for Sector 68 Luxury 3BHK flat.'),
(1002, 17, 117, 3, '2026-09-16 11:45:00', 1000000.00, 'Confirmed', 'Advance token payment for Spanish Villa in Panchkula.'),
(1003, 2, 118, 2, '2026-08-10 10:15:00', 500000.00, 'Completed', 'Booking finalized into complete registered sale.'),
(1004, 5, 119, 7, '2026-08-14 16:30:00', 1500000.00, 'Completed', 'Cyber City 4BHK apartment sale completed.'),
(1005, 10, 120, 1, '2026-08-20 12:00:00', 500000.00, 'Completed', 'Aerocity Plot 250 Sqyd booked and sold.'),
(1006, 7, 121, 4, '2026-08-25 15:10:00', 1000000.00, 'Completed', 'Andheri West flat sale concluded.'),
(1007, 6, 122, 5, '2026-09-01 11:20:00', 1000000.00, 'Completed', 'Koramangala duplex sale concluded.'),
(1008, 9, 123, 9, '2026-09-05 13:40:00', 2000000.00, 'Completed', 'Jubilee Hills royal villa completed.'),
(1009, 1, 124, 1, '2026-09-01 10:00:00', 64000.00, 'Completed', 'Rental agreement first month plus deposit.'),
(1010, 3, 125, 2, '2026-09-02 14:00:00', 110000.00, 'Completed', 'Penthouse rental deposit and advance.'),
(1011, 4, 107, 7, '2026-09-24 17:00:00', 2000000.00, 'Pending', 'Awaiting final mortgage sanction letter from bank.'),
(1012, 8, 108, 6, '2026-09-25 18:30:00', 2500000.00, 'Pending', 'Token submitted, verification of property title underway.'),
(1013, 11, 105, 10, '2026-09-26 12:15:00', 500000.00, 'Pending', 'Commercial shop reservation in Aerocity.'),
(1014, 12, 106, 2, '2026-09-12 11:00:00', 500000.00, 'Cancelled', 'Customer requested loan refund upon family transfer.'),
(1015, 13, 111, 1, '2026-09-14 15:30:00', 28000.00, 'Cancelled', 'Selected closer rental flat to work site.');

-- 9. INSERT PAYMENTS (20 Payments)
INSERT INTO payments (payment_id, booking_id, customer_id, amount, payment_date, payment_method, transaction_id, payment_status) VALUES
(2001, 1001, 16, 500000.00, '2026-09-15 14:25:00', 'UPI', 'TXN20260915001', 'Completed'),
(2002, 1002, 17, 1000000.00, '2026-09-16 11:50:00', 'Bank Transfer', 'TXN20260916002', 'Completed'),
(2003, 1003, 2, 500000.00, '2026-08-10 10:20:00', 'Debit Card', 'TXN20260810003', 'Completed'),
(2004, 1004, 5, 1500000.00, '2026-08-14 16:35:00', 'Bank Transfer', 'TXN20260814004', 'Completed'),
(2005, 1005, 10, 500000.00, '2026-08-20 12:05:00', 'UPI', 'TXN20260820005', 'Completed'),
(2006, 1006, 7, 1000000.00, '2026-08-25 15:15:00', 'Credit Card', 'TXN20260825006', 'Completed'),
(2007, 1007, 6, 1000000.00, '2026-09-01 11:25:00', 'Bank Transfer', 'TXN20260901007', 'Completed'),
(2008, 1008, 9, 2000000.00, '2026-09-05 13:45:00', 'Bank Transfer', 'TXN20260905008', 'Completed'),
(2009, 1009, 1, 64000.00, '2026-09-01 10:05:00', 'UPI', 'TXN20260901009', 'Completed'),
(2010, 1010, 3, 110000.00, '2026-09-02 14:05:00', 'Credit Card', 'TXN20260902010', 'Completed'),
(2011, 1001, 16, 5700000.00, '2026-09-20 16:00:00', 'Bank Transfer', 'TXN20260920011', 'Completed'),
(2012, 1003, 2, 5300000.00, '2026-08-25 11:00:00', 'Bank Transfer', 'TXN20260825012', 'Completed'),
(2013, 1004, 5, 16000000.00, '2026-08-28 12:30:00', 'Bank Transfer', 'TXN20260828013', 'Completed'),
(2014, 1005, 10, 7000000.00, '2026-08-30 15:00:00', 'Bank Transfer', 'TXN20260830014', 'Completed'),
(2015, 1006, 7, 13000000.00, '2026-09-05 17:00:00', 'Bank Transfer', 'TXN20260905015', 'Completed'),
(2016, 1007, 6, 15000000.00, '2026-09-10 14:00:00', 'Bank Transfer', 'TXN20260910016', 'Completed'),
(2017, 1008, 9, 24000000.00, '2026-09-15 16:30:00', 'Bank Transfer', 'TXN20260915017', 'Completed'),
(2018, 1011, 4, 2000000.00, '2026-09-24 17:05:00', 'Credit Card', 'TXN20260924018', 'Pending'),
(2019, 1014, 12, 500000.00, '2026-09-12 11:05:00', 'UPI', 'TXN20260912019', 'Refunded'),
(2020, 1015, 13, 28000.00, '2026-09-14 15:35:00', 'Debit Card', 'TXN20260914020', 'Failed');

-- 10. INSERT SALES (10 Sales)
INSERT INTO sales (sale_id, property_id, customer_id, agent_id, sale_date, sale_price, commission_amount, sale_status) VALUES
(1, 118, 2, 2, '2026-08-25', 5800000.00, 116000.00, 'Completed'),
(2, 119, 5, 7, '2026-08-28', 17500000.00, 385000.00, 'Completed'),
(3, 120, 10, 1, '2026-08-30', 7500000.00, 150000.00, 'Completed'),
(4, 121, 7, 4, '2026-09-05', 14000000.00, 350000.00, 'Completed'),
(5, 122, 6, 5, '2026-09-10', 16000000.00, 320000.00, 'Completed'),
(6, 123, 9, 9, '2026-09-15', 26000000.00, 520000.00, 'Completed'),
(7, 116, 16, 1, '2026-09-20', 6200000.00, 124000.00, 'Completed'),
(8, 104, 11, 1, '2026-07-15', 4100000.00, 82000.00, 'Completed'),
(9, 106, 12, 2, '2026-07-28', 7100000.00, 142000.00, 'Completed'),
(10, 103, 14, 3, '2026-08-05', 8400000.00, 151200.00, 'Completed');

-- 11. INSERT RENTALS (10 Rentals)
INSERT INTO rentals (rental_id, property_id, customer_id, agent_id, start_date, end_date, monthly_rent, security_deposit, rental_status) VALUES
(1, 124, 1, 1, '2026-09-01', '2027-08-31', 32000.00, 64000.00, 'Active'),
(2, 125, 3, 2, '2026-09-01', '2027-08-31', 55000.00, 110000.00, 'Active'),
(3, 111, 13, 1, '2026-06-01', '2027-05-31', 28000.00, 56000.00, 'Active'),
(4, 112, 15, 2, '2026-07-01', '2027-06-30', 16000.00, 32000.00, 'Active'),
(5, 113, 14, 5, '2026-05-01', '2027-04-30', 48000.00, 96000.00, 'Active'),
(6, 114, 8, 8, '2026-08-01', '2027-07-31', 65000.00, 130000.00, 'Active'),
(7, 115, 9, 9, '2026-09-15', '2028-09-14', 95000.00, 285000.00, 'Active'),
(8, 104, 18, 1, '2025-08-01', '2026-07-31', 22000.00, 44000.00, 'Expired'),
(9, 106, 19, 2, '2025-07-01', '2026-06-30', 35000.00, 70000.00, 'Expired'),
(10, 111, 20, 1, '2026-01-01', '2026-08-15', 27000.00, 54000.00, 'Terminated');

-- 12. INSERT REVIEWS (15 Reviews)
INSERT INTO reviews (review_id, customer_id, property_id, rating, comment, review_date) VALUES
(1, 1, 101, 5, 'Visited the site in Mohali Sector 67. The quality of fittings and wide open balconies are exceptional! Highly recommend agent Rahul Sharma.', '2026-09-22 15:30:00'),
(2, 2, 102, 5, 'The heritage villa in Chandigarh Sector 8 is magnificent. True luxury living with top class security and landscape.', '2026-09-20 18:20:00'),
(3, 3, 103, 4, 'Very clean property with stunning hills view. The duplex layout is very family-friendly.', '2026-09-18 11:10:00'),
(4, 4, 107, 5, 'Penthouse is jaw dropping. 360 degree skyline view of Gurugram. Premium finish throughout.', '2026-09-15 16:45:00'),
(5, 5, 108, 4, 'Bungalow in South Extension is well located and spacious. A rare find in New Delhi.', '2026-09-12 14:00:00'),
(6, 6, 110, 5, 'Tech office space is top notch. Fully equipped for our 60+ engineer engineering hub.', '2026-09-14 17:15:00'),
(7, 7, 109, 5, 'Sea-view flat in Bandra is sublime. Agent Sneha Kapoor was very professional and patient.', '2026-09-08 19:30:00'),
(8, 8, 114, 4, 'Peaceful villa in Koregaon Park. The garden and patio are delightful.', '2026-09-04 12:20:00'),
(9, 9, 115, 5, 'Office suite in Cyber Towers is world class. Everything was ready before handover.', '2026-09-10 10:15:00'),
(10, 10, 104, 4, 'Good construction quality and friendly society environment in Mohali Sector 82.', '2026-09-02 16:00:00'),
(11, 16, 116, 5, 'Smooth booking experience and complete clarity on legal documentation. Superb service!', '2026-09-21 11:00:00'),
(12, 17, 117, 5, 'Spanish architecture is truly authentic. Agent Amit Patel handled everything seamlessly.', '2026-09-22 13:45:00'),
(13, 1, 124, 4, 'Rental apartment is comfortable and clean. Landlord is accommodating.', '2026-09-05 14:30:00'),
(14, 3, 125, 5, 'Living in Sector 42 penthouse has been a fantastic experience. View is unmatched.', '2026-09-16 18:00:00'),
(15, 14, 113, 4, 'Society amenities in Bangalore are excellent. Very green and serene premises.', '2026-09-11 15:20:00');

-- 13. INSERT NOTIFICATIONS
INSERT INTO notifications (notification_id, user_id, title, message, is_read) VALUES
(1, 1, 'New Property Listed', '3BHK Luxury Skyline Apartment in Mohali has been submitted and is active.', FALSE),
(2, 2, 'New Visit Scheduled', 'Customer Mannat Sharma scheduled a physical visit for Property #101 on 28 Sep at 11:00 AM.', FALSE),
(3, 12, 'Visit Confirmed', 'Your visit for 3BHK Luxury Skyline Apartment (Sector 67, Mohali) has been scheduled.', FALSE),
(4, 1, 'Payment Received', 'Payment of ₹5,00,000 received for Booking #1001 via UPI (TXN20260915001).', TRUE),
(5, 2, 'Booking Confirmed', 'Booking #1001 for Sector 68 Luxury 3BHK Suite has been confirmed.', TRUE);
