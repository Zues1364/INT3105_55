import express from 'express';
import config  from './config/gatewayConfig.js';
import shortenRoute from './routes/shortenRoute.js';
import retrieveRoute from './routes/retrieveRoute.js';

const app = express();
app.use(express.json());

app.use('/shorten', config.shortenerRateLimiting, shortenRoute);
app.use('/retrieve', config.retrievalRateLimiting, retrieveRoute);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`API Gateway running on port ${port}`));