const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    unique: true // One profile per user
  },
  full_name: { type: String, default: "" },
  bio: { type: String, default: "" },
  phone: { type: String, default: "" },
  location: { type: String, default: "" },
  linkedin_url: { type: String, default: "" },
  github_url: { type: String, default: "" },
  website_url: { type: String, default: "" },
  skills: { type: [String], default: [] } // Array of strings
}, { timestamps: true });

module.exports = mongoose.model('Profile', ProfileSchema);