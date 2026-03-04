const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// 🏠 ROOT ROUTE (Fixes "Cannot GET /" on Render)
app.get('/', (req, res) => {
  res.json({ 
    message: "SkillRush OS API is Online", 
    status: "Active",
    database: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected"
  });
});

// 🔌 FORCED CLOUD CONNECTION
// We use a high timeout to ensure Render has time to find the cluster
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000, 
      socketTimeoutMS: 45000,
    });
    console.log("✅ MongoDB Atlas: Cloud Connection Established");
  } catch (err) {
    console.error("❌ DB Connection Error:", err.message);
    // If it fails, wait 5 seconds and try again
    setTimeout(connectDB, 5000);
  }
};

connectDB();

// 📝 USER SCHEMA
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, default: "Candidate" },
  role: { type: String, default: 'candidate' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);

// 🚀 AUTHENTICATION APIS
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const newUser = new User({ email: email.toLowerCase(), password: hashed, name });
    await newUser.save();
    res.status(201).json({ message: "Cloud Profile Created" });
  } catch (err) {
    res.status(400).json({ error: "Registration Failed" });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const userEmail = email.toLowerCase();
  
  // 🛡️ ADMIN BYPASS
  if (userEmail === "skillrush" && password === "Skillrush@97") {
    const token = jwt.sign({ email: userEmail, role: 'admin' }, process.env.JWT_SECRET);
    return res.json({ token, user: { email: userEmail, name: "System Admin", role: "admin" } });
  }

  const user = await User.findOne({ email: userEmail });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: "Invalid Credentials" });
  }

  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
  res.json({ token, user: { email: user.email, name: user.name, role: user.role } });
});

app.get('/api/admin/users', async (req, res) => {
  const users = await User.find({}, '-password').sort({ createdAt: -1 });
  res.json(users);
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 SkillRush API active on port ${PORT}`));