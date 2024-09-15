import express from 'express';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.routes.js';
import { connectDB } from './lib/db.js';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(express.json()); //parse json request bodies
app.use(cookieParser());

app.use("/api/v1/auth", authRoutes);


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB(); 
})
