const redis = require("redis");
const subscriber = redis.createClient({ url: process.env.REDIS_URL });

subscriber.connect().then(async () => {
    console.log("Redis subscriber connected");
    await subscriber.subscribe("stockMovement", (message) => {
        const event = JSON.parse(message);
        console.log("Asynchronous stock movement event received:", event);
    });
}).catch(err => {
    console.error("Redis Subscriber error:", err);
});