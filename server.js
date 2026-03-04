const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// 🔌 NEON POSTGRES CONNECTION
// Hardcoded for immediate deployment success
const pool = new Pool({
  connectionString: "postgresql://neondb_owner:npg_Tywk6JF0vjhi@ep-divine-rain-aihok56x-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require",
  ssl: { rejectUnauthorized: false }
});

// 🏠 ROOT ROUTE - Use this to verify connection on Render
app.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ 
      message: "SkillRush API is Online", 
      db_status: "Connected to Neon", 
      time: result.rows[0] 
    });
  } catch (err) {
    res.status(500).json({ status: "DB Error", error: err.message });
  }
});

// 🚀 REGISTRATION API
app.post('/api/auth/register', async (req, res) => {
  const { email, password, name } = req.body;
  try {
    const query = 'INSERT INTO users (email, password, name) VALUES ($1, $2, $3)';
    await pool.query(query, [email.toLowerCase(), password, name]);
    res.status(201).json({ message: "User Profile Created in Neon" });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Registration Failed", details: err.message });
  }
});

// 🔑 LOGIN API
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const query = 'SELECT * FROM users WHERE email = $1 AND password = $2';
    const result = await pool.query(query, [email.toLowerCase(), password]);
    
    if (result.rows.length > 0) {
      res.json({ message: "Login Successful", user: result.rows[0] });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  } catch (err) {
    res.status(500).json({ error: "Server Error" });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 SkillRush API active on port ${PORT}`));