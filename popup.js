// Elements
const dyslexiaBtn = document.getElementById("dyslexia");
const colorBlindBtn = document.getElementById("colorblindMode");
const resetBtn = document.getElementById("reset");
const simplifyBtn = document.getElementById("simplify");
const translateBtn = document.getElementById("translate");
const speakBtn = document.getElementById("speak");

const fontSelect = document.getElementById("fontSelect");
const fontSizeSlider = document.getElementById("fontSizeSlider");
const fontSizeValue = document.getElementById("fontSizeValue");

const fontSpacingSlider = document.getElementById("fontSpacingSlider");
const fontSpacingValue = document.getElementById("fontSpacingValue");

const languageSelect = document.getElementById("languageSelect");
const toggleBoldBtn = document.getElementById("toggleBold");


const voiceSelect = document.getElementById("voiceSelect");
const speechRateSlider = document.getElementById("speechRateSlider");
const speechRateValue = document.getElementById("speechRateValue");
const speechPitchSlider = document.getElementById("speechPitchSlider");
const speechPitchValue = document.getElementById("speechPitchValue");

// --- Restore Stored Values on Load ---

window.onload = () => {

  populateVoiceOptions();

  chrome.storage.sync.get(
    [
      "colorblindModeEnabled",
      "language",
      "speechVoice",
      "speechRate",
      "speechPitch",
    ],
    ({
      colorblindModeEnabled,
      language,
      speechVoice,
      speechRate,
      speechPitch,
    }) => {
      // Set initial colorblind button text based on stored state
      if (colorblindModeEnabled) {
        colorBlindBtn.textContent = "disable colorblind mode";
      } else {
        colorBlindBtn.textContent = "enable colorblind mode";
      }

      // Set language if available
      if (language && languageSelect) {
        languageSelect.value = language;
      }

      // Set speech settings if available
      if (speechRate && speechRateSlider && speechRateValue) {
        speechRateSlider.value = speechRate;
        speechRateValue.textContent = speechRate.toFixed(1);
      }

      if (speechPitch && speechPitchSlider && speechPitchValue) {
        speechPitchSlider.value = speechPitch;
        speechPitchValue.textContent = speechPitch.toFixed(1);
      }

      if (speechVoice && voiceSelect) {

        setTimeout(() => {
          if (voiceSelect.querySelector(`option[value="${speechVoice}"]`)) {
            voiceSelect.value = speechVoice;
          }
        }, 100);
      }
    }
  );


  fontSizeValue.textContent = fontSizeSlider.value + "px";
  fontSpacingValue.textContent = fontSpacingSlider.value + "px";


  chrome.storage.sync.get(["font", "size", "spacing", "isBold"], (data) => {
    if (data.font) {
      fontSelect.value = data.font;
    }
    if (data.size) {
      fontSizeSlider.value = data.size; 
      fontSizeValue.textContent = data.size + "px"; 
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


function populateVoiceOptions() {
  if (!voiceSelect) return;


  while (voiceSelect.options.length > 1) {
    voiceSelect.remove(1);
  }


  let voices = speechSynthesis.getVoices();


  if (voices.length === 0) {
    speechSynthesis.onvoiceschanged = () => {
      voices = speechSynthesis.getVoices();
      populateVoiceList(voices);
    };
  } else {
    populateVoiceList(voices);
  }
}

function populateVoiceList(voices) {

  chrome.storage.sync.get(["speechVoice"], ({ speechVoice }) => {

    voices.forEach((voice) => {
      const option = document.createElement("option");
      option.textContent = `${voice.name} (${voice.lang})`;
      option.value = voice.name;
      voiceSelect.appendChild(option);


      if (speechVoice && voice.name === speechVoice) {
        option.selected = true;
      }
    });
  });
}

// --- Button Actions ---


colorBlindBtn.addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.storage.sync.get(["colorblindModeEnabled"], (result) => {

      const currentState = result.colorblindModeEnabled || false;

      const newState = !currentState;

      // Update storage
      chrome.storage.sync.set({ colorblindModeEnabled: newState }, () => {
        // Send message to content script
        chrome.tabs.sendMessage(
          tabs[0].id,
          {
            action: "toggleColorblindMode",
          },
          (response) => {
            // Update button text based on the new state
            if (response && response.colorblindModeEnabled !== undefined) {
              colorBlindBtn.textContent = response.colorblindModeEnabled
                ? "disable colorblind mode"
                : "enable colorblind mode";
            }
          }
        );
      });
    });
  });
});

// Speak selected text
if (speakBtn) {
  speakBtn.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: "speakText",
      });
    });
  });
}

// Simplify text
if (simplifyBtn) {
  simplifyBtn.addEventListener("click", () => {
    sendPrompt(
      "IMPORTANT FORMATTING INSTRUCTIONS: You must ONLY output the simplified version of the text, with NO additional text, NO explanations, NO introductions like 'Here is the simplified text', and NO comments of any kind. Your entire response must contain ONLY the simplified text.\n\nSimplify this text making it easier to read and understand while preserving all meaning:\n\n{{text}}"
    );
  });
}

// Translate text
if (translateBtn && languageSelect) {
  translateBtn.addEventListener("click", () => {
    const language = languageSelect.value;
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: "translatePage",
        language: language,
      });
    });
  });


  languageSelect.addEventListener("change", () => {
    chrome.storage.sync.set({ language: languageSelect.value });
  });
}

// Voice settings
if (voiceSelect) {
  voiceSelect.addEventListener("change", () => {
    chrome.storage.sync.set({ speechVoice: voiceSelect.value });
  });
}

if (speechRateSlider && speechRateValue) {
  speechRateSlider.addEventListener("input", () => {
    const rate = parseFloat(speechRateSlider.value);
    speechRateValue.textContent = rate.toFixed(1);
    chrome.storage.sync.set({ speechRate: rate });
  });
}

if (speechPitchSlider && speechPitchValue) {
  speechPitchSlider.addEventListener("input", () => {
    const pitch = parseFloat(speechPitchSlider.value);
    speechPitchValue.textContent = pitch.toFixed(1);
    chrome.storage.sync.set({ speechPitch: pitch });
  });
}

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

let isBold = false;

resetBtn.addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {
      action: "resetToDefault",
    });
  });
  isBold = false;
  toggleBoldBtn.textContent = isBold ? "unbold" : "bold";
  applyBoldState();
});

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

  languageSelect.addEventListener("change", () => {
    chrome.storage.sync.set({ language: languageSelect.value });
  });


  fontSizeValue.textContent = fontSizeSlider.value + "px";
  fontSpacingValue.textContent = fontSpacingSlider.value + "px";


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
