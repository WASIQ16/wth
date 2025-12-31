require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Request Logger
app.use((req, res, next) => {
    console.log(`📡 ${req.method} ${req.url}`);
    next();
});

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ Connected to MongoDB Atlas'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Routes
app.get('/', (req, res) => {
    res.send('Authentication Backend is running...');
});

app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

// Import Routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('💥 Backend Error:', err.stack);

    // Don't send response if headers already sent
    if (res.headersSent) {
        return next(err);
    }

    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error',
        error: err.message,
        details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});