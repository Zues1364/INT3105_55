import express from 'express';
import { getAsync, setAsync } from '../common/redisClient.js';
import { findOrigin } from '../common/db.js';
import { successResponse, errorResponse } from '../common/responseHandler.js';

const app = express();

app.get('/retrieve/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const cachedUrl = await getAsync(id);
        if (cachedUrl) return successResponse(res, { originalUrl: cachedUrl });

        const url = await findOrigin(id);
        if (!url) return errorResponse(res, 'URL not found', 404);

        await setAsync(id, url);
        successResponse(res, { originalUrl: url });
    } catch (err) {
        errorResponse(res, err.message);
    }
});

app.listen(3002, () => console.log('URL Retrieval Service running on port 3002'));
