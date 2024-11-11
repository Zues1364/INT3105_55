import express from 'express';
import axios from 'axios';
import rateLimit from 'express-rate-limit';
const app = express();
const port = 3000; // Port của API Gateway

const limiterShort = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 phút
    max: 110, // Tối đa 100 yêu cầu mỗi IP trong mỗi 15 phút
    message: "Bạn đã gửi quá nhiều yêu cầu, vui lòng thử lại sau.", // Tin nhắn phản hồi khi vượt quá giới hạn
}) 


const limiterRetrieve = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 phút
    max: 100, // Tối đa 100 yêu cầu mỗi IP trong mỗi 15 phút
    message: "Bạn đã gửi quá nhiều yêu cầu, vui lòng thử lại sau.", // Tin nhắn phản hồi khi vượt quá giới hạn
}) 

app.use(express.json());
//app.use(limiter)

// Endpoint để rút gọn URL
app.post('/shorten', limiterShort, async (req, res) => {
    try {
        const response = await axios.post('http://localhost:3001/shorten', req.body);
        res.send(response.data);
    } catch (err) {
        res.status(500).send({ error: 'Failed to shorten URL' });
    }
});

// Endpoint để lấy URL gốc từ ID
app.get('/retrieve/:id', limiterRetrieve, async (req, res) => {
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
