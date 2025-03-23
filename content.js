// content.js

// Inject fonts
const style = document.createElement("style");
style.textContent = `
  @font-face {
    font-family: 'Boldonse';
    src: url('${chrome.runtime.getURL("fonts/Boldonse-Regular.ttf")}') format('truetype');
    font-weight: normal;
    font-style: normal;
  }
  @font-face {
    font-family: 'ComicSans';
    src: url('${chrome.runtime.getURL("fonts/ComicSansMS.ttf")}') format('truetype');
    font-weight: normal;
    font-style: normal;
  }
  @font-face {
    font-family: 'Nunito';
    src: url('${chrome.runtime.getURL(
      "fonts/Nunito-Medium.ttf"
    )}') format('truetype');
    font-weight: normal;
    font-style: normal;
  }
  @font-face {
    font-family: 'OpenDyslexic';
    src: url('${chrome.runtime.getURL(
      "fonts/OpenDyslexic-Regular.otf"
    )}') format('opentype');
    font-weight: normal;
    font-style: normal;
  }
  @font-face {
    font-family: 'Roboto';
    src: url('${chrome.runtime.getURL(
      "fonts/Roboto-Regular.ttf"
    )}') format('truetype');
    font-weight: normal;
    font-style: normal;
  }
  @font-face {
    font-family: 'SourGummy';
    src: url('${chrome.runtime.getURL("fonts/SourGummy-Regular.ttf")}') format('truetype');
    font-weight: normal;
    font-style: normal;
  }
`;
document.head.appendChild(style);

// Variable to track speech synthesis
let speechSynthesisActive = false;

let originalStyles = {};
run_once = false;
// Define colorblindModeEnabled in the global scope
let colorblindModeEnabled = false;

// Helper function to save current selection
function saveSelection() {
  if (window.getSelection) {
    const sel = window.getSelection();
    if (sel.getRangeAt && sel.rangeCount) {
      return sel.getRangeAt(0);
    }
  }
  return null;
}

// Helper function to restore selection
function restoreSelection(range) {
  if (range) {
    if (window.getSelection) {
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }
}

// Text-to-speech function
function speakText(text) {
  // Stop any ongoing speech
  stopSpeech();

  // Create speech synthesis utterance
  const utterance = new SpeechSynthesisUtterance(text);

  // Get saved voice preferences or use defaults
  chrome.storage.sync.get(
    ["speechVoice", "speechRate", "speechPitch"],
    (data) => {
      // Set default values if not found
      let voiceName = data.speechVoice || "";
      let rate = data.speechRate || 1;
      let pitch = data.speechPitch || 1;

      // Set voice if specified
      if (voiceName) {
        const voices = window.speechSynthesis.getVoices();
        const voice = voices.find((v) => v.name === voiceName);
        if (voice) {
          utterance.voice = voice;
        }
      }

      // Set speech rate and pitch
      utterance.rate = rate;
      utterance.pitch = pitch;

      // Add event listeners
      utterance.onstart = () => {
        speechSynthesisActive = true;
        console.log("Speech started");
      };

      utterance.onend = () => {
        speechSynthesisActive = false;
        console.log("Speech ended");
      };

      utterance.onerror = (event) => {
        speechSynthesisActive = false;
        console.error("Speech error:", event);
      };

      // Speak the text
      window.speechSynthesis.speak(utterance);
    }
  );
}

// Stop ongoing speech
function stopSpeech() {
  if (speechSynthesisActive) {
    window.speechSynthesis.cancel();
    speechSynthesisActive = false;
  }
}

function captureOriginalStyles() {
  originalStyles.body = {
    fontFamily: document.body.style.fontFamily,
    fontSize: document.body.style.fontSize,
    fontSpacing: document.body.style.letterSpacing,
    fontWeight: document.body.style.fontWeight,
    filter: document.body.style.filter,
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
        fontWeight: style.fontWeight,
      });
    }
  });

  // Save HTML state
  originalStyles.html = document.documentElement.innerHTML;
}

if (run_once == false) {
  captureOriginalStyles();
  run_once = true;
}

// Function to apply colorblind mode
function applyColorblindMode(enabled) {
  colorblindModeEnabled = enabled;
  console.log("Colorblind mode:", enabled ? "enabled" : "disabled");

  if (enabled) {
    // Apply colorblind mode styles
    document.body.style.filter = "contrast(105%) saturate(200%)";
  } else {
    // Remove colorblind mode styles
    document.body.style.filter = "none";
  }
}

// Function to call Cohere API
async function callCohere(prompt) {
  try {
    const res = await fetch("https://api.cohere.ai/v2/generate", {
      method: "POST",
      headers: {
        Authorization: "Bearer xiGs4S1Cm2Nlcq4JHPhieiP6MQPViYt4fjlu2bjv",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "command-r-plus",
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

    // Save the current selection range
    const savedRange = saveSelection();
    const selectedText = selection; // Store the selected text

    const prompt = request.prompt.replace("{{text}}", selectedText);
    callCohere(prompt).then((response) => {
      if (!response || !response.text) return;

      // Restore the saved selection range
      restoreSelection(savedRange);

      // Now apply the modification
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

  if (request.action === "speakText") {
    const selection = window.getSelection().toString().trim();
    if (selection) {
      speakText(selection);
    }
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

  if (request.action === "resetToDefault") {
    // Stop any ongoing speech
    stopSpeech();

    resetToOriginalStyles(); // Revert to original styles
  }

  function resetToOriginalStyles() {
    // Restore the original font family and size of the body
    document.body.style.fontFamily = originalStyles.body.fontFamily;
    document.body.style.fontSize = originalStyles.body.fontSize;
    document.body.style.letterSpacing = originalStyles.body.fontSpacing;
    document.body.style.fontWeight = originalStyles.body.fontWeight;
    document.body.style.filter = originalStyles.body.filter;

    // Restore the original font family and size of all elements
    originalStyles.elements.forEach((item) => {
      try {
        if (item.element && item.element.style) {
          item.element.style.fontFamily = item.fontFamily;
          item.element.style.fontSize = item.fontSize;
          item.element.style.letterSpacing = item.fontSpacing;
          item.element.style.fontWeight = item.fontWeight;
        }
      } catch (e) {
        console.log("Error resetting element:", e);
      }
    });

    // Remove all highlighted spans with any background style
    const allSpans = document.querySelectorAll("span[style*='background']");
    allSpans.forEach((span) => {
      span.outerHTML = span.innerHTML;
    });

    // Additional cleanup for colorblind mode
    colorblindModeEnabled = false;
    document.body.style.filter = "none";
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

    // Save the current selection range
    const savedRange = saveSelection();
    const selectedText = selection; // Store the selected text

    const prompt = `Translate the following text to ${request.language}:\n\n${selectedText}\n\nONLY OUTPUT THE TRANSLATED TEXT`;

    callCohere(prompt).then((response) => {
      if (!response || !response.text) return;

      // Restore the saved selection range
      restoreSelection(savedRange);

      // Now apply the translation
      const newText = `<span style="background: #ffff99;">${response.text}</span>`;
      const range = window.getSelection().getRangeAt(0);
      range.deleteContents();
      const temp = document.createElement("div");
      temp.innerHTML = newText;
      range.insertNode(temp.firstChild);
    });
  }

  if (request.action === "toggleColorblindMode") {
    applyColorblindMode(!colorblindModeEnabled);
    // Send response back to popup to update button text if needed
    sendResponse({ colorblindModeEnabled: colorblindModeEnabled });
    return true; // Indicate we'll send a response asynchronously
  }
});
