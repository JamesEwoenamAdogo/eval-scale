// PDF text extraction using PDF.js loaded from CDN
// This avoids bundling issues with pdfjs-dist and React

declare global {
  interface Window {
    pdfjsLib: any;
  }
}

let pdfjsLoaded = false;

const loadPdfJs = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (pdfjsLoaded && window.pdfjsLib) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      pdfjsLoaded = true;
      resolve();
    };
    script.onerror = () => reject(new Error("Failed to load PDF.js"));
    document.head.appendChild(script);
  });
};

export const extractPercentagesFromPDF = async (file: File): Promise<number[]> => {
  await loadPdfJs();
  
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  
  const percentages: number[] = [];
  const percentageRegex = /(\d{1,3}(?:\.\d{1,2})?)\s*%/g;
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const text = textContent.items
      .map((item: any) => item.str)
      .join(" ");
    
    let match;
    while ((match = percentageRegex.exec(text)) !== null) {
      const value = parseFloat(match[1]);
      if (value >= 0 && value <= 100) {
        percentages.push(value);
      }
    }
  }
  
  return percentages;
};
