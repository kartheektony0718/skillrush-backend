const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile');
const authMiddleware = require('../middleware/authMiddleware');

// GET ROUTE: Fetch the current user's profile
router.get('/', authMiddleware, async (req, res) => {
  try {
    let profile = await Profile.findOne({ userId: req.user.id });
    
    // If the user hasn't saved a profile yet, return an empty template
    if (!profile) {
      return res.json({ 
        full_name: "", bio: "", phone: "", location: "", 
        linkedin_url: "", github_url: "", website_url: "", skills: [] 
      });
    }
    
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: 'Server Error fetching profile' });
  }
});

// POST ROUTE: Update or Create the user's profile
router.post('/', authMiddleware, async (req, res) => {
  try {
    // Add the user ID from the verified token to the profile data
    const profileFields = { ...req.body, userId: req.user.id };

    // Find the profile by userId and update it. 
    // If it doesn't exist yet, 'upsert: true' will create it!
    const profile = await Profile.findOneAndUpdate(
      { userId: req.user.id },
      { $set: profileFields },
      { new: true, upsert: true }
    );

    res.json({ message: "Profile updated successfully!", profile });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error updating profile' });
  }
});

module.exports = router;