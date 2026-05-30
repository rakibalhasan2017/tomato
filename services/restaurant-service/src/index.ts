import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db';
import cors from 'cors';
import restaurant from './model/restaurant';
import restaurantroute from './route/restaurantroute.js';
import menuroute from './route/menuroute.js';

dotenv.config();

const app = express();
const allowedOrigins = new Set(
  [process.env.CLIENT_URL, 'http://localhost:5173']
    .filter((origin): origin is string => Boolean(origin))
    .map((origin) => origin.replace(/\/$/, ''))
);

app.use(express.json());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin.replace(/\/$/, ''))) {
        callback(null, true);
        return;
      }
      callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
  })
);

app.use('/api/restaurant', restaurantroute);
app.use('/api/menu', menuroute);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Restaurant service running on port ${PORT}`);
  connectDB();
});
