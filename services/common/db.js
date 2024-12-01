import { MongoClient } from 'mongodb';
import client from './redisClient.js'; // Redis client

// MongoDB setup
const mongoClient = new MongoClient('mongodb://localhost:27017');
await mongoClient.connect();
const db = mongoClient.db('urlShortener');
const collection = db.collection('urls');

// Create a new URL mapping
export async function create(shortID, originalUrl) {
    // Save to MongoDB
    await collection.insertOne({ _id: shortID, originalUrl, createdAt: new Date() });

    // Save to Redis for immediate access
    await client.set(shortID, originalUrl);
}

// Retrieve the original URL
export async function findOrigin(shortID) {
    // Check Redis cache
    const cachedUrl = await client.get(shortID);
    if (cachedUrl) return cachedUrl;

    // Fetch from MongoDB if not in Redis
    const result = await collection.findOne({ _id: shortID });
    if (result) {
        // Cache the result in Redis
        await client.set(shortID, result.originalUrl, { EX: 3600 }); // Cache for 1 hour
        return result.originalUrl;
    }

    return null; // URL not found
}