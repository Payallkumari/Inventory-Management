# 🏪 Inventory Management System

A scalable inventory tracking system designed to evolve from a simple single-store CLI/API to a robust multi-store RESTful service with authentication, rate limiting, and reporting capabilities.

---

## 📌 Stage-wise Overview

 **Stage 1** — _MVP for Single Store_

- Simple CLI/API for tracking inventory movements.
- Local storage (e.g., flat files or SQLite).
- Only one store supported.
- Focus on: **product creation**, **stock movement (in/sell/remove)**, and **current quantity**.

 **Stage 2** — _Scalable Multi-Store API_

- Migrated to **Express.js** + **PostgreSQL**.
- Support for **500+ stores** with a shared product catalog.
- Built-in **JWT Authentication** and **Rate Limiting**.
- Modular **RESTful API**, separated controllers/middleware/services.

---

##  Design Decisions

| Feature               | Decision                                                                 |
|-----------------------|--------------------------------------------------------------------------|
| **Tech Stack**         | Node.js, Express.js, PostgreSQL                                         |
| **ORM / DB Layer**     | Used `pg` with raw queries for better control                           |
| **Authentication**     | JWT (1-hour expiry), implemented middleware                             |
| **Rate Limiting**      | `express-rate-limit` middleware (100 requests/15min per IP)             |
| **API Structure**      | RESTful design: `/api/products`, `/api/stores/:id/stock`, etc.          |
| **Modularity**         | Middleware, services, and routes modularized for scalability            |
| **Reporting**          | Queries for inventory by date, top-selling, low-stock, and total sales  |

---

##  Assumptions

- Each product is globally unique, available across all stores.
- Stock movement (in, sell, remove) is logged and timestamped.
- No user registration yet—credentials are hardcoded for now.
- Each request must include a valid token for all endpoints (except `/login`).
- PostgreSQL is used for relational queries and scalability.

---

##  API Design

### Authentication

- **POST** `/api/login`
  - `body`: `{ email, password }`
  - Returns JWT on success.

---

###  Products

| Method | Endpoint                  | Description              |
|--------|---------------------------|--------------------------|
| POST   | `/api/products`           | Create product           |
| GET    | `/api/products`           | List all products        |
| PUT    | `/api/products/:id`       | Update product           |

---

###  Stores & Stock

| Method | Endpoint                                                          | Description                  |
|--------|-------------------------------------------------------------------|------------------------------|
| GET    | `/api/stores`                                                    | List all stores              |
| GET    | `/api/stores/:storeId/stock`                                     | Stock in a store             |
| POST   | `/api/stores/:storeId/products/:productId/stock-in`              | Add stock                    |
| POST   | `/api/stores/:storeId/products/:productId/sell`                  | Sell product                 |
| POST   | `/api/stores/:storeId/products/:productId/remove`                | Remove stock manually        |

---

### 📊 Reporting

| Method | Endpoint                                              | Description                          |
|--------|-------------------------------------------------------|--------------------------------------|
| GET    | `/api/stores/:storeId/inventory?date_from&date_to`   | Stock movements in date range        |
| GET    | `/api/stores/:storeId/sales?top=n`                   | Top selling products                 |
| GET    | `/api/stores/:storeId/low-stock?threshold=n`         | Low stock products                   |
| GET    | `/api/stores/:storeId/total-sales?date_from&date_to` | Revenue generated in date range      |

---

##  Evolution Rationale: v1 → v2

| Feature              | v1                                       | v2                                                              |
|----------------------|-------------------------------------------|------------------------------------------------------------------|
| **Stores**            | Single store (assumed)                   | Supports 50+ stores                                             |
| **Data Storage**      | Flat file / SQLite                       | PostgreSQL for scalability                                       |
| **Auth**              | None                                     | JWT-based user authentication                                   |
| **Rate Limiting**     | None                                     | Express middleware for DDoS protection                          |
| **API Surface**       | Minimal CLI or REST                      | Full RESTful API with modular routes                            |
| **Reporting**         | Not available                            | Date-filtered inventory, sales, low-stock, revenue              |
| **Architecture**      | Monolithic                               | Modular (routes, middleware, controller separation)             |

---


## 🧪 Testing

Used Postman  to test endpoints.
Login to Get JWT Token
Add header: Authorization: Bearer <token> for protected routes.  
write this in readmi formate 
