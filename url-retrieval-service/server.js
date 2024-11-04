const express = require('express');
const lib = require('../utils'); // Tệp utils.js để truy xuất URL từ ID
const app = express();
const port = 3002; // Chọn port riêng cho dịch vụ này

app.get('/retrieve/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const url = await lib.findOrigin(id);
        if (!url) {
            return res.status(404).send({ error: 'URL not found' });
        }
        res.status(200).send({ originalURL: url });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

app.listen(port, () => {
    console.log(`URL Retrieval Service running on port ${port}`);
});
