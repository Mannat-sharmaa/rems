# REAL ESTATE MANAGEMENT SYSTEM (REMS)
## Entity-Relationship (ER) Diagram & Relational Schema Documentation
**5th Semester B.Tech AI & Data Science — DBMS Project**

---

## 1. Visual Mermaid ER Diagram

```mermaid
erDiagram
    USERS ||--o| CUSTOMERS : "extends"
    USERS ||--o| AGENTS : "extends"
    USERS ||--o| OWNERS : "extends"
    USERS ||--o{ NOTIFICATIONS : "receives"

    OWNERS ||--o{ PROPERTIES : "owns (1:N)"
    AGENTS ||--o{ PROPERTIES : "manages (1:N)"
    PROPERTY_TYPES ||--o{ PROPERTIES : "categorizes (1:N)"

    CUSTOMERS ||--o{ VISITS : "schedules (1:N)"
    PROPERTIES ||--o{ VISITS : "inspected_in (1:N)"
    AGENTS ||--o{ VISITS : "hosts (1:N)"

    CUSTOMERS ||--o{ BOOKINGS : "places (1:N)"
    PROPERTIES ||--o{ BOOKINGS : "reserved_in (1:N)"
    AGENTS ||--o{ BOOKINGS : "brokers (1:N)"

    BOOKINGS ||--|| PAYMENTS : "settles (1:1)"
    CUSTOMERS ||--o{ PAYMENTS : "pays (1:N)"

    PROPERTIES ||--o| SALES : "sold_as (1:1)"
    CUSTOMERS ||--o{ SALES : "buys (1:N)"
    AGENTS ||--o{ SALES : "earns_commission (1:N)"

    PROPERTIES ||--o{ RENTALS : "leased_as (1:N)"
    CUSTOMERS ||--o{ RENTALS : "rents (1:N)"
    AGENTS ||--o{ RENTALS : "manages_lease (1:N)"

    CUSTOMERS ||--o{ REVIEWS : "writes (1:N)"
    PROPERTIES ||--o{ REVIEWS : "rated_in (1:N)"

    USERS {
        int user_id PK "Auto Increment"
        string name "Full Name"
        string email UK "Unique Email"
        string phone UK "Unique Mobile"
        string password "Bcrypt Hash"
        enum role "Admin | Agent | Customer | Owner"
        text address
        timestamp created_at
    }

    OWNERS {
        int owner_id PK
        int user_id FK "References USERS(user_id)"
        string name
        string email
        string phone
        text address
        timestamp created_at
    }

    AGENTS {
        int agent_id PK
        int user_id FK "References USERS(user_id)"
        string name
        string email
        string phone
        int experience "Years in industry"
        decimal commission_rate "e.g. 2.00%"
        text address
        timestamp created_at
    }

    CUSTOMERS {
        int customer_id PK
        int user_id FK "References USERS(user_id)"
        string name
        string email
        string phone
        text address
        timestamp created_at
    }

    PROPERTY_TYPES {
        int property_type_id PK
        string type_name UK "Apartment | Villa | House | Plot..."
        text description
    }

    PROPERTIES {
        int property_id PK
        int owner_id FK "References OWNERS(owner_id)"
        int agent_id FK "References AGENTS(agent_id)"
        int property_type_id FK "References PROPERTY_TYPES(property_type_id)"
        string title
        text description
        string address
        string city
        string state
        string pincode
        decimal area_sqft
        int bedrooms
        int bathrooms
        int floor_number
        decimal price "Total Price (INR)"
        enum property_status "Available | Booked | Sold | Rented"
        enum listing_type "Sale | Rent"
        string image_url
        timestamp created_at
    }

    VISITS {
        int visit_id PK
        int customer_id FK "References CUSTOMERS(customer_id)"
        int property_id FK "References PROPERTIES(property_id)"
        int agent_id FK "References AGENTS(agent_id)"
        date visit_date
        time visit_time
        enum visit_status "Scheduled | Completed | Cancelled"
        text remarks
        timestamp created_at
    }

    BOOKINGS {
        int booking_id PK
        int customer_id FK "References CUSTOMERS(customer_id)"
        int property_id FK "References PROPERTIES(property_id)"
        int agent_id FK "References AGENTS(agent_id)"
        timestamp booking_date
        decimal booking_amount "Token deposit"
        enum booking_status "Pending | Confirmed | Cancelled | Completed"
        text remarks
    }

    PAYMENTS {
        int payment_id PK
        int booking_id FK "References BOOKINGS(booking_id)"
        int customer_id FK "References CUSTOMERS(customer_id)"
        decimal amount
        timestamp payment_date
        enum payment_method "UPI | Credit Card | Debit Card | Bank Transfer"
        string transaction_id UK "Unique Reference"
        enum payment_status "Pending | Completed | Failed | Refunded"
    }

    SALES {
        int sale_id PK
        int property_id FK "References PROPERTIES(property_id)"
        int customer_id FK "References CUSTOMERS(customer_id)"
        int agent_id FK "References AGENTS(agent_id)"
        date sale_date
        decimal sale_price
        decimal commission_amount "Calculated rate"
        enum sale_status "Completed | Pending | Cancelled"
    }

    RENTALS {
        int rental_id PK
        int property_id FK "References PROPERTIES(property_id)"
        int customer_id FK "References CUSTOMERS(customer_id)"
        int agent_id FK "References AGENTS(agent_id)"
        date start_date
        date end_date
        decimal monthly_rent
        decimal security_deposit
        enum rental_status "Active | Expired | Terminated"
    }

    REVIEWS {
        int review_id PK
        int customer_id FK "References CUSTOMERS(customer_id)"
        int property_id FK "References PROPERTIES(property_id)"
        int rating "CHECK 1 to 5"
        text comment
        timestamp review_date
    }

    NOTIFICATIONS {
        int notification_id PK
        int user_id FK "References USERS(user_id)"
        string title
        text message
        boolean is_read
        timestamp created_at
    }
```

---

## 2. Cardinality & Relationship Breakdown

| Entity 1 | Cardinality | Entity 2 | Explanation |
| :--- | :---: | :--- | :--- |
| **Users** | `1 : 0..1` | **Customers** | A user with role 'Customer' has exactly one customer profile. |
| **Users** | `1 : 0..1` | **Agents** | A user with role 'Agent' has exactly one professional agent record. |
| **Users** | `1 : 0..1` | **Owners** | A user with role 'Owner' has exactly one owner record. |
| **Owners** | `1 : N` | **Properties** | One property owner can register and list multiple properties. |
| **Agents** | `1 : N` | **Properties** | One certified agent manages multiple assigned property listings. |
| **Property_Types** | `1 : N` | **Properties** | A property type (Apartment, Villa, etc.) categorizes many properties. |
| **Customers** | `1 : N` | **Visits** | A customer can schedule multiple site inspection appointments. |
| **Properties** | `1 : N` | **Visits** | A property can be visited by multiple prospective buyers across dates. |
| **Agents** | `1 : N` | **Visits** | An agent conducts physical site visits for interested clients. |
| **Customers** | `1 : N` | **Bookings** | A customer can make multiple bookings over time. |
| **Properties** | `1 : N` | **Bookings** | A property can have historical bookings (Cancelled, Completed) but only one active 'Confirmed' booking. |
| **Agents** | `1 : N` | **Bookings** | An agent facilitates bookings for their assigned properties. |
| **Bookings** | `1 : 1..N` | **Payments** | A booking has corresponding payment ledger transactions (advance token, full balance, or refund). |
| **Properties** | `1 : 1` | **Sales** | A finalized property sale deed is tied to a specific property. |
| **Customers** | `1 : N` | **Sales** | A customer can purchase one or more properties. |
| **Agents** | `1 : N` | **Sales** | An agent earns commission on each finalized property sale. |
| **Properties** | `1 : N` | **Rentals** | A property can have consecutive rental lease agreements over its lifecycle. |
| **Customers** | `1 : N` | **Rentals** | A customer can rent properties under active lease agreements. |
| **Customers** | `1 : N` | **Reviews** | A customer can review properties they have visited or booked. |
| **Properties** | `1 : N` | **Reviews** | A property collects ratings and reviews from verified clients. |

---

## 3. Relational Schema Representation

Underline indicates **Primary Key (PK)**; italics / bold indicates **Foreign Key (FK)**:

1. `users` (<u>user_id</u>, name, email, phone, password, role, address, created_at)
2. `owners` (<u>owner_id</u>, **user_id**, name, email, phone, address, created_at)
3. `agents` (<u>agent_id</u>, **user_id**, name, email, phone, experience, commission_rate, address, created_at)
4. `customers` (<u>customer_id</u>, **user_id**, name, email, phone, address, created_at)
5. `property_types` (<u>property_type_id</u>, type_name, description)
6. `properties` (<u>property_id</u>, **owner_id**, **agent_id**, **property_type_id**, title, description, address, city, state, pincode, area_sqft, bedrooms, bathrooms, floor_number, price, property_status, listing_type, image_url, created_at)
7. `visits` (<u>visit_id</u>, **customer_id**, **property_id**, **agent_id**, visit_date, visit_time, visit_status, remarks, created_at)
8. `bookings` (<u>booking_id</u>, **customer_id**, **property_id**, **agent_id**, booking_date, booking_amount, booking_status, remarks)
9. `payments` (<u>payment_id</u>, **booking_id**, **customer_id**, amount, payment_date, payment_method, transaction_id, payment_status)
10. `sales` (<u>sale_id</u>, **property_id**, **customer_id**, **agent_id**, sale_date, sale_price, commission_amount, sale_status)
11. `rentals` (<u>rental_id</u>, **property_id**, **customer_id**, **agent_id**, start_date, end_date, monthly_rent, security_deposit, rental_status)
12. `reviews` (<u>review_id</u>, **customer_id**, **property_id**, rating, comment, review_date)
13. `notifications` (<u>notification_id</u>, **user_id**, title, message, is_read, created_at)
