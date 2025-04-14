##  Inventory Management System

A scalable inventory tracking system designed to evolve from a simple single-store CLI/API to a robust multi-store RESTful service with authentication, rate limiting, and reporting capabilities.


## Design Decisions

| Feature                | Decision                                                                 |
|------------------------|--------------------------------------------------------------------------|
| **Tech Stack**         | Node.js, Express.js, PostgreSQL                                          |
| **Authentication**     | JWT (1-hour expiry), implemented middleware, and RBAC                    |
| **Rate Limiting**      | `express-rate-limit` middleware (100 requests/15min per IP)              |
| **Request Throttling** | `express-slow-down` middleware: 2s delay after 50 requests               |
| **API Structure**      | RESTful design: `/api/products`, `/api/stores/:id/stock`, etc.           |
| **Modularity**         | Middleware, services, and routes modularized for scalability             |
| **Reporting**          | Queries for inventory by date, top-selling, low-stock, and total sales   |
| **Read/Write Separation** | Neon’s branching: `queryWrite` to primary, `queryRead` to replica     |
| **Caching**            | Redis for repeated queries (2x–5x faster; ~70% reduction in DB load)     |
| **Async Handling**     | Redis Pub/Sub for background inventory processing (event-driven)         |
| **Horizontal Scaling** | PM2 in cluster mode to utilize all CPU cores on single machine           |


##  Assumptions

- Each product is globally unique and available across all stores.
- Stock movement (in, sell, remove) is logged and timestamped.
- No user registration yet—credentials are hardcoded for now.
- Each request must include a valid token for all endpoints (except `/login`).
- The system anticipates read-heavy traffic, optimized accordingly.
- PostgreSQL is used for relational queries and scalability.


##  API Design

### Authentication

- **POST** `/api/login`
  - `body`: `{ email, password }`
  - Returns JWT on success.

###  Products

| Method | Endpoint                  | Description              |
|--------|---------------------------|--------------------------|
| POST   | `/api/products`           | Create product           |
| GET    | `/api/products`           | List all products        |
| PUT    | `/api/products/:id`       | Update product           |


###  Stores & Stock

| Method | Endpoint                                                          | Description                  |
|--------|-------------------------------------------------------------------|------------------------------|
| GET    | `/api/stores`                                                    | List all stores              |
| GET    | `/api/stores/:storeId/stock`                                     | Stock in a store             |
| POST   | `/api/stores/:storeId/products/:productId/stock-in`              | Add stock                    |
| POST   | `/api/stores/:storeId/products/:productId/sell`                  | Sell product                 |
| POST   | `/api/stores/:storeId/products/:productId/remove`                | Remove stock manually        |


###  Reporting

| Method | Endpoint                                              | Description                          |
|--------|-------------------------------------------------------|--------------------------------------|
| GET    | `/api/stores/:storeId/inventory?date_from&date_to`   | Stock movements in date range        |
| GET    | `/api/stores/:storeId/sales?top=n`                   | Top selling products                 |
| GET    | `/api/stores/:storeId/low-stock?threshold=n`         | Low stock products                   |
| GET    | `/api/stores/:storeId/total-sales?date_from&date_to` | Revenue generated in date range      |


## Evolution: v1 → v3

| **Feature/Aspect**             | **v1 – MVP**                                       | **v2 – Multi-Store**                                                  | **v3 – Distributed & Scalable**                                                                 |
|--------------------------------|----------------------------------------------------|------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------|
| **Database**                   | SQLite (local file-based)                          | PostgreSQL (normalized schema, multi-store support)                    | PostgreSQL on Neon with read/write separation (primary + replica)                              |
| **API Scope**                  | Basic CRUD, single store stock-in/sell/remove      | Centralized product catalog, multi-store inventory control             | Advanced endpoints: top-selling, low-stock, filtered reports                                    |
| **Authentication**            | None                                               | JWT (1-hour expiry), secured endpoints and RBAC                                 | JWT with middleware enforcement                                                                 |
| **Rate Limiting / Throttling**| None                                               | Basic protection via JWT                                               | `express-rate-limit` (100 req/15 min) + `express-slow-down` (2s delay after 50 reqs)           |
| **Performance Enhancements**  | -                                                  | -                                                                      | Redis caching (2x–5x faster, 70% fewer DB reads)                                                |
| **Read/Write Separation**     | Not applicable                                     | Not implemented                                                        | Neon branching: `queryWrite` → primary, `queryRead` → replica for reads                         |
| **Architecture Style**        | Monolithic (single instance, synchronous flow)     | Modular, multi-entity design                                           | Read/write split, caching, async updates, clustered instances via PM2                          |
| **Scalability**               | Single-store only                                  | 500+ stores supported                                                  | Horizontal scaling via PM2 (cluster mode, multi-core simulated load balancing)                 |
| **Async Handling**            | Synchronous inventory updates                      | Synchronous with logs                                                  | Redis Pub/Sub events for background processing (non-blocking)                                  |
| **Reporting / Insights**      | None                                               | Store/date filtering for inventory                                     | Real-time top sellers, low-stock alerts, analytical KPIs                                        |



##  Testing

Used Postman  to test endpoints.
Login to Get JWT Token
Add header: Authorization: Bearer <token> for protected routes.  

