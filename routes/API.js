const express = require("express");
const authenticateToken = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const users = [
    {
        id: 1,
        email: "manager@example.com",
        password: bcrypt.hashSync("password123", 10), 
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
    app.post("/api/login", loginUser);
    
    app.use("/api", authenticateToken);

    // Manager-only routes
    app.post("/api/products", authorize(["manager"]), createProduct);
    app.put("/api/products/:productId", authorize(["manager"]), updateProduct);
    app.post("/api/stores/:storeId/products/:productId/stock-in", authorize(["manager"]), async (req, res) => {
        const { storeId, productId } = req.params;
        const { quantity } = req.body;

        try {
            await logStockMovement(storeId, productId, quantity, "stock-in");
            res.status(200).send({ message: "Stock updated and event published." });
        } catch (err) {
            res.status(500).send(err.message);
        }
    });
    app.post("/api/stores/:storeId/products/:productId/sell", authorize(["manager"]), sellProduct);
    app.post("/api/stores/:storeId/products/:productId/remove", authorize(["manager"]), removeStock);

    // Routes accessible to both managers and customers:
    app.get("/api/products", getAllProducts);
    app.get("/api/stores", getAllStores);
    app.get("/api/stores/:storeId/stock", getStoreStock);

    // reporting and filtering routes
    app.get("/api/stores/:storeId/inventory", getInventoryByDate);
    app.get("/api/stores/:storeId/sales", getTopSellingProducts);
    app.get("/api/stores/:storeId/low-stock", getLowStockProducts);
    app.get("/api/stores/:storeId/total-sales", getTotalSales);
};