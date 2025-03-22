// Inject fonts
const style = document.createElement('style');
style.textContent = `
  @font-face {
    font-family: 'OpenDyslexic';
    src: url('${chrome.runtime.getURL('fonts/OpenDyslexic-Regular.otf')}') format('opentype');
    font-weight: normal;
    font-style: normal;
  }
  @font-face {
    font-family: 'Nunito';
    src: url('${chrome.runtime.getURL('fonts/Nunito-Medium.ttf')}') format('truetype');
    font-weight: normal;
    font-style: normal;
  }
`;
document.head.appendChild(style);

let originalStyles = {};

function captureOriginalStyles() {
      originalStyles.body = {
        fontFamily: document.body.style.fontFamily,
        fontSize: document.body.style.fontSize,
        fontSpacing: document.body.style.letterSpacing
      };
    
      // Capture the original font family and size of all elements
      originalStyles.elements = [];
      const allElements = document.querySelectorAll("*:not(script):not(style)");
      allElements.forEach(el => {
      const style = window.getComputedStyle(el);
      originalStyles.elements.push({
      element: el,
      fontFamily: style.fontFamily,
      fontSize: style.fontSize,
      fontSpacing: style.letterSpacing
    });
  });
}

captureOriginalStyles();

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

    if (request.action === "resetToDefault") {
      resetToOriginalStyles(); // Revert to original styles
    }

    function resetToOriginalStyles() {
      // Restore the original font family and size of the body
      document.body.style.fontFamily = originalStyles.body.fontFamily;
      document.body.style.fontSize = originalStyles.body.fontSize;
      document.body.style.letterSpacing = originalStyles.body.fontSpacing;
    
      // Restore the original font family and size of all elements
      originalStyles.elements.forEach(item => {
        item.element.style.fontFamily = item.fontFamily;
        item.element.style.fontSize = item.fontSize;
        item.element.style.letterSpacing = item.fontSpacing;
      });
    
      // Remove any highlighted text (if applicable)
      const highlightedSpans = document.querySelectorAll("span[style*='background: #ffff99']");
      highlightedSpans.forEach(span => {
        span.outerHTML = span.innerHTML; // Remove the highlight
      });
    }

    if (request.action === "updateFont") {
        applyFontToAll(request.font, request.size, request.spacing);
      }
      
      function applyFontToAll(font, size, spacing) {
        document.body.style.fontFamily = font;
        document.body.style.fontSize = size + "px";
        console.log("Font: " + document.body.style.fontFamily);
        
        document.body.style.letterSpacing = spacing + "px";
      
        const allElements = document.querySelectorAll("*:not(script):not(style)");
      
        allElements.forEach(el => {
          const style = window.getComputedStyle(el);
          const isVisible = style.display !== "none" && style.visibility !== "hidden";
          if (isVisible) {
            el.style.fontFamily = font;
            el.style.fontSize = size + "px";
            el.style.letterSpacing = spacing + "px";
          }
        });
      }

      if (request.action === "toggleBold") {
        toggleBoldAll(request.bold);
      }
      
      function toggleBoldAll(applyBold) {
        const allElements = document.querySelectorAll("*:not(script):not(style)");
      
        allElements.forEach(el => {
          const style = window.getComputedStyle(el);
          const isVisible = style.display !== "none" && style.visibility !== "hidden";
          if (isVisible) {
            el.style.fontWeight = applyBold ? "bold" : "normal";
          }
        });
      }

      if (request.action === "translatePage") {
        translateVisibleTextToLanguage(request.language);
      }

      function translateVisibleTextToLanguage(targetLanguage) {
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
          acceptNode: (node) => {
            if (!node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
            if (!node.parentElement || node.parentElement.tagName === "SCRIPT") return NodeFilter.FILTER_REJECT;
            return NodeFilter.FILTER_ACCEPT;
          }
        });
      
        const nodes = [];
        let currentNode;
        while (currentNode = walker.nextNode()) {
          nodes.push(currentNode);
        }
      
        nodes.forEach(node => {
          const original = node.nodeValue.trim();
          const prompt = `Translate the following text to ${targetLanguage}:\n\n${original}`;
      
          chrome.runtime.sendMessage({ action: "callCohere", prompt }, (response) => {
            if (response?.text) {
              const translated = response.text.trim();
              const span = document.createElement("span");
              span.style.backgroundColor = "#ffffcc"; // highlight
              span.textContent = translated;
              node.parentNode.replaceChild(span, node);
            }
          });
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