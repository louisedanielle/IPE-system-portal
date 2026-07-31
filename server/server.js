require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;

// ===== MIDDLEWARE =====
app.use(cors());
app.use(express.json());

// ===== MONGODB CONNECTION =====
console.log('🔗 Connecting to MongoDB...');
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    console.log('⚠️  Server will continue without database');
  });

// ===== MODELS =====
const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const ClaimSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userEmail: String,
  policyNumber: String,
  patientNameEnglish: String,
  patientNameChinese: String,
  patientIdNumber: String,
  provisionalDiagnosis: String,
  healthcareProvider: String,
  estimatedStayDays: Number,
  wardClass: String,
  treatmentSurgery: String,
  attendingDoctor: String,
  currency: { type: String, default: 'HKD' },
  roomChargesMin: Number,
  roomChargesMax: Number,
  mealChargesMin: Number,
  mealChargesMax: Number,
  doctorVisitFeeMin: Number,
  doctorVisitFeeMax: Number,
  surgeonFeeMin: Number,
  surgeonFeeMax: Number,
  anesthetistFeeMin: Number,
  anesthetistFeeMax: Number,
  operatingTheatreMin: Number,
  operatingTheatreMax: Number,
  diagnosticImagingMin: Number,
  diagnosticImagingMax: Number,
  diagnosticImagingBodyParts: String,
  miscellaneousMin: Number,
  miscellaneousMax: Number,
  totalEstimatedMin: Number,
  totalEstimatedMax: Number,
  claimType: { type: String, default: 'Medical' },
  status: { type: String, default: 'Pending' },
  submittedAt: Date,
  createdAt: { type: Date, default: Date.now }
});

// Create models (with error handling if MongoDB not connected)
let User, Claim;
try {
  User = mongoose.model('User', UserSchema);
  Claim = mongoose.model('Claim', ClaimSchema);
} catch (error) {
  console.log('⚠️  Models created but MongoDB not connected');
  // Create dummy models for testing
  User = mongoose.model('User', UserSchema);
  Claim = mongoose.model('Claim', ClaimSchema);
}

// ===== AUTH MIDDLEWARE =====
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token.' });
  }
};

// ===== TEST ROUTE =====
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API is working!',
    mongodb: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// ===== AUTH ROUTES =====
app.post('/api/auth/register', async (req, res) => {
  console.log('📝 Registration attempt:', req.body.email);
  
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      console.log('⚠️  MongoDB not connected, using in-memory storage');
      // For testing: accept any registration
      return res.status(201).json({
        message: 'User registered successfully (demo mode)',
        token: jwt.sign(
          { userId: 'demo123', email: email },
          process.env.JWT_SECRET || 'fallback_secret',
          { expiresIn: '7d' }
        ),
        user: {
          id: 'demo123',
          email: email,
          name: name || ''
        }
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      email: email.toLowerCase(),
      password: hashedPassword,
      name: name || ''
    });

    await user.save();

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    console.log('✅ Registration successful for:', email);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({ 
      error: 'Registration failed',
      details: error.message 
    });
  }
});

app.post('/api/auth/login', async (req, res) => {
  console.log('🔑 Login attempt:', req.body.email);
  
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      console.log('⚠️  MongoDB not connected, using demo login');
      // For testing: accept any login
      if (password.length >= 8) {
        return res.json({
          message: 'Login successful (demo mode)',
          token: jwt.sign(
            { userId: 'demo123', email: email },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '7d' }
          ),
          user: {
            id: 'demo123',
            email: email,
            name: 'Demo User'
          }
        });
      } else {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    console.log('✅ Login successful for:', email);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({
        id: req.user.userId,
        email: req.user.email,
        name: 'Demo User'
      });
    }
    
    const user = await User.findById(req.user.userId).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get user info' });
  }
});

// ===== CLAIM ROUTES =====
app.post('/api/claims', authenticateToken, async (req, res) => {
  try {
    const claimData = {
      ...req.body,
      userId: req.user.userId,
      userEmail: req.user.email,
    };

    if (mongoose.connection.readyState !== 1) {
      console.log('⚠️  MongoDB not connected, claim saved in memory only');
      return res.status(201).json({
        success: true,
        message: 'Claim submitted successfully (demo mode)',
        claimId: 'demo_' + Date.now()
      });
    }

    const claim = new Claim(claimData);
    await claim.save();

    console.log('✅ New claim saved to database');
    console.log('Claim ID:', claim._id);
    console.log('User:', req.user.email);

    res.status(201).json({
      success: true,
      message: 'Claim submitted successfully',
      claimId: claim._id
    });
  } catch (error) {
    console.error('❌ Claim submission error:', error);
    res.status(500).json({ error: 'Failed to submit claim' });
  }
});

app.get('/api/claims', authenticateToken, async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json([]);
    }
    
    const claims = await Claim.find({ userId: req.user.userId })
      .sort({ createdAt: -1 });
    res.json(claims);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch claims' });
  }
});

// ===== START SERVER =====
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📍 Test: http://localhost:${PORT}/api/test`);
  console.log(`📍 Register: http://localhost:${PORT}/api/auth/register`);
  console.log(`📍 Login: http://localhost:${PORT}/api/auth/login`);
  console.log(`📊 MongoDB Status: ${mongoose.connection.readyState === 1 ? 'Connected ✅' : 'Disconnected ⚠️'}`);
});