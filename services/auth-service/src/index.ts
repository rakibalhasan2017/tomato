import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/authroute.js';
import cors from 'cors';

dotenv.config();

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: 'http://localhost:5173', // Allow frontend origin
  }),
);

const PORT = process.env.PORT || 5000;

app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
  console.log(`Auth service running on port ${PORT}`);
  connectDB();
});
