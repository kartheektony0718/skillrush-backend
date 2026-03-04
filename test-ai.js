require('dotenv').config();
const Groq = require('groq-sdk');

async function runTest() {
  console.log("--- INITIALIZING GROQ AI TEST ---");
  const key = process.env.GROQ_API_KEY;

  if (!key) {
    console.log("❌ ERROR: Missing GROQ_API_KEY in .env");
    return;
  }

  try {
    const groq = new Groq({ apiKey: key });
    console.log("⏳ Sending request to Groq (Llama 3)...");

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: "Respond with exactly two words: 'Connection successful'." }],
      model: "llama-3.1-8b-instant", 
    });

    console.log("✅ SUCCESS! AI says:", chatCompletion.choices[0].message.content.trim());
    
  } catch (error) {
    console.log("❌ FAIL!", error.message);
  }
}

runTest();