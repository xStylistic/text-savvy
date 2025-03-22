chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (request.action === "callCohere") {
      const res = await fetch("https://api.cohere.ai/v1/generate", {
        method: "POST",
        headers: {
          "Authorization": "Bearer YOUR_API_KEY",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "command",
          prompt: request.prompt,
          max_tokens: 100,
          temperature: 0.7
        })
      });
      const data = await res.json();
      sendResponse({ text: data.generations[0].text.trim() });
    }
  
    return true; // Allows async response
  });