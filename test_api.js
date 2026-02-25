const API_KEY = "AIzaSyD-_naKh3R01wml4JWUNVcoliaEnDWlo0o";

const testPrompt = "호치민 여행에 대해 한 문단 작성해줘";

fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${API_KEY}`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    contents: [
      {
        parts: [
          {
            text: testPrompt,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.8,
      topP: 0.9,
      maxOutputTokens: 1000,
    },
  }),
})
  .then(res => res.json())
  .then(data => {
    console.log("API 응답:", JSON.stringify(data, null, 2));
  })
  .catch(err => {
    console.error("API 에러:", err);
  });
