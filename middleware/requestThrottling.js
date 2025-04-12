const slowDown = require("express-slow-down");

// Slows down responses after 50 requests per 15 min
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, 
  delayAfter: 50,           // Start slowing down after 50 requests
  delayMs: 500              // 0.5s delay per request above limit
});

app.use("/api/", speedLimiter);
