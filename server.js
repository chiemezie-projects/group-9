/**
 * Server Entry Point
 * 
 * Sets up Express server with:
 * - MongoDB connection
 * - Session management (stored in MongoDB via connect-mongo)
 * - Static file serving
 * - API routes for auth, workouts, and progress
 * - HTML page serving with route protection
 */

require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/authRoutes');
const workoutRoutes = require('./routes/workoutRoutes');
const progressRoutes = require('./routes/progressRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// ---------------------
// Middleware
// ---------------------

// Parse JSON request bodies
app.use(express.json());

// Parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret-key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    collectionName: 'sessions'
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 24 hours
    httpOnly: true,
    secure: false // Set to true in production with HTTPS
  }
}));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// ---------------------
// API Routes
// ---------------------

app.use('/api', authRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/progress', progressRoutes);

// ---------------------
// Page Routes
// ---------------------

// Public pages (no authentication required)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'register.html'));
});

// Protected pages (authentication required)
app.get('/dashboard', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  res.sendFile(path.join(__dirname, 'views', 'dashboard.html'));
});

app.get('/workouts', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  res.sendFile(path.join(__dirname, 'views', 'workouts.html'));
});

app.get('/timer', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  res.sendFile(path.join(__dirname, 'views', 'timer.html'));
});

app.get('/progress', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  res.sendFile(path.join(__dirname, 'views', 'progress.html'));
});

// ---------------------
// Start Server
// ---------------------

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
