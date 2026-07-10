import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import helmet from 'helmet';                           // 👈 Security headers
import { globalLimiter } from './middleware/securityMiddleware.js';  // 👈 Global rate limiter
import { errorHandler, notFound } from './middleware/errorMiddleware.js';

// Routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import emailRoutes from './routes/emailRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import notificationsRoutes from './routes/notificationsRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import appRoutes from './routes/appRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT;
const MONGO_URL = process.env.MONGO_URL;

// ============================
// 1. SECURITY HEADERS (Helmet)
// ============================
app.use(helmet());

// Optional: stricter CSP – adjust to your needs (same as Lovoh Create)
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:", "http:"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https:", "http:"],
      imgSrc: ["'self'", "data:", "blob:", "https:", "http:"],
      fontSrc: ["'self'", "https:", "data:"],
      connectSrc: ["'self'", "https:", "http:", "ws:", "wss:"],
      mediaSrc: ["'self'", "https:", "http:"],
      objectSrc: ["'none'"],
      frameSrc: ["'self'"],
      frameAncestors: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      upgradeInsecureRequests: [],
    },
  })
);

app.use(
  helmet.permittedCrossDomainPolicies({
    permittedPolicies: "none",
  })
);

// ============================
// 2. GLOBAL RATE LIMITING
// ============================
app.use(globalLimiter);

// ============================
// 3. CORS
// ============================
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'https://nexa.curriumx.online',
      'https://localhost',
      'https://nexa.lovohcreate.com',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// ============================
// 4. BODY PARSERS & COOKIE
// ============================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Optional: if you have a logger middleware, add it here
// app.use(logger);

// ============================
// 5. HEALTH CHECK
// ============================
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Nexa API is running 🚀",
  });
});

app.head("/", (req, res) => {
  res.sendStatus(200);
});

// ============================
// 6. ROUTES
// ============================
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/app', appRoutes);

// ============================
// 7. ERROR HANDLING (must be last)
// ============================
app.use(notFound);
app.use(errorHandler);

// ============================
// 8. CONNECT TO DB & START
// ============================
mongoose
  .connect(MONGO_URL)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

export default app;