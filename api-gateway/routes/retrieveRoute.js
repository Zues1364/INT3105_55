import express from 'express';
import axios from 'axios';
import { successResponse, errorResponse } from '../../services/common/responseHandler.js';

const router = express.Router();

router.get('/:id', async (req, res) => {
    try {
        const response = await axios.get(`http://localhost:3002/retrieve/${req.params.id}`);
        successResponse(res, response.data);
    } catch (err) {
        errorResponse(res, 'Failed to retrieve URL');
    }
});

export default router;
