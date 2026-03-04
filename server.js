const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// 🔌 CLOUD CONNECTION
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Atlas connected (Mumbai Cluster)"))
  .catch(err => console.error("❌ DB Connection Error:", err));

// 📝 SCHEMA FOR TEAMMATES
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, default: "Candidate" },
  role: { type: String, default: 'candidate' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);

// 🚀 REGISTRATION API
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashed, name });
    await newUser.save();
    res.status(201).json({ message: "Profile saved to Cloud" });
  } catch (err) {
    res.status(400).json({ error: "Email already exists" });
  }
});

// 🔑 LOGIN API (Includes Admin Bypass)
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (email === "skillrush" && password === "Skillrush@97") {
    const token = jwt.sign({ email, role: 'admin' }, process.env.JWT_SECRET);
    return res.json({ token, user: { email, name: "Admin", role: "admin" } });
  }

  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: "Invalid Credentials" });
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  res.json({ token, user: { email: user.email, name: user.name, role: user.role } });
});

// 📊 ADMIN: FETCH ALL USERS
app.get('/api/admin/users', async (req, res) => {
  const users = await User.find({}, '-password');
  res.json(users);
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 API active on port ${PORT}`));