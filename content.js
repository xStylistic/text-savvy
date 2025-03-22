// Inject fonts
const style = document.createElement('style');
style.textContent = `
  @font-face {
    font-family: 'OpenDyslexic';
    src: url('${chrome.runtime.getURL('fonts/OpenDyslexic-Regular.otf')}') format('opentype');
    font-weight: normal;
    font-style: normal;
  }
`;
document.head.appendChild(style);

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
        applyFontToAll(request.font, request.size);
      }
      
      function applyFontToAll(font, size) {
        document.body.style.fontFamily = font;
        document.body.style.fontSize = size + "px";
        console.log("Font: " + document.body.style.fontFamily);
        
        const allElements = document.querySelectorAll("*:not(script):not(style)");
      
        allElements.forEach(el => {
          const style = window.getComputedStyle(el);
          const isVisible = style.display !== "none" && style.visibility !== "hidden";
          if (isVisible) {
            el.style.fontFamily = font;
            el.style.fontSize = size + "px";
          }
        });
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