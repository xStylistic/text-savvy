// content.js

// Inject fonts
const style = document.createElement("style");
style.textContent = `
  @font-face {
    font-family: 'OpenDyslexic';
    src: url('${chrome.runtime.getURL(
      "fonts/OpenDyslexic-Regular.otf"
    )}') format('opentype');
    font-weight: normal;
    font-style: normal;
  }
`;
document.head.appendChild(style);

let originalStyles = {};
run_once = false;

function captureOriginalStyles() {
  originalStyles.body = {
    fontFamily: document.body.style.fontFamily,
    fontSize: document.body.style.fontSize,
    fontSpacing: document.body.style.letterSpacing,
  };

  // Capture the original font family and size of all elements
  originalStyles.elements = [];
  const allElements = document.querySelectorAll("*:not(script):not(style)");
  allElements.forEach((el) => {
    const style = window.getComputedStyle(el);
    const isVisible = style.display !== "none" && style.visibility !== "hidden";
    if (isVisible) {
      originalStyles.elements.push({
        element: el,
        fontFamily: style.fontFamily,
        fontSize: style.fontSize,
        fontSpacing: style.letterSpacing,
      });
    }
  });
}

if (run_once == false) {
  captureOriginalStyles();
  run_once = true;
}

// Function to call Cohere API
async function callCohere(prompt) {
  try {
    const res = await fetch("https://api.cohere.ai/v2/generate", {
      method: "POST",
      headers: {
        Authorization: "Bearer <<APIKEY>>",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "command",
        prompt: prompt,
        temperature: 0.7,
      }),
    });
    const data = await res.json();
    return { text: data.generations[0].text.trim() };
  } catch (error) {
    console.error("Cohere API error:", error);
    return { error: error.message };
  }
}

// Call Gemini API
async function callGemini(prompt) {
  try {
    const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?", {
      method: "POST",
      headers: {
        Authorization: "Bearer AIzaSyAgepd3bYBxrCkhDzXRjI5uyAhwOhtIFWI",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "command",
        prompt: prompt,
        temperature: 0.7,
      }),
    });
    const data = await res.json();
    return { text: data.generations[0].text.trim() };
  } catch (error) {
    console.error("Gemini API error:", error);
    return { error: error.message };
  }
}

// Apply AI response to selected text
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.table(request);

  if (request.action === "modifyPageText") {
    const selection = window.getSelection().toString();
    if (!selection) return;

    const prompt = request.prompt.replace("{{text}}", selection);
    callCohere(prompt).then((response) => {
      if (!response || !response.text) return;
      const newText = `<span style="background:rgba(132, 177, 132, 0.03);">${response.text}</span>`;
      const range = window.getSelection().getRangeAt(0);
      range.deleteContents();
      const temp = document.createElement("div");
      temp.innerHTML = newText;
      range.insertNode(temp.firstChild);
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

    allElements.forEach((el) => {
      const style = window.getComputedStyle(el);
      const isVisible =
        style.display !== "none" && style.visibility !== "hidden";
      if (isVisible) {
        el.style.fontFamily = font;
        el.style.fontSize = size + "px";
        el.style.letterSpacing = spacing + "px";
      }
    });
  }
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
    originalStyles.elements.forEach((item) => {
      item.element.style.fontFamily = item.fontFamily;
      item.element.style.fontSize = item.fontSize;
      item.element.style.letterSpacing = item.fontSpacing;
    });

    // Remove any highlighted text 
    const highlightedSpans = document.querySelectorAll(
      "span[style*='background: #ffff99']"
    );
    highlightedSpans.forEach((span) => {
      span.outerHTML = span.innerHTML; 
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

    allElements.forEach((el) => {
      const style = window.getComputedStyle(el);
      const isVisible =
        style.display !== "none" && style.visibility !== "hidden";
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

    allElements.forEach((el) => {
      const style = window.getComputedStyle(el);
      const isVisible =
        style.display !== "none" && style.visibility !== "hidden";
      if (isVisible) {
        el.style.fontWeight = applyBold ? "bold" : "normal";
      }
    });
  }

  if (request.action === "translatePage") {
    const selection = window.getSelection().toString().trim();
    if (!selection) return;
    const prompt = `Translate the following text to ${request.language}:\n\n${selection}\n\nONLY OUTPUT THE TRANSLATED TEXT`;
    
    callCohere(prompt).then((response) => {
      if (!response || !response.text) return;
      const newText = `<span style="background: #ffff99;">${response.text}</span>`;
      const range = window.getSelection().getRangeAt(0);
      range.deleteContents();
      const temp = document.createElement("div");
      temp.innerHTML = newText;
      range.insertNode(temp.firstChild);
    });
  }

  let colorblindModeEnabled = false;
 
 chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
   if (request.action === 'toggleColorblindMode') {
     colorblindModeEnabled = !colorblindModeEnabled;
     applyColorblindMode(colorblindModeEnabled);
   }
 });
 
 function applyColorblindMode(enabled) {
   if (enabled) {
     // Apply colorblind mode styles
     document.body.style.filter = 'contrast(105%) saturate(200%)';
   } else {
     // Remove colorblind mode styles
     document.body.style.filter = 'none';
   }
 }
 
 chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
   if (request.action === 'toggleColorblindMode') {
     applyColorblindMode(request.enabled);
   }
 });

},);