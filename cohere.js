

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  console.log("HEYHEHYEHYEYEHYEYE");

    if (request.action === "callCohere"){ 
      try{
        console.log("oqweifjoiqwejipojqwoiejfioqwje");


      // const res = await fetch("https://api.cohere.ai/v1/generate", {
      //   method: "POST",
      //   headers: {
      //     "Authorization": "Bearer 3FXxtG0yNS11Gefy0wPobiqAZ16JTXPl8vaEgLLI",
      //     "Content-Type": "application/json"
      //   },
      //   body: JSON.stringify({
      //     model: "command",
      //     prompt: request.prompt,
      //     temperature: 0.7
      //   })
      // });
      // const data = await res.json();
      // console.log("SDKJKJADSFKJDFAS");
      sendResponse({ text: 'hey' });

      // sendResponse({ text: data.generations[0].text.trim() });
      }
      catch (error) {
        console.error("Cohere API error:", error);
        sendResponse({ error: error.message }); // Send an error response
      }
    }
    
    return true; // Allows async response

  });