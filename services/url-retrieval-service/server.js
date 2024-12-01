import express from 'express';
import { getAsync, setAsync } from '../common/redisClient.js';
import { retrieveUrl } from './utils.js';
import { successResponse, errorResponse } from '../common/responseHandler.js';

const app = express();
app.use(express.json());

// Get the port from the environment variable, default to 4001 if not set
const PORT = process.env.PORT || 4001;

app.get('/retrieve/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const cachedUrl = await getAsync(id);
        if (cachedUrl) return successResponse(res, { originalUrl: cachedUrl });

        const url = await retrieveUrl(id);
        if (!url) return errorResponse(res, 'URL not found', 404);

        await setAsync(id, url);
        successResponse(res, { originalUrl: url });
    } catch (err) {
        errorResponse(res, err.message);
    }
});

app.listen(PORT, () => console.log(`URL Retrieval Service running on port ${PORT}`));