const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdfParse = require('pdf-parse-new'); 
const Groq = require('groq-sdk');
const authMiddleware = require('../middleware/authMiddleware');
const Interview = require('../models/Interview'); 

const upload = multer({ storage: multer.memoryStorage() });

// --- ROUTE 1: Start Interview ---
router.post('/start', authMiddleware, upload.single('resume'), async (req, res) => {
  try {
    const { jobDescription, resumeText: pastedText } = req.body;
    
    if (!req.file && (!pastedText || !pastedText.trim())) {
      return res.status(400).json({ error: "Please upload a PDF or paste your resume text." });
    }
    if (!jobDescription || !jobDescription.trim()) {
      return res.status(400).json({ error: "Job description is required." });
    }
    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ error: "GROQ_API_KEY is missing." });
    }

    let finalResumeText = "";

    if (req.file) {
      try {
        const pdfData = await pdfParse(req.file.buffer); 
        finalResumeText = pdfData.text;
      } catch (pdfError) {
        return res.status(500).json({ error: `Could not read PDF text. Try pasting it instead.` });
      }
    } else {
      finalResumeText = pastedText;
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const prompt = `You are a strict technical hiring manager. 
    Resume Context: ${finalResumeText.substring(0, 1500)}
    Job Description: ${jobDescription}
    
    Act as the interviewer. Introduce yourself briefly and ask the FIRST challenging technical interview question based on their resume. 
    Keep it under 4 sentences.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.1-8b-instant", 
    });

    res.json({ question: chatCompletion.choices[0]?.message?.content });

  } catch (error) {
    res.status(500).json({ error: `Groq AI Error: ${error.message}` });
  }
});

// --- ROUTE 2: Evaluate Answer ---
router.post('/feedback', authMiddleware, async (req, res) => {
  const { question, answer, jobDescription } = req.body;
  if (!process.env.GROQ_API_KEY) return res.status(500).json({ error: "GROQ_API_KEY is missing." });

  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const prompt = `Interviewer Question: "${question}"
    Candidate Answer: "${answer}"
    Target Job: "${jobDescription}"

    Evaluate the candidate's answer. 
    You MUST respond in valid JSON format with EXACTLY these two keys:
    "feedback": "A string containing a score out of 10 and brief constructive feedback."
    "nextQuestion": "A string containing the NEXT technical interview question to ask the candidate."`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.1-8b-instant",
      response_format: { type: "json_object" } 
    });

    const result = JSON.parse(chatCompletion.choices[0]?.message?.content);

    res.json({ feedback: result.feedback, nextQuestion: result.nextQuestion });
    
  } catch (error) {
    res.status(500).json({ error: `Feedback AI Error: ${error.message}` });
  }
});

// --- ROUTE 3: Save Interview ---
router.post('/save', authMiddleware, async (req, res) => {
  try {
    const { jobDescription, messages } = req.body;
    const newInterview = new Interview({
      user: req.user.id,
      jobDescription,
      messages
    });
    await newInterview.save();
    res.json({ message: "Interview saved successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Failed to save interview to database." });
  }
});

// --- ROUTE 4: Fetch Interview History 🚀 ---
router.get('/history', authMiddleware, async (req, res) => {
  try {
    // Fetches all interviews for the logged-in user, sorted newest first
    const history = await Interview.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(history);
  } catch (error) {
    console.error("History Fetch Error:", error);
    res.status(500).json({ error: "Failed to fetch interview history." });
  }
});

module.exports = router;