import { MongoClient } from 'mongodb';
import client from './redisClient.js'; // Redis client
import config from '../../api-gateway/config/gatewayConfig.js';

// MongoDB setup
const mongoClient = new MongoClient(config.mongodb.host);
await mongoClient.connect();
const db = mongoClient.db(config.mongodb.database);
const collection = db.collection(config.mongodb.collection);

// MongoDB counter collection
const counterCollection = db.collection('counters');

// Initialize counter in Redis if not already set
async function initializeCounter() {
    const redisCounter = await client.get('url_shortener_counter');
    if (!redisCounter) {
        const dbCounter = await counterCollection.findOne({ _id: 'url_shortener_counter' });
        const initialCounter = dbCounter ? dbCounter.value : 1000; // Default start at 1000 if no value exists
        await client.set('url_shortener_counter', initialCounter);
        console.log(`Initialized Redis counter to: ${initialCounter}`);
    }
}

// Get the next counter value
export async function getNextCounter() {
    const redisCounter = await client.incr('url_shortener_counter');
    return redisCounter;
}

// Periodically sync Redis counter to MongoDB for persistence
export async function syncRedisToDB() {
    const redisCounter = await client.get('url_shortener_counter');
    if (redisCounter) {
        await counterCollection.updateOne(
            { _id: 'url_shortener_counter' },
            { $set: { value: parseInt(redisCounter, 10) } },
            { upsert: true }
        );
        console.log(`Synced Redis counter (${redisCounter}) to MongoDB.`);
    }
}

// Create a new URL mapping
export async function create(shortID, originalUrl) {
    // Save to MongoDB
    await collection.insertOne({ _id: shortID, originalUrl, createdAt: new Date() });

    // Save to Redis for immediate access
    await client.set(shortID, originalUrl);
}

// Retrieve the original URL
export async function findOrigin(shortID) {
    try {
        // Log the input for debugging
        console.log(`Looking for shortID: ${shortID}`);

        // Check Redis cache
        const cachedUrl = await client.get(shortID);
        if (cachedUrl) {
            console.log(`Cache hit for shortID: ${shortID}`);
            return cachedUrl;
        }
        console.log(`Cache miss for shortID: ${shortID}`);

        // Fetch from MongoDB if not in Redis
        const result = await collection.findOne({ _id: shortID });
        if (result) {
            console.log(`Found in MongoDB: ${result.originalUrl}`);
            // Cache the result in Redis
            await client.set(shortID, result.originalUrl, { EX: 3600 }); // Cache for 1 hour
            return result.originalUrl;
        }

        console.log(`ShortID not found in MongoDB: ${shortID}`);
        return null; // URL not found
    } catch (error) {
        console.error(`Error in findOrigin: ${error.message}`);
        throw new Error('Unexpected error from backend');
    }
}

// Initialize counter at startup
await initializeCounter();

// Save counter to MongoDB every 1 minutes
setInterval(async () => {
    try {
        await syncRedisToDB();
        console.log('Redis counter synced to MongoDB.');
    } catch (error) {
        console.error('Failed to sync Redis to MongoDB:', error);
    }
}, 5 * 60 * 1000); // Sync every 5 minutes

process.on('SIGTERM', async () => {
    console.log('Received SIGTERM. Syncing Redis counter to MongoDB...');
    await syncRedisToDB();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('Received SIGINT. Syncing Redis counter to MongoDB...');
    await syncRedisToDB();
    process.exit(0);
});