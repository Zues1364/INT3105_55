import { createClient } from 'redis';

const client = createClient({
    password: 'oxVHyGpvyc70kVGMOdbK2KDZd0GeTueC',
    socket: {
        host: 'redis-11975.c334.asia-southeast2-1.gce.redns.redis-cloud.com',
        port: 11975
    }
});

client.on('error', (err) => {
  console.error('Redis connection error:', err);
});

client.on('connect', () => {
  console.log('Connected to Redis');
});

// Wait for the client to connect before allowing any operations
await client.connect(); // Ensure client is connected

export const getAsync = (key) => client.get(key);
export const setAsync = (key, value) => client.set(key, value);
export const delAsync = (key) => client.del(key);

export default client;
