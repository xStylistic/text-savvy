// Elements
const dyslexiaBtn = document.getElementById("dyslexia");
const colorBlindBtn = document.getElementById("colorblindMode");
const translatePageBtn = document.getElementById("translate");
const simplifyBtn = document.getElementById("simplify");
const resetBtn = document.getElementById("reset");

const fontSelect = document.getElementById("fontSelect");
const fontSizeSlider = document.getElementById("fontSizeSlider");
const fontSizeValue = document.getElementById("fontSizeValue");

const fontSpacingSlider = document.getElementById("fontSpacingSlider");
const fontSpacingValue = document.getElementById("fontSpacingValue");

const languageSelect = document.getElementById("languageSelect");
const autoModeCheckbox = document.getElementById("autoMode");

const toggleBoldBtn = document.getElementById("toggleBold");

// --- Restore Stored Values on Load ---

window.onload = () => {
  chrome.storage.sync.get(
    ["language", "autoMode"],
    ({ language, autoMode }) => {
      if (language) languageSelect.value = language;
      autoModeCheckbox.checked = !!autoMode;
    }
  );

  // Save selected language when changed
  languageSelect.addEventListener("change", () => {
    chrome.storage.sync.set({ language: languageSelect.value });
  });

  // Set initial display values
  fontSizeValue.textContent = fontSizeSlider.value + "px";
  fontSpacingValue.textContent = fontSpacingSlider.value + "px";

  // Loading saved settings
  chrome.storage.sync.get(["font", "size", "spacing", "isBold"], (data) => {
    if (data.font) {
      fontSelect.value = data.font; // Set the selected font
    }
    if (data.size) {
      fontSizeSlider.value = data.size; // Set the font size slider
      fontSizeValue.textContent = data.size + "px"; // Update the font size display
    }
    if (data.spacing) {
      fontSpacingSlider.value = data.spacing;
      fontSpacingValue.textContent = data.spacing + "px";
    }
    if (data.isBold) {
      isBold = data.isBold;
      toggleBoldBtn.textContent = isBold ? "unbold" : "bold";
      applyBoldState();
    }
    if (data.font && data.size && data.spacing) {
      applyFontChanges();
    }
  });
};


// --- Button Actions ---


// colorBlindBtn.addEventListener('click', () => {
//   chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//     chrome.tabs.sendMessage(tabs[0].id, { action: 'toggleColorblindMode' });
//   });
// });

// Update button text based on colorblind mode state
chrome.storage.sync.get(['colorblindModeEnabled'], (result) => {
  const colorblindModeButton = document.getElementById('colorblindMode');
});

// Toggle colorblind mode
document.getElementById('colorblindMode').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.storage.sync.get(['colorblindModeEnabled'], (result) => {
      const newState = !result.colorblindModeEnabled;
      chrome.storage.sync.set({ colorblindModeEnabled: newState }, () => {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'toggleColorblindMode', enabled: newState });
      });
       colorBlindBtn.textContent = result.colorblindModeEnabled ? "enable colorblind mode" : "disable colorblind mode";
    });
  });
});

dyslexiaBtn.addEventListener("click", () => {
  fontSelect.value = "OpenDyslexic";
  fontSizeSlider.value = 15;
  fontSizeValue.textContent = "15px";
  fontSpacingSlider.value = 2.5;
  fontSpacingValue.textContent = "2.5px";
  isBold = true;
  toggleBoldBtn.textContent = isBold ? "unbold" : "bold";
  applyBoldState();
  applyFontChanges();
});

simplifyBtn.addEventListener("click", () => {
  sendPrompt(
    "Rewrite the following to be simpler and easier to read. DO NOT RESPOND WITH ANYTHING ELSE BUT THE SIMPLIFIED TEXT. Here is the text you simplify:\n\n{{text}}\n DO NOT REPLY WITH 'Here is your simplified text:'"
  );
});

resetBtn.addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {
      action: "resetToDefault",
    });
  });
});

translatePageBtn.addEventListener("click", () => {
  const language = document.getElementById("languageSelect").value;

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {
      action: "translatePage",
      language: language,
    });
  });
});

let isBold = false;

function applyBoldState() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {
      action: "toggleBold",
      bold: isBold,
    });
  });
}

toggleBoldBtn.addEventListener("click", () => {
  isBold = !isBold;

  chrome.storage.sync.set({ isBold });

  applyBoldState();

  toggleBoldBtn.textContent = isBold ? "unbold" : "bold";
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
      spacing,
    });
  });
}

// --- Auto Mode Toggle ---

// autoModeCheckbox.addEventListener("change", (e) => {
//   chrome.storage.sync.set({ autoMode: e.target.checked });
// });

// --- Send Prompt Helper ---

function sendPrompt(promptText) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {
      action: "modifyPageText",
      prompt: promptText,
    });
  });
}

// --- Restore Stored Values on Load ---

window.onload = () => {
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
    if (data.spacing) {
      fontSpacingSlider.value = data.spacing;
      fontSpacingValue.textContent = data.spacing + "px";
    }
  });
};
