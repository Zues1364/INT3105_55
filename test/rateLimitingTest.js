import axios from 'axios';

const API_GATEWAY_URL = process.env.API_GATEWAY_URL || 'http://localhost:3000';
const totalRequests = 120; // Number of requests to simulate
let successCount = 0;
let rateLimitedCount = 0;

async function sendRequest() {
    try {
        // Example endpoint for shortening a URL
        await axios.post(`${API_GATEWAY_URL}/shorten`, { url: 'https://example.com' });
        successCount++;
    } catch (error) {
        if (error.response && error.response.status === 429) {
            rateLimitedCount++;
        } else {
            console.error('Unexpected error:', error.message);
        }
    }
}

async function runRateLimitingTest() {
    console.log('Starting rate-limiting test...');
    const promises = Array.from({ length: totalRequests }, sendRequest);

    await Promise.all(promises);

    console.log(`Successful requests: ${successCount}`);
    console.log(`Rate-limited requests: ${rateLimitedCount}`);
}

runRateLimitingTest()
    .then(() => console.log('Rate-limiting test completed successfully.'))
    .catch((error) => console.error('Rate-limiting test failed:', error));
