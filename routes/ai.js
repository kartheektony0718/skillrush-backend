const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/enhance', authMiddleware, async (req, res) => {
  const { type, text } = req.body;
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "Missing Groq API Key in .env" });
  }

  try {
    // 1. Initialize Groq (Just like in your test script)
    const groq = new Groq({ apiKey: apiKey });

    // 2. Prepare the prompt
    const prompt = `Rewrite this ${type} for a resume to be highly professional and ATS-optimized. 
    Return ONLY the rewritten text, no quotes, no extra formatting.
    Text: "${text}"`;

    // 3. Call the Llama 3 model
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.1-8b-instant", // The lightning-fast free model
    });

    // 4. Extract the response
    const enhancedText = chatCompletion.choices[0]?.message?.content || "";

    // 5. Send it back to the React frontend
    res.json({ enhancedText: enhancedText.trim() });
    
  } catch (error) {
    console.error("Groq AI Error:", error.message);
    res.status(500).json({ error: "Failed to connect to the Groq AI server." });
  }
});

module.exports = router;