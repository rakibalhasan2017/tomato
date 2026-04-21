import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/authroute.js';
import cors from 'cors';
import client from 'prom-client';
dotenv.config();
const app = express();
const allowedOrigins = new Set([process.env.CLIENT_URL, 'http://localhost:5173']
    .filter((origin) => Boolean(origin))
    .map((origin) => origin.replace(/\/$/, '')));
app.use(express.json());
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.has(origin.replace(/\/$/, ''))) {
            callback(null, true);
            return;
        }
        callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
}));
client.collectDefaultMetrics();
// Create custom metric (example: request counter)
const httpRequestCounter = new client.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status'],
});
//middleware to count requests
app.use((req, res, next) => {
    res.on('finish', () => {
        httpRequestCounter.inc({
            method: req.method,
            route: req.originalUrl,
            status: res.statusCode,
        });
    });
    next();
});
// Metrics endpoint
app.get('/metrics', async (req, res) => {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
});
const PORT = process.env.PORT || 5000;
app.use('/api/auth', authRoutes);
app.listen(PORT, () => {
    console.log(`Auth service running on port ${PORT}`);
    connectDB();
});
