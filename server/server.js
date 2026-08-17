const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Establish DB connection
connectDB();

const app = express();

// Trust proxy for rate limiting (Render reverse proxy)
app.set('trust proxy', 1);

// 1. Basic Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Dev logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// 2. Security Middleware
app.use(helmet()); // Set security HTTP headers
app.use(cors({
  origin: '*', // Allow all origins for testing; restrict in production
  methods: 'GET,POST,PUT,DELETE,OPTIONS',
  allowedHeaders: 'Content-Type,Authorization'
}));
app.use(mongoSanitize()); // Prevent NoSQL Injection attacks

// Rate Limiter for Authentication routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per window
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP. Please try again in 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 3. Route Mounts
app.use('/api/auth', authLimiter, require('./routes/authRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/questions', require('./routes/questionRoutes'));
app.use('/api/answers', require('./routes/answerRoutes'));
app.use('/api/bookmarks', require('./routes/bookmarkRoutes'));
app.use('/api/history', require('./routes/historyRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));

// 4. Default Base Route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to TalentSphere AI API. Server is running!',
  });
});

// 5. 404 Route handler
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'Resource not found' });
});

// 6. Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Unhandled Rejection Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
