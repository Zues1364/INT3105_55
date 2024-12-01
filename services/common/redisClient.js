import { createClient } from 'redis';

const client = createClient({
    socket: { host: process.env.REDIS_HOST || 'localhost', port: process.env.REDIS_PORT || 6379 },
});

client.on('error', (err) => console.error('Redis connection error:', err));
client.on('connect', () => console.log('Connected to Redis'));
await client.connect();

// Asynchronous Redis operations
export const getAsync = (key) => client.get(key);
export const setAsync = (key, value) => client.set(key, value);
export const delAsync = (key) => client.del(key);

export default client;
