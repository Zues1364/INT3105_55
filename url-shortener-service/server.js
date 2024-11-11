import express from 'express';
import { setAsync } from './cache.js';
import * as lib from '../utils.js';
const app = express();
const port = 3001;

app.use(express.json());

app.post('/shorten',  async (req, res) => {
    try {
        const url = req.body.url;
        if (!url) {
            return res.status(400).send({ error: 'URL is required' });
        }
        const newID = await lib.shortUrl(url);
        
        try {
            const result = await setAsync(newID, url, 'EX', 3600);
        } catch (redisErr) {
            return res.status(500).send({ error: 'Failed to save URL in Redis' });
        }
        res.status(201).send({ shortID: newID });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

app.listen(port, () => {
    console.log(`URL Shortener Service running on port ${port}`);
});
