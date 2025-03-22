// Elements
const dyslexiaBtn = document.getElementById("dyslexia");
const highContrastBtn = document.getElementById("highContrast");
const translateBtn = document.getElementById("translate");

const fontSelect = document.getElementById("fontSelect");
const fontSizeSlider = document.getElementById("fontSizeSlider");
const fontSizeValue = document.getElementById("fontSizeValue");

const fontSpacingSlider = document.getElementById("fontSpacingSlider");
const fontSpacingValue = document.getElementById("fontSpacingValue");

const languageSelect = document.getElementById("languageSelect");
const autoModeCheckbox = document.getElementById("autoMode");

const toggleBoldBtn = document.getElementById("toggleBold");

// --- Button Actions ---
let isBold = false;
toggleBoldBtn.addEventListener("click", () => {
  isBold = !isBold;

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {
      action: "toggleBold",
      bold: isBold
    });
  });

  toggleBoldBtn.textContent = isBold ? "Unbold Text" : "Bold Text";
});

// --- Font + Spacing Sliders ---

fontSizeSlider.addEventListener("input", () => {
  fontSizeValue.textContent = fontSizeSlider.value + "px";
  applyFontChanges();
});

fontSelect.addEventListener("change", applyFontChanges);

fontSpacingSlider.addEventListener("input", () => {
  fontSpacingValue.textContent = fontSpacingSlider.value + "px";
  applyFontChanges();
});

function applyFontChanges() {
  const font = fontSelect.value;
  const size = fontSizeSlider.value;
  const spacing = fontSpacingSlider.value;

  chrome.storage.sync.set({ font, size, spacing });

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {
      action: "updateFont",
      font,
      size,
      spacing
    });
  });
}

// --- Auto Mode Toggle ---

autoModeCheckbox.addEventListener("change", (e) => {
  chrome.storage.sync.set({ autoMode: e.target.checked });
});

// --- Send Prompt Helper ---

function sendPrompt(promptText) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {
      action: "modifyPageText",
      prompt: promptText
    });
  });
}

// --- Restore Stored Values on Load ---



window.onload = () => {
  chrome.storage.sync.get(["language", "autoMode"], ({ language, autoMode }) => {
    if (language) languageSelect.value = language;
    autoModeCheckbox.checked = !!autoMode;
  });

  // Save selected language when changed
  languageSelect.addEventListener("change", () => {
    chrome.storage.sync.set({ language: languageSelect.value });
  });

  // Set initial display values
  fontSizeValue.textContent = fontSizeSlider.value + "px";
  fontSpacingValue.textContent = fontSpacingSlider.value + "px";

  // Loading saved settings
  chrome.storage.sync.get(["font", "size", "spacing"], (data) => {
  if (data.font) {
    fontSelect.value = data.font; // Set the selected font
  }
  if (data.size) {
    fontSizeSlider.value = data.size; // Set the font size slider
    fontSizeValue.textContent = data.size + "px"; // Update the font size display
  }
  if(data.spacing) {
    fontSpacingSlider.value = data.spacing;
    fontSpacingValue.textContent = data.spacing + "px";
  }
});

applyFontChanges();
};