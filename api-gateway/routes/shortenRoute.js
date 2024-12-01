import express from 'express';
import axios from 'axios';
import { successResponse, errorResponse } from '../../services/common/responseHandler.js';

const router = express.Router();

// Proxy to NGINX for load balancing
router.post('/', async (req, res) => {
    try {
        const response = await axios.post('http://localhost/shorten', req.body); // Send request to NGINX
        successResponse(res, response.data); // Forward the successful response
    } catch (err) {
        // Extract error details from axios response
        const errorMessage = err.response
            ? err.response.data.error || 'Unexpected error from backend'
            : err.message;
        errorResponse(res, `Failed to shorten URL: ${errorMessage}`); // Return detailed error
    }
});

export default router;
