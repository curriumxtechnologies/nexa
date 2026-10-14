import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import helmet from 'helmet';
import { globalLimiter } from './middleware/securityMiddleware.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';

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

// ── 1. Trust Render's proxy so req.ip is the real client ──
app.set('trust proxy', 1);

// ── 2. CORS FIRST (before rate limiting!) ──
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:1000',
  'https://localhost',
  'https://nexa.lovohcreate.com',
  'https://nexa.curriumx.online',
];

const corsOptions = {
  origin(origin, cb) {
    // Allow same-origin / server-to-server / curl (no Origin header)
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));


// ── 3. Security headers (CSP etc.) ──
app.use(helmet());
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https:', 'http:'],
      scriptSrc: ["'self'", "'unsafe-inline'", 'https:', 'http:'],
      imgSrc: ["'self'", 'data:', 'blob:', 'https:', 'http:'],
      fontSrc: ["'self'", 'https:', 'data:'],
      connectSrc: ["'self'", 'https:', 'http:', 'ws:', 'wss:'],
      mediaSrc: ["'self'", 'https:', 'http:'],
      objectSrc: ["'none'"],
      frameSrc: ["'self'"],
      frameAncestors: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      upgradeInsecureRequests: [],
    },
  })
);
app.use(helmet.permittedCrossDomainPolicies({ permittedPolicies: 'none' }));

// ── 4. Body parsers & cookies ──
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── 5. Rate limiting (now AFTER CORS, so 429s carry CORS headers) ──
app.use(globalLimiter);

// ── 6. Health check ──
app.get('/', (req, res) => {
  res.status(200).json({ success: true, message: 'Nexa API is running 🚀' });
});
app.head('/', (req, res) => res.sendStatus(200));

// ── 7. Routes ──
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/app', appRoutes);

// ── 8. Errors ──
app.use(notFound);
app.use(errorHandler);

// ── 9. DB + listen ──
mongoose
  .connect(MONGO_URL)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

export default app;