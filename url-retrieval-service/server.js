import express from 'express';
import { getAsync, setAsync } from './cache.js';
import * as lib from '../utils.js';
const app = express();
const port = 3002;

app.get('/retrieve/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const cachedUrl = await getAsync(id);
        if (cachedUrl) {
            return res.json({ originalUrl: cachedUrl });
        }

        const url = await lib.findOrigin(id);
        if (!url) {
            return res.status(404).send({ error: 'URL not found' });
        }

        await setAsync(id, url, 'EX', 3600);

        res.status(200).send({ originalURL: url });
    } catch (err) {
        console.error('Error retrieving URL:', error);
        res.status(500).send({ error: err.message });
    }
});

app.listen(port, () => {
    console.log(`URL Retrieval Service running on port ${port}`);
});
