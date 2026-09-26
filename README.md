# REAL ESTATE MANAGEMENT SYSTEM (REMS)
### Complete Professional College DBMS Project
**5th Semester B.Tech in Artificial Intelligence & Data Science**

[![Database: MySQL Community Server](https://img.shields.io/badge/Database-MySQL%20Community%20Server%208.0-blue.svg)](https://mysql.com)
[![Backend: Node.js & Express](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express.js-green.svg)](https://nodejs.org)
[![Frontend: HTML5 / CSS3 / JS](https://img.shields.io/badge/Frontend-HTML5%20%7C%20CSS3%20%7C%20JavaScript-orange.svg)](#)
[![Normalization: 3NF Compliant](https://img.shields.io/badge/Schema-Third%20Normal%20Form%20(3NF)-purple.svg)](#8-database-normalization-proof-1nf-2nf-3nf)
[![License: MIT](https://img.shields.io/badge/License-MIT-lightgrey.svg)](#)

---

## 📑 Table of Contents

1. [Project Introduction](#1-project-introduction)
2. [Problem Statement](#2-problem-statement)
3. [Objectives & Scope](#3-objectives--scope)
4. [Technology Stack](#4-technology-stack)
5. [System Architecture](#5-system-architecture)
6. [User Roles & Access Control Matrix](#6-user-roles--access-control-matrix)
7. [Database Schema & Relational Design](#7-database-schema--relational-design)
8. [Database Normalization Proof (1NF, 2NF, 3NF)](#8-database-normalization-proof-1nf-2nf-3nf)
9. [Advanced DBMS Concepts Implemented](#9-advanced-dbms-concepts-implemented)
   - [ACID Transactions & Row-Level Locking](#acid-transactions--row-level-locking)
   - [Database Triggers](#database-triggers)
   - [Stored Procedures](#stored-procedures)
   - [Database Views](#database-views)
10. [Collection of 32 Important SQL Queries](#10-collection-of-32-important-sql-queries)
11. [Complete End-to-End Presentation Workflow (The Mannat Sharma Scenario)](#11-complete-end-to-end-presentation-workflow)
12. [Project Directory Structure](#12-project-directory-structure)
13. [Installation & Setup Instructions](#13-installation--setup-instructions)
14. [Default Test Credentials](#14-default-test-credentials)
15. [Interactive DBMS SQL Console Feature](#15-interactive-dbms-sql-console-feature)
16. [College Viva & Evaluator FAQ Guide](#16-college-viva--evaluator-faq-guide)
17. [Conclusion & Future Scope](#17-conclusion--future-scope)

---

## 1. Project Introduction

The **Real Estate Management System (REMS)** is an enterprise-grade relational database application engineered as a capstone project for the **5th Semester B.Tech AI & Data Science** course in Database Management Systems (DBMS).

Moving far beyond basic CRUD prototypes, REMS demonstrates core relational database theory, mathematical normalization, referential integrity, automated trigger cascades, concurrency control via transactions, and stored routines. The system models a multi-stakeholder real estate portal where **Customers** browse verified residential and commercial properties, schedule physical tours, and lock reservations; **Agents** manage assigned properties and earn sales commissions; **Owners** list their properties; and **Administrators** audit financial transactions and evaluate analytical reports.

---

## 2. Problem Statement

Conventional real estate management in traditional portals often suffers from:
1. **Concurrency Anomalies (Double-Booking):** Two clients booking the same property simultaneously, resulting in inconsistent states.
2. **Redundant & Denormalized Data:** Property details, owners, and agents duplicated across tables causing update and deletion anomalies.
3. **Lack of Referential Integrity:** Manual status updates leading to sold or rented properties remaining visible as available.
4. **Poor Audit Trails:** Fragmented tracking of advance tokens, refund disbursements, and commission calculations.

REMS eliminates these deficiencies by leveraging an **InnoDB transactional engine** with row-level locks, delimited validation triggers, 3NF-normalized tables, and automated database views.

---

## 3. Objectives & Scope

### Objectives:
* Design a relational database schema normalized to **Third Normal Form (3NF)**.
* Guarantee ACID properties (Atomicity, Consistency, Isolation, Durability) for financial reservations using `START TRANSACTION`, `COMMIT`, and `ROLLBACK`.
* Implement declarative database constraints (`PRIMARY KEY`, `FOREIGN KEY`, `NOT NULL`, `UNIQUE`, `CHECK`, and `DEFAULT`).
* Develop active database triggers that update property status automatically upon booking confirmation (`Booked`), sale completion (`Sold`), and rental lease creation (`Rented`).
* Implement stored procedures for multi-parameter search and sales deed recording.
* Provide 12 specialized analytical reports and 32 pre-defined SQL queries for presentation evaluation.

### Scope:
* Covers residential (Apartment, House, Villa) and commercial (Plot, Shop, Office, Warehouse) properties across metropolitan Indian cities (Mohali, Chandigarh, Panchkula, Delhi, Gurugram, Bengaluru, Mumbai, Pune, Hyderabad).
* Role-based dashboards for **Admin**, **Agent**, and **Customer**.

---

## 4. Technology Stack

| Layer | Technologies Used | Description |
| :--- | :--- | :--- |
| **Frontend** | HTML5, CSS3, JavaScript (ES6+), Canvas 3D | Awwwards/FWA-inspired UI, custom cursor interpolation, magnetic buttons, responsive design, dark/light theme, and Chart.js. |
| **Backend** | Node.js (v24 LTS), Express.js (v4.19) | RESTful APIs, JWT session tokens, Bcrypt password hashing, and MySQL connection pooling. |
| **Database** | Oracle MySQL Community Server 8.0 (InnoDB Engine) | 12 related tables (3NF), views, stored procedures, triggers, and transactions. Strictly MySQL, compatible with MySQL Workbench. |
| **Security** | Bcrypt (10 rounds), JWT, Parameterized SQL | Protection against SQL Injection, credential leakage, and unauthorized role elevation. |

---

## 5. System Architecture

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        CLIENT / USER TIER                              │
│                                                                        │
│   Public Website          Customer Dashboard        Agent Workspace    │
│   (Home, Search, Details) (Visits, Bookings, Pay)  (Wizard, Comm.)     │
│                             👑 Admin Central                           │
│                      (KPIs, 12 Reports, SQL Console)                   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │  HTTP / REST (JSON) + JWT
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       APPLICATION SERVER TIER                          │
│                                                                        │
│     Express.js Router ───────► Authentication & Role Middleware        │
│                                      │                                 │
│     Controllers & Business Logic ────┴───────► Error Handler           │
│     (Bookings, Visits, Properties, Reports, SQL Runner)                │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │  mysql2/promise Pool (Port 3306)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                         DATABASE TIER (MySQL)                          │
│                                                                        │
│  ┌───────────────────────┐  ┌───────────────────────┐  ┌────────────┐  │
│  │ 12 Relational Tables  │  │ Automated Triggers     │  │ Views &    │  │
│  │ (3NF Normalized,      │  │ (Status cascades,     │  │ Procedures │  │
│  │  PK/FK Constraints)   │  │  Rating validations)  │  │ (Search,   │  │
│  └───────────────────────┘  └───────────────────────┘  │  Ledgers)  │  │
│                                                        └────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 6. User Roles & Access Control Matrix

| Feature / Operation | Public | Customer | Agent | Admin |
| :--- | :---: | :---: | :---: | :---: |
| Browse & Filter Properties | ✓ | ✓ | ✓ | ✓ |
| View Property Details & Gallery | ✓ | ✓ | ✓ | ✓ |
| Customer Registration & Login | ✓ | ✓ | ✓ | ✓ |
| Schedule Physical Site Visit | ✕ | ✓ | ✕ | ✕ |
| View Personal Visits & Timeline | ✕ | ✓ | ✕ | ✕ |
| Atomic Property Booking & Payment | ✕ | ✓ | ✕ | ✕ |
| View Personal Bookings & Receipts | ✕ | ✓ | ✕ | ✕ |
| Write Ratings & Reviews | ✕ | ✓ | ✕ | ✕ |
| Add Property (Multi-Step Wizard) | ✕ | ✕ | ✓ | ✓ |
| Accept / Complete / Cancel Visits | ✕ | ✕ | ✓ | ✓ |
| Finalize Sale & Earn Commission | ✕ | ✕ | ✓ | ✓ |
| View Commission Earnings Ledger | ✕ | ✕ | ✓ | ✓ |
| System Executive KPI Dashboard | ✕ | ✕ | ✕ | ✓ |
| Manage All Users, Owners & Agents | ✕ | ✕ | ✕ | ✓ |
| Delete Properties & Reviews | ✕ | ✕ | ✕ | ✓ |
| View All 12 Analytical DBMS Reports | ✕ | ✕ | ✕ | ✓ |
| Interactive DBMS SQL Console | ✕ | ✕ | ✕ | ✓ |

---

## 7. Database Schema & Relational Design

The database `real_estate_db` consists of **12 core relational entities** plus a notifications table:

1. **`users`**: Base credentials and role dispatch (`Admin`, `Agent`, `Customer`, `Owner`).
2. **`owners`**: Property owners (Landlords and sellers).
3. **`agents`**: Licensed agents with experience and commission percentages.
4. **`customers`**: Registered buyers and tenants.
5. **`property_types`**: Master category table (`Apartment`, `House`, `Villa`, `Plot`, `Shop`, `Office`, `Warehouse`).
6. **`properties`**: Property records with physical specs, pricing, coordinates, and statuses (`Available`, `Booked`, `Sold`, `Rented`).
7. **`visits`**: Client physical site tour appointments.
8. **`bookings`**: Atomic reservations with advance token deposit amount.
9. **`payments`**: Payment transactions with unique transaction ID (`TXN...`).
10. **`sales`**: Completed property deeds with calculated agent commissions.
11. **`rentals`**: Active and expired lease contracts.
12. **`reviews`**: Ratings (1 to 5) and customer feedback.
13. **`notifications`**: Activity feed alerts.

---

## 8. Database Normalization Proof (1NF, 2NF, 3NF)

A core requirement of an academic DBMS project is proving normalization:

### First Normal Form (1NF)
* **Rule:** A relation is in 1NF if all attributes contain only **atomic (indivisible)** values, every record is unique (enforced by a Primary Key), and there are no repeating groups.
* **Proof in REMS:**
  - In `properties`, composite addresses are decoupled into distinct atomic columns: `address`, `city`, `state`, and `pincode`.
  - Amenities and multiple images are not stored as comma-separated strings inside a column.
  - Every table has a clearly defined integer surrogate `PRIMARY KEY` (`property_id`, `user_id`, `customer_id`, etc.).

### Second Normal Form (2NF)
* **Rule:** A relation is in 2NF if it is in 1NF and **no non-prime attribute is partially dependent on any candidate key** (no partial functional dependency).
* **Proof in REMS:**
  - All tables in REMS utilize single-attribute primary keys (`property_id`, `booking_id`, `sale_id`).
  - By definition, partial functional dependency can only occur when a relation has a composite primary key. Because every primary key in REMS is a single atomic attribute, **partial dependency is mathematically impossible**.
  - All non-key attributes depend entirely on the whole key.

### Third Normal Form (3NF)
* **Rule:** A relation is in 3NF if it is in 2NF and **no non-prime attribute is transitively dependent on the primary key** (i.e., for every functional dependency $X \rightarrow Y$, either $X$ is a superkey or $Y$ is a prime attribute).
* **Proof in REMS:**
  - In `properties`: The property type description is not stored in the `properties` table. Storing `type_description` alongside `property_type_id` would introduce a transitive dependency:
    $$\text{property\_id} \rightarrow \text{property\_type\_id} \rightarrow \text{type\_description}$$
    Instead, property types are isolated in their own master entity `property_types(property_type_id, type_name, description)`, ensuring `properties` only holds the foreign key `property_type_id`.
  - Similarly, agent commission rates and owner phone numbers are not stored in `properties`. They reside strictly in `agents` and `owners`.
  - In `payments`: Customer and booking details are referenced via foreign keys (`booking_id`, `customer_id`) rather than storing duplicate customer names or addresses.
  - Therefore, **the schema strictly satisfies Third Normal Form (3NF)** without data redundancy or transitive anomalies.

---

## 9. Advanced DBMS Concepts Implemented

### ACID Transactions & Row-Level Locking
During property booking, race conditions (double-booking) are prevented using a database transaction with exclusive row-level locking:

```sql
START TRANSACTION;

-- Lock property row exclusively against concurrent reads/writes
SELECT property_status INTO current_status 
FROM properties 
WHERE property_id = p_property_id 
FOR UPDATE;

-- Verify property is still Available
IF current_status <> 'Available' THEN
    ROLLBACK;
    -- Return error to second customer
END IF;

-- Step 1: Insert booking record
INSERT INTO bookings (...) VALUES (...);

-- Step 2: Insert payment record
INSERT INTO payments (...) VALUES (...);

-- Step 3: Update status
UPDATE properties SET property_status = 'Booked' WHERE property_id = p_property_id;

COMMIT;
```

### Database Triggers
The schema includes 5 active triggers located in `database/triggers.sql`:
1. **`trg_after_booking_update`**: Automatically updates property status to `Booked` when a booking status changes to `Confirmed`. Reverts to `Available` if cancelled.
2. **`trg_before_booking_insert`**: Prevents booking insertions if property status is not `Available` or `Reserved`.
3. **`trg_after_sale_insert`**: Automatically sets property status to `Sold` upon insertion into `sales`.
4. **`trg_after_rental_insert`**: Automatically sets property status to `Rented` upon insertion of an active rental lease.
5. **`trg_before_review_insert`**: Validates rating constraints ($1 \le \text{rating} \le 5$).

### Stored Procedures
Defined in `database/procedures.sql`:
* `SearchAvailableProperties`: Multi-parameter search routine filtering by city, type, budget, and bedrooms.
* `GetCustomerBookings`: Retrieves booking history with joined property, agent, and payment data.
* `GetAgentSales`: Calculates agent volume and sales transactions.
* `ProcessPropertyBooking`: Transactional booking procedure demonstrating `START TRANSACTION`, `COMMIT`, `ROLLBACK`, and error handling handlers.
* `RecordPropertySale`: Computes agent commission dynamically based on agent's rate and records the sale.

### Database Views
Defined in `database/views.sql`:
* `Available_Properties`: Aggregated view joining properties, types, owners, agents, and computed average ratings.
* `Sold_Properties`: Ledger of closed sales with customer and agent names.
* `Rented_Properties`: Active tenancy agreements with monthly rents and deposit figures.
* `Customer_Booking_History`: Comprehensive transaction history.
* `Agent_Performance`: Analytical view calculating total sales volume and commission earned per agent.
* `City_Wise_Property_Stats`: Aggregations of average, min, and max price by city.

---

## 10. Collection of 32 Important SQL Queries

All 32 queries are contained in `database/queries.sql` and can be executed live inside the **Admin Interactive SQL Console**:

1. **Available Properties:** `SELECT * FROM properties WHERE property_status = 'Available';`
2. **Properties in Mohali:** `SELECT * FROM properties WHERE city = 'Mohali';`
3. **Budget Filter (≤ ₹70 Lakh):** `SELECT * FROM properties WHERE price <= 7000000.00;`
4. **3 BHK Properties:** `SELECT * FROM properties WHERE bedrooms = 3;`
5. **Sort by Price ASC:** `SELECT * FROM properties ORDER BY price ASC;`
6. **Properties Grouped by City:** `SELECT city, COUNT(property_id) FROM properties GROUP BY city;`
7. **Average Sale Price:** `SELECT ROUND(AVG(price), 2) FROM properties WHERE listing_type = 'Sale';`
8. **Maximum Property Price:** `SELECT MAX(price) FROM properties;`
9. **Minimum Property Price:** `SELECT MIN(price) FROM properties WHERE listing_type = 'Sale';`
10. **Customer Booking History (INNER JOIN):** Joins `bookings`, `customers`, and `properties`.
11. **Property Owner Details:** Joins `properties` with `owners`.
12. **Assigned Agent Details:** Joins `properties` with `agents`.
13. **Customers with Confirmed Bookings (Subquery IN):** Subquery filtering active clients.
14. **Unbooked Properties (LEFT JOIN / IS NULL):** Identifies properties never booked.
15. **Above Average Priced Properties (Subquery Comparison):** `WHERE price > (SELECT AVG(price) FROM properties)`.
16. **Total Sales Volume (Aggregate SUM):** `SELECT SUM(sale_price) FROM sales;`
17. **Total Revenue Collected (Aggregate SUM):** `SELECT SUM(amount) FROM payments WHERE payment_status = 'Completed';`
18. **Total Agent Commission Paid:** `SELECT SUM(commission_amount) FROM sales;`
19. **Top Performing Agents:** Grouping by agent with total volume and commission.
20. **Customers with Completed Payments:** Distinct customers with settled transactions.
21. **Upcoming Physical Site Visits:** Filtered by `visit_status = 'Scheduled'`.
22. **Cancelled Visits with Remarks:** Audit log of cancelled appointments.
23. **Pending Payments:** Unsettled transactions requiring follow-up.
24. **Highly Rated Properties (GROUP BY & HAVING):** `HAVING AVG(rating) >= 4.5`.
25. **Most Reviewed Properties:** Ranked by review count.
26. **Affordable Rentals (< ₹50,000/mo):** Filtered available rental units.
27. **Sales Listings by Type:** Aggregates min, max, and avg price per category.
28. **Monthly Sales Trend:** Date-formatted breakdown by year and month.
29. **City-Wise Revenue:** Total volume sold per city.
30. **Customer Spending Ledger:** Total amount spent per customer.
31. **Comprehensive 5-Table Join:** Joins `bookings`, `customers`, `properties`, `property_types`, and `payments`.
32. **Correlated Subquery:** Agents earning above average commission rates.

---

## 11. Complete End-to-End Presentation Workflow

### The Mannat Sharma Demonstration Scenario (20 Steps)

During presentation or viva, demonstrate this exact workflow:

1. **Step 1 — Registration:** Open `/register.html`. Register a new Customer named `Mannat Sharma` (email: `mannat@example.com`, phone: `+91 98111 22001`, password: `password123`, address: `Phase 7, Mohali`).
2. **Step 2 — Authentication:** Log in as Mannat Sharma. System identifies role as `Customer` and redirects to `/customer/index.html`.
3. **Step 3 — Search Properties:** Click "Properties" or use Hero Search. Enter:
   - Location: `Mohali`
   - Category: `Apartment`
   - Bedrooms: `3 BHK`
   - Max Budget: `₹70 Lakh`
4. **Step 4 — Search Results:** System queries MySQL and displays `3BHK Luxury Skyline Apartment` (Sector 67, Mohali) priced at **₹65 Lakh**, status: **Available**.
5. **Step 5 — View Details:** Open property details (`/property-details.html?id=101`). Inspect specs, gallery, and assigned agent (Rahul Sharma).
6. **Step 6 — Schedule Visit:** Click "Schedule Physical Visit". Select date (e.g., `28 Sep 2026`) and time (`11:00 AM`). Click "Confirm Appointment".
7. **Step 7 — Visit Notification:** A visit record is inserted into `visits` table with status `Scheduled`. In-app notification sent to Agent Rahul Sharma.
8. **Step 8 — Agent Confirms Visit:** Log in as Agent Rahul Sharma (`rahul.agent@rems.com`). Go to "Property Visits", view the appointment, and click "Complete".
9. **Step 9 — Customer Proceeds to Book:** Mannat logs in again and clicks "⚡ Book Property Now".
10. **Step 10 — Transaction Begins:** Backend executes `START TRANSACTION` and acquires row-level lock on Property #101.
11. **Step 11 — Availability Verification:** System validates that Property #101 is still `Available`.
12. **Step 12 — Booking Created:** Booking record #B1001 inserted with token deposit amount **₹5,00,000**.
13. **Step 13 — Simulated UPI Payment:** Mannat selects "UPI (GPay / PhonePe)" and clicks "Proceed to Pay".
14. **Step 14 — Payment Confirmed:** System generates unique transaction reference `TXN20260926B1001...` and inserts into `payments` table with status `Completed`.
15. **Step 15 — Property Status Trigger:** Database transaction updates Property #101 status from `Available` to `Booked`.
16. **Step 16 — COMMIT:** Database transaction commits atomically. Instant receipt displayed with Booking ID and Transaction ID.
17. **Step 17 — Double-Booking Prevention Verification:** Try booking Property #101 again with a different customer. The system blocks it with: *"Sorry, this property has already been booked."*
18. **Step 18 — Finalizing the Sale:** Agent Rahul Sharma opens his dashboard, navigates to "Bookings & Finalize", and clicks "Finalize Sale".
19. **Step 19 — Commission Credited:** System inserts a sale record into `sales` table, sets property status to `Sold`, and calculates commission:
    $$\text{Commission} = \text{₹}65,00,000 \times 2\% = \text{₹}1,30,000$$
20. **Step 20 — Customer Review:** Mannat opens the property page, clicks "Write a Review", awards 5 stars, and submits feedback!

---

## 12. Project Directory Structure

```text
d:\dbms\
├── package.json               # Express, mysql2, bcryptjs, jsonwebtoken dependencies
├── .env                       # Database connection parameters & server port
├── start_mysql.bat            # 1-click batch script to launch pre-bundled MySQL server
├── stop_mysql.bat             # 1-click batch script to stop MySQL server
├── mysql_cli.bat              # Instant interactive terminal access to MySQL CLI
├── ER_DIAGRAM.md              # Complete Mermaid diagram & relational schema
├── README.md                  # Comprehensive academic report & documentation
│
├── database/
│   ├── schema.sql             # 12 relational tables, PKs, FKs, CHECK constraints, indexes
│   ├── views.sql              # 6 database views (Available, Sold, Rented, Performance, etc.)
│   ├── triggers.sql           # 5 triggers (Status transitions, double-booking prevention)
│   ├── procedures.sql         # 5 stored procedures (Search, bookings, transactions)
│   ├── sample_data.sql        # Realistic seed data (10 owners, 10 agents, 20 customers, 30 properties)
│   ├── queries.sql            # 32 core SQL queries demonstrating all relational concepts
│   └── init_db.js             # Automated database creation and verification script
│
├── backend/
│   ├── server.js              # Express app setup, CORS, static hosting, API routing
│   ├── config/
│   │   └── db.js              # MySQL connection pool (mysql2/promise)
│   ├── middleware/
│   │   ├── auth.js            # JWT verification & role authorization (Admin, Agent, Customer)
│   │   └── errorHandler.js    # Custom MySQL error code & trigger signal parser
│   └── routes/
│       ├── authRoutes.js      # Register, login, me, notifications
│       ├── propertyRoutes.js  # Search, filter, details, add, edit, delete
│       ├── visitRoutes.js     # Scheduling and status updates
│       ├── bookingRoutes.js   # Atomic booking transaction & sale completion
│       ├── paymentRoutes.js   # Payment history and summary
│       ├── saleRoutes.js      # Sales ledger & agent commission
│       ├── rentalRoutes.js    # Lease agreements
│       ├── reviewRoutes.js    # Ratings & moderation
│       ├── adminRoutes.js     # System KPI telemetry, charts, entity management
│       ├── agentRoutes.js     # Agent dashboard, property wizard, sales
│       ├── customerRoutes.js  # Customer dashboard, timeline, spending
│       ├── reportRoutes.js    # 12 analytical reports endpoints
│       └── sqlQueryRoutes.js  # SQL query catalog & execution engine
│
└── frontend/
    ├── index.html             # Cinematic Home page with 3D canvas & featured properties
    ├── properties.html        # Search & filter page with live debounced filters
    ├── property-details.html  # Full details, gallery, visit modal, booking/payment modal
    ├── login.html             # Sign in with 1-click demo accounts
    ├── register.html          # Customer registration
    ├── about.html             # Academic project overview
    ├── contact.html           # Advisory contact form
    ├── customer/
    │   └── index.html         # Customer dashboard (Overview, Bookings, Visits timeline, Payments)
    ├── agent/
    │   └── index.html         # Agent workspace (Properties, 5-Step Wizard, Bookings, Commission)
    ├── admin/
    │   └── index.html         # Admin central (KPIs, Charts, 12 Reports, DBMS SQL Console)
    ├── css/
    │   ├── style.css          # Design system, custom cursor, 3D tilt, dark/light theme
    │   └── dashboard.css      # SaaS layout, KPI cards, tables, wizard, SQL console
    └── js/
        ├── api.js             # API client, tokens, toast notifications, currency formatters
        ├── main.js            # Custom cursor, 3D architectural canvas, counters, magnetic buttons
        ├── auth.js            # Login, registration, role dispatch
        ├── properties.js      # Live filter state, debouncing, pagination
        ├── property-details.js# Booking transaction flow, visits, reviews
        ├── customer.js        # Customer dashboard controller
        ├── agent.js           # Agent workspace controller & 5-step wizard
        └── admin.js           # Admin analytics, Chart.js, reports, and SQL console
```

---

## 13. Installation & Setup Instructions

### Prerequisites
* **Node.js:** v18 or higher (tested on Node v24.11 LTS).
* **MySQL:** Oracle MySQL Community Server 8.0 is pre-configured and included in the project directory (`mysql-8.0.46-winx64`), so **no manual installation is needed**! Simply run `start_mysql.bat`. It listens on `localhost:3306` with standard MySQL syntax and is 100% compatible with MySQL Workbench.

### Step 1: Start MySQL Database
Double-click `start_mysql.bat` in the root folder, or run:
```powershell
.\start_mysql.bat
```
The MySQL server will start listening on `localhost:3306`.

### Step 2: Initialize Database & Seed Realistic Data
In your terminal, run:
```powershell
npm run db:init
```
This script automatically:
1. Connects to MySQL on port 3306.
2. Drops and recreates `real_estate_db`.
3. Executes `schema.sql` (12 relational tables + constraints).
4. Executes `views.sql` (6 analytical views).
5. Executes `sample_data.sql` (pre-loaded with 10 owners, 10 agents, 20 customers, 30 properties, visits, bookings, payments, and sales).
6. Attaches `triggers.sql` and `procedures.sql`.
7. Verifies table record counts and confirms success!

### Step 3: Start the Backend & Web Application
Run:
```powershell
npm start
```
The server will start on **`http://localhost:5000`**.

Open your browser and navigate to:
* **Public Website:** `http://localhost:5000`
* **Properties Search:** `http://localhost:5000/properties.html`
* **Customer Dashboard:** `http://localhost:5000/customer/index.html`
* **Agent Workspace:** `http://localhost:5000/agent/index.html`
* **Admin Central:** `http://localhost:5000/admin/index.html`

---

## 14. Default Test Credentials

For quick evaluation during college presentations, use the **1-Click Demo Profiles** on the login page (`/login.html`) or the following credentials:

| Role | Email | Password | Primary Key ID | Features Available |
| :--- | :--- | :--- | :---: | :--- |
| **Admin** | `admin@rems.com` | `admin123` | `user_id: 1` | Full system control, 12 reports, SQL console, user management |
| **Agent** | `rahul.agent@rems.com` | `password123` | `agent_id: 1` | Managed properties, 5-step wizard, visits, commission ledger |
| **Customer** | `mannat@example.com` | `password123` | `customer_id: 1` | Bookings, physical visits timeline, payment receipts |
| **Owner** | `harbhajan.owner@rems.com`| `password123` | `owner_id: 1` | Property ownership registration |

---

## 15. Interactive DBMS SQL Console Feature

Inside the **Admin Dashboard** (`/admin/index.html` -> **Interactive SQL Console** tab), evaluators can:
1. Select any of the **32 demonstration SQL queries** from the catalog dropdown.
2. View the formatted SQL syntax.
3. Click **"Execute SQL Query"** to execute it live against the MySQL database.
4. View the query execution time in milliseconds (e.g., `⏱ Execution Time: 2.1ms`).
5. Inspect the dynamic HTML result table rendered directly from the database response.
6. Type custom read-only `SELECT` queries to test custom DBMS concepts during viva!

---

## 16. College Viva & Evaluator FAQ Guide

### Q1: Why did you choose MySQL over SQLite?
> **Answer:** Real estate applications require concurrent access by multiple customers, agents, and administrators. SQLite uses database-level locking during writes, which causes write contention and lacks robust support for stored procedures, user permissions, and multi-client connection pools. MySQL's **InnoDB engine** provides ACID compliance, row-level locking (`SELECT ... FOR UPDATE`), referential foreign key constraints with `ON UPDATE CASCADE`, and triggers.

### Q2: How did you prevent double-booking when two users try to book the same property?
> **Answer:** We implemented a database transaction using `START TRANSACTION` and row-level locking with `SELECT property_status FROM properties WHERE property_id = ? FOR UPDATE`. This locks the specific property record until the transaction commits or rolls back. The transaction re-checks that `property_status = 'Available'`. The second customer's transaction encounters a locked row and, once unlocked, reads `property_status = 'Booked'`, causing an automatic `ROLLBACK` and a descriptive conflict response.

### Q3: How do triggers contribute to business logic in REMS?
> **Answer:** Triggers enforce referential state synchronization automatically at the database level regardless of which API or client initiates the change:
> - `trg_after_booking_update`: When a booking is confirmed, property status automatically becomes `Booked`.
> - `trg_after_sale_insert`: When a sale record is created, property status changes to `Sold`.
> - `trg_after_rental_insert`: Changes status to `Rented`.
> - `trg_before_booking_insert`: Prevents booking non-available properties.

### Q4: Prove that your database is in 3NF.
> **Answer:** 
> 1. **1NF:** All attributes are atomic (addresses decoupled into address, city, state, pincode; no multi-valued attributes; primary keys on all tables).
> 2. **2NF:** Every table uses a single-column surrogate primary key, so partial functional dependency is mathematically impossible.
> 3. **3NF:** All transitive dependencies have been decoupled into separate master tables. For instance, property categories are in `property_types` rather than repeating type descriptions inside `properties`. Agent commission rates reside in `agents`, not `properties`.

---

## 17. Conclusion & Future Scope

The **Real Estate Management System (REMS)** successfully bridges theoretical database design and modern full-stack web engineering. It demonstrates relational schema design, 3NF normalization, ACID transaction boundaries, triggers, views, and stored procedures in a working real-world application.

### Future Enhancements:
* Integration of real-time WebSocket notifications for instant agent-client chat.
* Integration of Razorpay/Stripe production payment gateway webhooks.
* Automated GIS geospatial mapping and map-based radius property searches.
* Machine Learning price recommendation models predicting property valuation based on sqft, bedrooms, and location.

---

**Developed for:** 5th Semester B.Tech AI & Data Science DBMS Examination & Project Viva.  
**Compatible with:** Oracle MySQL Community Server 8.0, MySQL Workbench, Node.js 18+.
