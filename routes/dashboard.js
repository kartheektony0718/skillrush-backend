const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const Profile = require('../models/Profile');
const Resume = require('../models/Resume'); // 1. Import the Resume Model

// GET ROUTE: Fetch dashboard statistics
router.get('/', authMiddleware, async (req, res) => {
  try {
    // 1. Get the user's name from their Profile
    const profile = await Profile.findOne({ userId: req.user.id });
    const fullName = profile && profile.full_name ? profile.full_name : "Developer";

    // 2. Fetch REAL Stats from MongoDB
    // We count how many resumes exist for this specific userId
    const resumesCount = await Resume.countDocuments({ userId: req.user.id });

    const stats = {
      resumesCreated: resumesCount, // Now dynamic!
      interviewsDone: 0, // We will update this once we finish the Interview feature
      problemsSolved: 0,
      currentStreak: 1
    };

    // 3. Send it all back to the frontend
    res.json({
      name: fullName,
      stats: stats,
      recentActivity: [
        { id: 1, type: 'Resume', description: `Total ${resumesCount} resumes saved`, date: 'Just now' }
      ] 
    });

  } catch (error) {
    console.error("Dashboard Error:", error.message);
    res.status(500).json({ error: 'Server Error fetching dashboard data' });
  }
});

module.exports = router;