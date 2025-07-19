require('dotenv').config()
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testGemini() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Hello, test connection");
    console.log('✅ Gemini API connected successfully!');
    console.log('Response:', result.response.text());
  } catch (error) {
    console.error('❌ Gemini API error:', error.message);
  }
}

testGemini();