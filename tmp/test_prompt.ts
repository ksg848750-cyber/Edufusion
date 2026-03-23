import { generateExplanationPrompt, SYSTEM_PERSONA } from '../src/lib/prompt';
import { callGroqJSON, MODEL_SMART } from '../src/lib/groq';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.join(__dirname, '../.env.local') });

async function testPrompt() {
  const topic = "Necessary conditions for deadlock";
  const interest = "cricket";
  const mode = "exam";
  const language = "english";

  console.log(`--- TESTING PROMPT FOR: ${topic} ---`);

  const prompt = generateExplanationPrompt(topic, interest, mode, language);
  
  try {
    const result = await callGroqJSON<any>(prompt, MODEL_SMART, SYSTEM_PERSONA);
    console.log("SUCCESS!");
    console.log("Topic:", topic);
    console.log("Deep Dive:\n", result.deep_dive);
    
    const lines = (result.deep_dive || '').split('\n').filter((l: string) => l.trim());
    console.log(`Steps found: ${lines.length}`);
    
    const conditions = ["Mutual Exclusion", "Hold and Wait", "No Preemption", "Circular Wait"];
    const foundAll = conditions.every(c => 
      result.deep_dive.toLowerCase().includes(c.toLowerCase()) || 
      result.technical.toLowerCase().includes(c.toLowerCase())
    );
    
    if (foundAll) {
      console.log("VERIFIED: All 4 conditions are present.");
    } else {
      console.log("FAILED: Some conditions were skipped.");
      conditions.forEach(c => {
        if (!(result.deep_dive.toLowerCase().includes(c.toLowerCase()) || result.technical.toLowerCase().includes(c.toLowerCase()))) {
          console.log(`- Missing: ${c}`);
        }
      });
    }

  } catch (e) {
    console.error("Test failed:", e);
  }
}

testPrompt();
