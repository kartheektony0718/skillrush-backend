const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// --- DATABASE CONNECTION ---
// Connecting to Mumbai Cluster
// Removed 'useNewUrlParser' and 'useUnifiedTopology' as they are now default in Node 22+
const MONGO_URI = process.env.MONGO_URI;

// Inside backend/server.js
mongoose.connect(process.env.MONGO_URI, {
  family: 4 // 👈 This forces the connection to use IPv4 instead of IPv6
})
.then(() => console.log("✅ MongoDB Atlas: Cloud Connection Established"))
.catch(err => {
  console.error("❌ DB Connection Error:", err.message);
});

// --- DATA MODELS ---
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, default: "Candidate" },
  role: { type: String, default: 'candidate' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);

// --- AUTHENTICATION ROUTES ---

// 1. Registration Protocol
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const newUser = new User({ 
      email: email.toLowerCase(), 
      password: hashed, 
      name 
    });
    await newUser.save();
    res.status(201).json({ message: "Cloud Profile Created Successfully" });
  } catch (err) {
    res.status(400).json({ error: "Registration Failed: User may already exist." });
  }
});

// 2. Login Protocol (Includes SkillRush Admin Bypass)
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const userEmail = email.toLowerCase();
  
  // 🛡️ MASTER ADMIN BYPASS
  if (userEmail === "skillrush" && password === "Skillrush@97") {
    const token = jwt.sign({ email: userEmail, role: 'admin' }, process.env.JWT_SECRET);
    return res.json({ 
      token, 
      user: { email: userEmail, name: "System Admin", role: "admin" } 
    });
  }

  // 👤 STANDARD USER AUTH
  try {
    const user = await User.findOne({ email: userEmail });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid Credentials" });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
    res.json({ 
      token, 
      user: { email: user.email, name: user.name, role: user.role } 
    });
  } catch (err) {
    res.status(500).json({ error: "Server Error during Authentication" });
  }
});

// --- ADMIN OPERATIONS ---

// 📊 FETCH CLOUD DIRECTORY
app.get('/api/admin/users', async (req, res) => {
  try {
    const users = await User.find({}, '-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Cloud Sync Failed" });
  }
});

// --- SERVER ACTIVATION ---
const PORT = process.env.PORT || 10000;
// 🏠 ROOT ROUTE
// This stops the "Cannot GET /" error on Render
app.get('/', (req, res) => {
  res.json({ 
    message: "SkillRush API is Online", 
    status: "Active",
    timestamp: new Date()
  });
});
app.listen(PORT, () => {
  console.log(`🚀 SkillRush API active on port ${PORT}`);
  console.log(`📡 Production URL: https://skillrush-backend.onrender.com`);
});