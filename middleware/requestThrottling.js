const slowDown = require("express-slow-down");

const speedLimiter = slowDown({
    windowMs: 15 * 60 * 1000,
    delayAfter: 50,
    delayMs: 1000,
});

module.exports = speedLimiter;
