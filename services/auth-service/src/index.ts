import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/authroute.js';
import cors from 'cors';

dotenv.config();

const app = express();
const allowedOrigins = new Set(
  [process.env.CLIENT_URL, 'http://localhost:5173']
    .filter((origin): origin is string => Boolean(origin))
    .map((origin) => origin.replace(/\/$/, '')),
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
  }),
);

const PORT = process.env.PORT || 5000;

app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
  console.log(`Auth service running on port ${PORT}`);
  connectDB();
});
