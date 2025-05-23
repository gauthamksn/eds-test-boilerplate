# Visual Testing Plugin for AEM Edge Delivery Services

This plugin provides visual regression testing capabilities for AEM Edge Delivery Services (EDS) blocks. It allows you to compare blocks between different environments (e.g., main branch vs. development branch) to detect visual differences.

## Features

- Capture screenshots of blocks from different environments
- Compare screenshots using pixel-by-pixel comparison
- Display visual diffs in the sidekick plugin
- Support for multiple blocks and viewports

## Prerequisites

- Node.js 14+
- npm or yarn
- Puppeteer (installed automatically)
- pixelmatch (installed automatically)

## Installation

The plugin is already installed in this project. The necessary dependencies are:

```json
{
  "puppeteer": "^24.9.0",
  "pixelmatch": "^7.1.0",
  "pngjs": "^7.0.0",
  "fs-extra": "^11.3.0",
  "express": "^5.1.0",
  "cors": "^2.8.5"
}
```

## Usage

### Starting the Visual Testing Server

To serve the images and handle API requests, start the visual testing server:

```bash
npm run visual-test-server
```

This will start a server on port 3001 (or the port specified in the PORT environment variable).

### Using the Sidekick Plugin

1. Open your AEM Edge Delivery Services site in a browser
2. Open the AEM Sidekick
3. Click on the "Visual Tests" button in the sidekick
4. Configure the test:
   - Enter the baseline URL (main branch)
   - Verify the current URL (pre-filled with the current page)
   - Select the blocks you want to test
5. Click "Run Visual Tests"
6. View the test results:
   - Green: Passed (no visual differences)
   - Red: Failed (visual differences detected)
   - Each result shows baseline, current, and diff images

## How It Works

The visual testing plugin uses Puppeteer to capture screenshots of blocks and pixelmatch to compare them. The process works as follows:

1. The plugin captures screenshots of selected blocks from both the baseline URL (main branch) and the current URL
2. The screenshots are saved in the `tools/visual-testing/baseline` and `tools/visual-testing/current` directories
3. The plugin compares the screenshots using pixelmatch and generates diff images in the `tools/visual-testing/diff` directory
4. The results are displayed in the sidekick plugin

## Directory Structure

- `tools/visual-testing/server.js`: Express server for serving images, handling API requests, and performing visual testing
- `tools/visual-testing/baseline/`: Directory for baseline screenshots
- `tools/visual-testing/current/`: Directory for current screenshots
- `tools/visual-testing/diff/`: Directory for diff images
- `tools/sidekick/plugins/test/test.js`: Sidekick plugin implementation (browser-side UI)

## Configuration

The plugin can be configured in the `tools/sidekick/config.json` file:

```json
{
  "id": "test",
  "title": "Visual Tests",
  "environments": ["dev", "preview", "live"],
  "url": "/tools/sidekick/plugins/test/test.js",
  "isPalette": true,
  "paletteRect": "top: 50px; left: 15px; bottom: 15px; right: 15px; width: calc(100% - 30px); height: calc(100% - 65px);"
}
```

## Customization

You can customize the visual testing plugin by modifying the following files:

- `tools/sidekick/plugins/test/test.js`: Modify the sidekick plugin UI and behavior (browser-side)
- `tools/visual-testing/server.js`: Modify the server-side API and visual testing functionality

## Troubleshooting

### Images Not Loading

If images are not loading in the sidekick plugin, make sure the visual testing server is running:

```bash
npm run visual-test-server
```

### Puppeteer Issues

If you encounter issues with Puppeteer, try running it with different arguments:

```javascript
// In tools/visual-testing/server.js
const browser = await puppeteer.launch({
  headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
});
```

### Comparison Issues

If you're seeing unexpected differences in the comparison, try adjusting the threshold:

```javascript
// In tools/visual-testing/server.js
const diffPixels = pixelmatch(
  baselineImage.data,
  currentImage.data,
  diffImage.data,
  width,
  height,
  { threshold: 0.2 } // Increase threshold for less sensitivity
);
