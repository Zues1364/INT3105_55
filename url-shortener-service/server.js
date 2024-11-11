const express = require('express');
const lib = require('../utils'); // Tệp utils.js chứa các hàm giúp rút gọn URL và lưu vào cơ sở dữ liệu
const app = express();
const port = 3001; // Chọn port riêng cho dịch vụ này

app.use(express.json());
app.use(rateLimit)

app.post('/shorten',  async (req, res) => {
    try {
        const url = req.body.url;
        if (!url) {
            return res.status(400).send({ error: 'URL is required' });
        }
        const newID = await lib.shortUrl(url);
        res.status(201).send({ shortID: newID });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

app.listen(port, () => {
    console.log(`URL Shortener Service running on port ${port}`);
});
