// --------- implemented  partial asyncronization  Stage 3 ------------
const redis = require("redis");
const subscriber = redis.createClient();

// Subscribe to the "stockMovement" channel
subscriber.subscribe("stockMovement");

// Handle incoming messages
subscriber.on("message", (channel, message) => {
    if (channel === "stockMovement") {
        const event = JSON.parse(message);
        console.log("Processing stock movement event:", event);

        // Add logic to process the event (e.g., update analytics, notify users)
    }
});

console.log("Subscriber is listening for stock movement events...");