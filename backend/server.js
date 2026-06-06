import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import mongoose from 'mongoose';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';


import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import emailRoutes from './routes/emailRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import notificationsRoutes from './routes/notificationsRoutes.js';


dotenv.config()

const app = express()
const PORT = process.env.PORT;
const MONGO_URL = process.env.MONGO_URL;

app.use(cors({
    origin: [
        'http://localhost:5173',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH','OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check - handles ALL methods including HEAD
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Nexa API is running 🚀",
  });
});

app.head("/", (req, res) => {
  res.sendStatus(200);
});

//Routing
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/notifications', notificationsRoutes);



// Middleware
app.use(notFound);
app.use(errorHandler);

// Connect to MongoDB and start server
mongoose
.connect(MONGO_URL)
.then(()=> {
    console.log('MongoDB connected');

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});