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

// Function to call Cohere API
async function callCohere(prompt) {
  try {
    const res = await fetch("https://api.cohere.ai/v1/generate", {
      method: "POST",
      headers: {
        Authorization: "Bearer <APIKEY>",
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

// Apply AI response to selected text
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.table(request);
  if (request.action === "modifyPageText") {
    const selection = window.getSelection().toString();
    if (!selection) return;

    const prompt = request.prompt.replace("{{text}}", selection);
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
    translateVisibleTextToLanguage(request.language);
  }

  function translateVisibleTextToLanguage(targetLanguage) {
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          if (!node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
          if (!node.parentElement || node.parentElement.tagName === "SCRIPT")
            return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        },
      }
    );

    const nodes = [];
    let currentNode;
    while ((currentNode = walker.nextNode())) {
      nodes.push(currentNode);
    }

    nodes.forEach((node) => {
      const original = node.nodeValue.trim();
      const prompt = `Translate the following text to ${targetLanguage}:\n\n${original}`;

      callCohere(prompt).then((response) => {
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
        const prompt =
          "Simplify and translate the following into English:\n\n" + selected;
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
    });
  }
});
