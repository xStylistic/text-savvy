// Apply AI response to selected text
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "modifyPageText") {
      const selection = window.getSelection().toString();
      if (!selection) return;
  
      const prompt = request.prompt.replace("{{text}}", selection);
      chrome.runtime.sendMessage({ action: "callCohere", prompt }, (response) => {
        if (!response || !response.text) return;
        const newText = `<span style="background: #ffff99;">${response.text}</span>`;
        const range = window.getSelection().getRangeAt(0);
        range.deleteContents();
        const temp = document.createElement("div");
        temp.innerHTML = newText;
        range.insertNode(temp.firstChild);
      });
    }
  
    if (request.action === "updateFont") {
      document.body.style.fontFamily = request.font;
      document.body.style.fontSize = request.size + "px";
    }
  });
  
  // Auto-mode for selected text
  chrome.storage.sync.get("autoMode", ({ autoMode }) => {
    if (autoMode) {
      document.addEventListener("mouseup", () => {
        const selected = window.getSelection().toString().trim();
        if (selected.length > 0) {
          const prompt = "Simplify and translate the following into English:\n\n" + selected;
          chrome.runtime.sendMessage({ action: "callCohere", prompt }, (response) => {
            if (!response || !response.text) return;
            const newText = `<span style="background: #ffff99;">${response.text}</span>`;
            const range = window.getSelection().getRangeAt(0);
            range.deleteContents();
            const temp = document.createElement("div");
            temp.innerHTML = newText;
            range.insertNode(temp.firstChild);
          });
        }
      });
    }
  });