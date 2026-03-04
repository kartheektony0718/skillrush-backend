const mongoose = require('mongoose');

const ExperienceSchema = new mongoose.Schema({
  title: String,
  company: String,
  duration: String,
  description: String
});

const EducationSchema = new mongoose.Schema({
  degree: String,
  institution: String,
  year: String
});

const ResumeSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    unique: true 
  },
  fullName: { type: String, default: "" },
  email: { type: String, default: "" },
  phone: { type: String, default: "" },
  location: { type: String, default: "" },
  github_url: { type: String, default: "" },   
  linkedin_url: { type: String, default: "" }, 
  summary: { type: String, default: "" },
  experience: { type: [ExperienceSchema], default: [] },
  education: { type: [EducationSchema], default: [] },
  skills: { type: String, default: "" }
}, { timestamps: true });

module.exports = mongoose.model('Resume', ResumeSchema);