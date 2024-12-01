import express from 'express';
import axios from 'axios';
import { successResponse, errorResponse } from '../../services/common/responseHandler.js';

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const response = await axios.post('http://localhost:3001/shorten', req.body);
        successResponse(res, response.data);
    } catch (err) {
        errorResponse(res, 'Failed to shorten URL');
    }
});

export default router;
