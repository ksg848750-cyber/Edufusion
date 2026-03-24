const Groq = require('groq-sdk');
require('dotenv').config({ path: '.env.local' });

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function test() {
  const prompt = `Generate a 5-question multiple-choice quiz about the following topics: Introduction to Operating Systems. LENS: cricket. REQUIRED JSON FORMAT: { "questions": [ { "question": "...", "options": ["A", "B", "C", "D"], "correctAnswer": "B", "explanation": "..." } ] }`;
  
  try {
    const res = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: 'Always respond with valid JSON only.' }, 
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' }
    });
    console.log('Result:', res.choices[0].message.content);
  } catch (e) {
    console.error('Error:', e);
  }
}

test();
