import ColorThief from "colorthief";
import "./style.css";

class QuickPalette {
  constructor() {
    this.colorThief = new ColorThief();
    this.currentPalette = [];
    this.init();
  }

  init() {
    this.setupHTML();
    this.setupEventListeners();
  }

  setupHTML() {
    document.getElementById("app").innerHTML = `
      <div class="min-h-screen bg-gray-50 py-8">
        <div class="max-w-4xl mx-auto px-4">
          <header class="text-center mb-8">
            <h1 class="text-4xl font-bold text-gray-800 mb-2">QuickPalette</h1>
            <p class="text-gray-600">Drop any image to extract its dominant colors</p>
          </header>

          <div id="dropZone" class="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center mb-8 transition-colors duration-200 hover:border-gray-400">
            <div class="space-y-4">
              <svg class="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <div>
                <p class="text-xl text-gray-600 mb-2">Drop your image here</p>
                <p class="text-sm text-gray-500">or click to browse</p>
              </div>
              <input type="file" id="fileInput" accept="image/*" class="hidden">
            </div>
          </div>

          <div id="imagePreview" class="hidden mb-8">
            <img id="previewImg" class="max-w-full h-64 object-contain mx-auto rounded-lg shadow-lg">
          </div>

          <div id="paletteSection" class="hidden">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-2xl font-semibold text-gray-800">Color Palette</h2>
              <button id="downloadBtn" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200">
                Download JSON
              </button>
            </div>
            <div id="colorSwatches" class="grid grid-cols-5 gap-4">
            </div>
          </div>
        </div>
      </div>
    `;
  }

  setupEventListeners() {
    const dropZone = document.getElementById("dropZone");
    const fileInput = document.getElementById("fileInput");
    const downloadBtn = document.getElementById("downloadBtn");

    // Click to browse
    dropZone.addEventListener("click", () => fileInput.click());

    // File input change
    fileInput.addEventListener("change", (e) => {
      if (e.target.files.length > 0) {
        this.handleFile(e.target.files[0]);
      }
    });

    // Prevent default drag behaviors on document
    document.addEventListener("dragenter", (e) => e.preventDefault());
    document.addEventListener("dragover", (e) => e.preventDefault());
    document.addEventListener("dragleave", (e) => e.preventDefault());
    document.addEventListener("drop", (e) => e.preventDefault());

    // Drag and drop on drop zone
    dropZone.addEventListener("dragenter", (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.add("drag-over");
    });

    dropZone.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.add("drag-over");
    });

    dropZone.addEventListener("dragleave", (e) => {
      e.preventDefault();
      e.stopPropagation();
      // Only remove drag-over if we're leaving the dropZone itself
      if (!dropZone.contains(e.relatedTarget)) {
        dropZone.classList.remove("drag-over");
      }
    });

    dropZone.addEventListener("drop", (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.remove("drag-over");

      const files = e.dataTransfer.files;
      if (files.length > 0 && files[0].type.startsWith("image/")) {
        this.handleFile(files[0]);
      }
    });

    // Download button
    downloadBtn.addEventListener("click", () => this.downloadPalette());
  }

  handleFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = document.getElementById("previewImg");
      img.src = e.target.result;
      img.onload = () => {
        this.extractColors(img);
        document.getElementById("imagePreview").classList.remove("hidden");
      };
    };
    reader.readAsDataURL(file);
  }

  extractColors(img) {
    try {
      const palette = this.colorThief.getPalette(img, 5);
      this.currentPalette = palette.map((color) => ({
        rgb: color,
        hex: this.rgbToHex(color[0], color[1], color[2]),
      }));
      this.displayPalette();
    } catch (error) {
      console.error("Error extracting colors:", error);
    }
  }

  displayPalette() {
    const swatchesContainer = document.getElementById("colorSwatches");
    swatchesContainer.innerHTML = "";

    this.currentPalette.forEach((color, index) => {
      const swatchDiv = document.createElement("div");
      swatchDiv.className =
        "swatch bg-white rounded-lg shadow-md overflow-hidden cursor-pointer";

      swatchDiv.innerHTML = `
        <div class="h-32 w-full" style="background-color: ${color.hex}"></div>
        <div class="p-4">
          <p class="text-sm font-mono text-gray-700 mb-2">${color.hex}</p>
          <button class="copy-btn w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded text-sm transition-colors duration-200">
            Copy HEX
          </button>
        </div>
      `;

      const copyBtn = swatchDiv.querySelector(".copy-btn");
      copyBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.copyToClipboard(color.hex);
        copyBtn.textContent = "Copied!";
        setTimeout(() => {
          copyBtn.textContent = "Copy HEX";
        }, 1000);
      });

      swatchesContainer.appendChild(swatchDiv);
    });

    document.getElementById("paletteSection").classList.remove("hidden");
  }

  rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    }
  }

  downloadPalette() {
    const paletteData = {
      timestamp: new Date().toISOString(),
      colors: this.currentPalette.map((color) => ({
        hex: color.hex,
        rgb: color.rgb,
      })),
    };

    const dataStr = JSON.stringify(paletteData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(dataBlob);
    link.download = `palette-${Date.now()}.json`;
    link.click();
  }
}

// Initialize the app
new QuickPalette();
