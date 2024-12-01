import express from 'express';
import { setAsync } from '../common/redisClient.js';
import { shortUrl } from './utils.js';
import { successResponse, errorResponse } from '../common/responseHandler.js';

const app = express();
app.use(express.json());

app.post('/shorten', async (req, res) => {
    try {
        const url = req.body.url;
        if (!url) return errorResponse(res, 'URL is required', 400);

        const newID = await shortUrl(url);
        await setAsync(newID, url);
        successResponse(res, { shortID: newID });
    } catch (err) {
        errorResponse(res, err.message);
    }
});

app.listen(3001, () => console.log('URL Shortener Service running on port 3001'));
