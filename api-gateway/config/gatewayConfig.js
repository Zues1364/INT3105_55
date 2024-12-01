const config = {
    port: process.env.PORT || 3000, // Port for the API Gateway
    retrievalRateLimiting: {
        windowMs: 15 * 60 * 1000, // 15 minutes in milliseconds
        maxRequests: 100, // Maximum number of requests per window
        message: 'Too many requests, please try again later.', // Message for rate limit exceed
    },
    shortenerRateLimiting: {
        windowMs: 15 * 60 * 1000, // 15 minutes in milliseconds
        maxRequests: 100, // Maximum number of requests per window
        message: 'Too many requests, please try again later.', // Message for rate limit exceed
    },
    services: {
        urlShortener: process.env.URL_SHORTENER_SERVICE || 'http://localhost/shorten', // NGINX load balancer for Shortener Service
        urlRetrieval: process.env.URL_RETRIEVAL_SERVICE || 'http://localhost/retrieve', // NGINX load balancer for Retrieval Service
    },
    mongodb: {
        host: 'mongodb://localhost:27017',
        database: 'url_shortener',
        collection: 'main'
    } 
};

export default config;
