import('https://cdn.jsdelivr.net/npm/tesseract.js@2.1.5/dist/tesseract.min.js').then(Tesseract => {
    const images = Array.from(document.querySelectorAll("img"));
  
    images.forEach((img) => {
      Tesseract.recognize(img.src, 'eng').then(({ data: { text } }) => {
        if (text.trim().length > 0) {
          chrome.runtime.sendMessage({
            action: "callCohere",
            prompt: "Translate this to English:\n\n" + text
          }, (response) => {
            const overlay = document.createElement("div");
            overlay.innerText = response.text;
            overlay.style.position = "absolute";
            overlay.style.background = "rgba(255,255,255,0.8)";
            overlay.style.border = "1px solid #ccc";
            overlay.style.padding = "4px";
            overlay.style.zIndex = 1000;
            overlay.style.fontSize = "12px";
            overlay.style.maxWidth = img.width + "px";
            overlay.style.top = (img.getBoundingClientRect().top + window.scrollY) + "px";
            overlay.style.left = (img.getBoundingClientRect().left + window.scrollX) + "px";
            document.body.appendChild(overlay);
          });
        }
      });
    });
  });