import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import uploadroute from './route/uploadroute.js';

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

app.use('/api/upload', uploadroute);

const PORT = process.env.PORT || 5002;

app.listen(PORT, () => {
  console.log(`Utilities service running on port ${PORT}`);
  connectDB();
});
