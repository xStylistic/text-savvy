

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (request.action === "callCohere") {


// const { CohereClientV2 } = require('cohere-ai');
// const cohere = new CohereClientV2({
//   token: '',
// });
// (async () => {
//   const response = await cohere.chat({
//     model: 'command-a-03-2025',
//     messages: [
//       {
//         role: 'user',
//         content: 'what year is it currently?',
//       },
//     ],
//   });
//   console.log(response.message.content[0].text);
// })();

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