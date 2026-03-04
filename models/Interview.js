const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  jobDescription: { 
    type: String, 
    required: true 
  },
  messages: { 
    type: Array, 
    default: [] 
  }, // This will store the entire chat history!
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Interview', interviewSchema);