import express from 'express';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.route.js';
import userRoutes from './routes/user.route.js'; 
import postRoutes from './routes/post.route.js';

import { connectDB } from './lib/db.js';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(express.json()); //parse json request bodies
app.use(cookieParser());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/users", postRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB(); 
})
