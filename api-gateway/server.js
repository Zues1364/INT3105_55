import express from 'express';
import { limiter } from './rateLimiter.js';
import shortenRoute from './routes/shortenRoute.js';
import retrieveRoute from './routes/retrieveRoute.js';

const app = express();
app.use(express.json());

app.use('/shorten', limiter, shortenRoute);
app.use('/retrieve', limiter, retrieveRoute);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`API Gateway running on port ${port}`));