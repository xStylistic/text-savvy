import('https://cdn.jsdelivr.net/npm/tesseract.js@2.1.5/dist/tesseract.min.js').then(Tesseract => {
    const images = Array.from(document.querySelectorAll("img"));
  
    images.forEach((img) => {
      const imgUrl = img.src;
  
      // Use Tesseract to recognize text
      Tesseract.recognize(imgUrl, 'eng')
        .then(({ data: { text } }) => {
          const cleanedText = text.trim();
  
          if (cleanedText.length > 0) {
            chrome.runtime.sendMessage({
              action: "callCohere",
              prompt: "Translate this into clear English:\n\n" + cleanedText
            }, (response) => {
              const translated = response?.text?.trim();
              if (!translated) return;
  
              // Create an overlay div to show translated text
              const overlay = document.createElement("div");
              overlay.innerText = translated;
  
              const rect = img.getBoundingClientRect();
  
              overlay.style.position = "absolute";
              overlay.style.top = `${window.scrollY + rect.top}px`;
              overlay.style.left = `${window.scrollX + rect.left}px`;
              overlay.style.width = `${img.width}px`;
              overlay.style.background = "rgba(255, 255, 255, 0.9)";
              overlay.style.border = "1px solid #ccc";
              overlay.style.padding = "8px";
              overlay.style.fontSize = "14px";
              overlay.style.zIndex = 9999;
              overlay.style.color = "#000";
              overlay.style.fontFamily = "Arial, sans-serif";
              overlay.style.boxShadow = "0px 2px 5px rgba(0, 0, 0, 0.2)";
  
              // Place overlay in body
              document.body.appendChild(overlay);
            });
          }
        })
        .catch(err => {
          console.error("Tesseract OCR error:", err);
        });
    });
  });