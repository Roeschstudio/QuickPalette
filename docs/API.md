# API Documentation

QuickPalette is primarily a client-side application, but it does provide some programmatic interfaces that can be used when integrating the application into other projects.

## QuickPalette Class

The main class that powers the application.

### Constructor

```javascript
new QuickPalette()
```

Creates a new instance of QuickPalette and initializes the application.

### Methods

#### `init()`

Initializes the application by setting up the HTML and event listeners.

#### `setupHTML()`

Sets up the initial HTML structure of the application.

#### `setupEventListeners()`

Sets up all the event listeners for user interactions.

#### `handleFile(file)`

Processes a file object and extracts colors from it.

**Parameters:**
- `file` (File): The image file to process

#### `extractColors(img)`

Extracts the color palette from an image element.

**Parameters:**
- `img` (HTMLImageElement): The image element to extract colors from

#### `displayPalette()`

Displays the extracted color palette in the UI.

#### `rgbToHex(r, g, b)`

Converts RGB color values to HEX format.

**Parameters:**
- `r` (number): Red value (0-255)
- `g` (number): Green value (0-255)
- `b` (number): Blue value (0-255)

**Returns:**
- `string`: HEX color code

#### `copyToClipboard(text)`

Copies text to the clipboard.

**Parameters:**
- `text` (string): The text to copy

#### `downloadPalette()`

Downloads the current palette as a JSON file.

## Integration Example

You can integrate QuickPalette into your own project:

```javascript
import ColorThief from "colorthief";

class MyColorExtractor {
  constructor() {
    this.colorThief = new ColorThief();
  }

  async extractColorsFromImage(imageElement) {
    try {
      const palette = this.colorThief.getPalette(imageElement, 5);
      return palette.map((color) => ({
        rgb: color,
        hex: this.rgbToHex(color[0], color[1], color[2]),
      }));
    } catch (error) {
      console.error("Error extracting colors:", error);
      return [];
    }
  }

  rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }
}

// Usage
const extractor = new MyColorExtractor();
const img = document.getElementById("my-image");
img.onload = async () => {
  const colors = await extractor.extractColorsFromImage(img);
  console.log(colors);
};
```

## Data Format

### Color Object

Each color in the palette is represented as an object with the following structure:

```javascript
{
  rgb: [r, g, b],  // Array of RGB values (0-255)
  hex: "#RRGGBB"   // HEX color code
}
```

### Palette JSON Export

The exported palette JSON has the following structure:

```javascript
{
  "timestamp": "2023-11-24T10:30:00.000Z",
  "colors": [
    {
      "hex": "#FF5733",
      "rgb": [255, 87, 51]
    },
    // ... more colors
  ]
}