const express = require("express");
// const rateLimiter = require("../middleware/rateLimiter");
const authenticateToken = require("../middleware/auth");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const users = [
    {
        id: 1,
        email: "manager@example.com",
        password: bcrypt.hashSync("password123", 10), // pre-hashed
    },
];

const {
    createProduct,
    getAllProducts,
    updateProduct,
    getAllStores,
    getStoreStock,
    stockIn,
    sellProduct,
    removeStock,
    getInventoryByDate,
    getTopSellingProducts,
    getLowStockProducts,
    getTotalSales,
    loginUser,
    logStockMovement,
} = require("../services/controller.js");

module.exports = function (app) {
    app.use(express.json());
    
 //========= API rate-limits  Stage 3 ======
    // app.use(rateLimiter);

// ==== Public Route (Login)  LOGIN CONTROLLER Basic Authentication  Stage 3 ====
    app.post("/api/login", loginUser);

    // ==== Protected Routes ====
    app.use("/api", authenticateToken);

    // PRODUCT ROUTES
    app.post("/api/products", createProduct);
    app.get("/api/products", getAllProducts);
    app.put("/api/products/:productId", updateProduct);

    // STORE ROUTES
    app.get("/api/stores", getAllStores);
    app.get("/api/stores/:storeId/stock", getStoreStock);

 // --------- implemented  partial asyncronization of stock in Stage 3 ------------
    app.post("/api/stores/:storeId/products/:productId/stock-in", async (req, res) => {
        const { storeId, productId } = req.params;
        const { quantity } = req.body;

        try {
            await logStockMovement(storeId, productId, quantity, "stock-in");
            res.status(200).send({ message: "Stock updated and event published." });
        } catch (err) {
            res.status(500).send(err.message);
        }
    });

    app.post("/api/stores/:storeId/products/:productId/sell", sellProduct);
    app.post("/api/stores/:storeId/products/:productId/remove", removeStock);

    // REPORTING ROUTES
    app.get("/api/stores/:storeId/inventory", getInventoryByDate);
    app.get("/api/stores/:storeId/sales", getTopSellingProducts);
    app.get("/api/stores/:storeId/low-stock", getLowStockProducts);
    app.get("/api/stores/:storeId/total-sales", getTotalSales);
};