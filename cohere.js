// chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    // if (request.action === "callCohere") {

      const { CohereClientV2 } = require('cohere-ai');
      const cohere = new CohereClientV2({
        token: 'WUAo4EcWA7WJxL9fX9S8J40X8tq2iyyXameQEQIz',
      });
      (async () => {
        const response = await cohere.chat({
          model: 'command-a-03-2025',
          messages: [
            {
              role: 'user',
              content: 'who is the president of the philippines',
            },
          ],
        });
        console.log(response.message.content);
      })();
      // const res = await fetch("https://api.cohere.ai/v1/generate", {
      //   method: "POST",
      //   headers: {
      //     "Authorization": "Bearer YOUR_API_KEY",
      //     "Content-Type": "application/json"
      //   },
      //   body: JSON.stringify({
      //     model: "command",
      //     prompt: request.prompt,
      //     max_tokens: 100,
      //     temperature: 0.7
      //   })
      // });
      // const data = await res.json();
      // sendResponse({ text: data.generations[0].text.trim() });
  //   }
  
  //   return true; // Allows async response
  // });