const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const Resume = require('../models/Resume');
const Profile = require('../models/Profile');

// GET ROUTE: Fetch the user's saved resume
router.get('/', authMiddleware, async (req, res) => {
  try {
    let resume = await Resume.findOne({ userId: req.user.id });
    
    if (!resume) {
      const profile = await Profile.findOne({ userId: req.user.id });
      return res.json({
        fullName: profile?.full_name || "",
        email: "", 
        phone: profile?.phone || "",
        location: profile?.location || "",
        github_url: profile?.github_url || "",     
        linkedin_url: profile?.linkedin_url || "", 
        summary: profile?.bio || "",
        skills: profile?.skills?.join(", ") || "",
        experience: [],
        education: []
      });
    }
    
    res.json(resume);
  } catch (error) {
    res.status(500).json({ error: 'Server Error fetching resume' });
  }
});

// POST ROUTE: Save the resume
router.post('/', authMiddleware, async (req, res) => {
  try {
    const resumeData = { ...req.body, userId: req.user.id };
    const resume = await Resume.findOneAndUpdate(
      { userId: req.user.id },
      { $set: resumeData },
      { new: true, upsert: true }
    );
    res.json({ message: "Resume saved successfully!", resume });
  } catch (error) {
    res.status(500).json({ error: 'Server Error saving resume' });
  }
});

module.exports = router;