const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000; // Port của API Gateway

app.use(express.json());

// Endpoint để rút gọn URL
app.post('/shorten', async (req, res) => {
    try {
        const response = await axios.post('http://localhost:3001/shorten', req.body);
        res.send(response.data);
    } catch (err) {
        res.status(500).send({ error: 'Failed to shorten URL' });
    }
});

// Endpoint để lấy URL gốc từ ID
app.get('/retrieve/:id', async (req, res) => {
    try {
        const response = await axios.get(`http://localhost:3002/retrieve/${req.params.id}`);
        res.send(response.data);
    } catch (err) {
        res.status(500).send({ error: 'Failed to retrieve URL' });
    }
});

app.listen(port, () => {
    console.log(`API Gateway running on port ${port}`);
});
