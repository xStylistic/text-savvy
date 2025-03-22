document.getElementById("translate").addEventListener("click", () => {
    sendPrompt("Translate this to English:\n\n{{text}}");
  });
  
  document.getElementById("simplify").addEventListener("click", () => {
    sendPrompt("Rewrite the following to be simpler and easier to read:\n\n{{text}}");
  });
  
  function sendPrompt(promptText) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: "modifyPageText",
        prompt: promptText
      });
    });
  }
  
  document.getElementById("ocrTranslate").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        files: ["ocr.js"]
      });
    });
  });
  
  const fontSelect = document.getElementById("fontSelect");
  const fontSizeSlider = document.getElementById("fontSizeSlider");
  const fontSizeValue = document.getElementById("fontSizeValue");
  
  fontSizeSlider.addEventListener("input", () => {
    fontSizeValue.textContent = fontSizeSlider.value + "px";
    applyFontChanges();
  });
  
  fontSelect.addEventListener("change", applyFontChanges);
  
  function applyFontChanges() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: "updateFont",
        font: fontSelect.value,
        size: fontSizeSlider.value
      });
    });
  }
  
  // Auto mode toggle
  const autoModeCheckbox = document.getElementById("autoMode");
  autoModeCheckbox.addEventListener("change", (e) => {
    chrome.storage.sync.set({ autoMode: e.target.checked });
  });
  
  // Restore auto mode setting
  chrome.storage.sync.get("autoMode", ({ autoMode }) => {
    autoModeCheckbox.checked = !!autoMode;
  });