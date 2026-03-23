import fetch from 'node-fetch';

async function testExplanation() {
  const url = 'http://localhost:3000/api/explain';
  const body = {
    topic: "Necessary conditions for deadlock",
    interest: "cricket",
    mode: "exam",
    language: "english"
  };

  console.log("Testing with topic:", body.topic);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Mocking auth if necessary, but locally we might need a token
        // For testing, I'll just run the prompt directly via a small script if I can't call the API
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    console.log("Response:", JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("Test failed:", e);
  }
}

// Since I can't easily get a token for the local API, I'll just run the prompt through Groq directly
// to see what it generates.
