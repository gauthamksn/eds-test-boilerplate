const express = require('express');
const path = require('path');
const fs = require('fs-extra');
const cors = require('cors');
const puppeteer = require('puppeteer');
const { PNG } = require('pngjs');
// Import pixelmatch
const pixelmatch = require('pixelmatch');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Serve static files from visual-testing directory
app.use('/tools/visual-testing', express.static(path.join(__dirname)));

// API endpoint to get all test results
app.get('/api/visual-tests', async (req, res) => {
  try {
    const baselinePath = path.join(__dirname, 'baseline');
    const currentPath = path.join(__dirname, 'current');
    const diffPath = path.join(__dirname, 'diff');
    
    // Ensure directories exist
    await fs.ensureDir(baselinePath);
    await fs.ensureDir(currentPath);
    await fs.ensureDir(diffPath);
    
    // Get all block directories
    const baselineDirs = await fs.readdir(baselinePath);
    const currentDirs = await fs.readdir(currentPath);
    const diffDirs = await fs.readdir(diffPath);
    
    // Get unique block names
    const blockNames = new Set([
      ...baselineDirs,
      ...currentDirs,
      ...diffDirs
    ]);
    
    // Combine results
    const results = [];
    
    // Process each block
    for (const blockName of blockNames) {
      const blockBaselinePath = path.join(baselinePath, blockName);
      const blockCurrentPath = path.join(currentPath, blockName);
      const blockDiffPath = path.join(diffPath, blockName);
      
      const baselineExists = await fs.pathExists(path.join(blockBaselinePath, `${blockName}.png`));
      const currentExists = await fs.pathExists(path.join(blockCurrentPath, `${blockName}.png`));
      const diffExists = await fs.pathExists(path.join(blockDiffPath, `${blockName}.png`));
      
      const result = {
        blockName,
        baselineImage: baselineExists ? `tools/visual-testing/baseline/${blockName}/${blockName}.png` : null,
        currentImage: currentExists ? `tools/visual-testing/current/${blockName}/${blockName}.png` : null,
        diffImage: diffExists ? `tools/visual-testing/diff/${blockName}/${blockName}.png` : null,
      };
      
      results.push(result);
    }
    
    res.json(results);
  } catch (error) {
    console.error('Error getting test results:', error);
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to delete test results
app.delete('/api/visual-tests/:blockName', async (req, res) => {
  try {
    const { blockName } = req.params;
    const blockBaselinePath = path.join(__dirname, 'baseline', blockName);
    const blockCurrentPath = path.join(__dirname, 'current', blockName);
    const blockDiffPath = path.join(__dirname, 'diff', blockName);
    
    // Delete directories if they exist
    if (await fs.pathExists(blockBaselinePath)) {
      await fs.remove(blockBaselinePath);
    }
    
    if (await fs.pathExists(blockCurrentPath)) {
      await fs.remove(blockCurrentPath);
    }
    
    if (await fs.pathExists(blockDiffPath)) {
      await fs.remove(blockDiffPath);
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting test results:', error);
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to promote current to baseline
app.post('/api/visual-tests/:blockName/promote', async (req, res) => {
  try {
    const { blockName } = req.params;
    const blockBaselinePath = path.join(__dirname, 'baseline', blockName);
    const blockCurrentPath = path.join(__dirname, 'current', blockName);
    const baselineFile = path.join(blockBaselinePath, `${blockName}.png`);
    const currentFile = path.join(blockCurrentPath, `${blockName}.png`);
    
    // Ensure baseline directory exists
    await fs.ensureDir(blockBaselinePath);
    
    // Check if current file exists
    if (await fs.pathExists(currentFile)) {
      // Copy current to baseline
      await fs.copy(currentFile, baselineFile);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Current file not found' });
    }
  } catch (error) {
    console.error('Error promoting test results:', error);
    res.status(500).json({ error: error.message });
  }
});

// Load configuration
async function loadConfig() {
  try {
    const configPath = path.join(__dirname, '..', 'sidekick', 'plugins', 'test', 'config.json');
    const configData = await fs.readFile(configPath, 'utf8');
    return JSON.parse(configData);
  } catch (error) {
    console.error('Error loading config:', error);
    // Return default config if loading fails
    return {
      defaultBaselineUrl: '',
      defaultCurrentUrl: '',
      threshold: 0.1,
      viewportWidth: 1280,
      viewportHeight: 800,
      deviceScaleFactor: 1,
      timeout: 30000,
      waitForSelector: 10000
    };
  }
}

// API endpoint to run visual tests
app.post('/api/visual-tests/run', async (req, res) => {
  try {
    console.log('Received request body:', req.body);
    
    const { baselineUrl, currentUrl, selectedBlocks, selectedBreakpoints } = req.body;
    const config = await loadConfig();
    
    // Use selected breakpoints or default viewport
    const breakpoints = selectedBreakpoints && selectedBreakpoints.length > 0 
      ? selectedBreakpoints 
      : [config.defaultViewport || { width: 1280, height: 800, deviceScaleFactor: 1, name: 'Default' }];
    
    // Detailed validation with specific error messages
    if (!baselineUrl) {
      return res.status(400).json({ error: 'Baseline URL is required' });
    }
    
    if (!currentUrl) {
      return res.status(400).json({ error: 'Current URL is required' });
    }
    
    if (!selectedBlocks) {
      return res.status(400).json({ error: 'Selected blocks are required' });
    }
    
    if (!Array.isArray(selectedBlocks)) {
      return res.status(400).json({ error: 'Selected blocks must be an array' });
    }
    
    if (selectedBlocks.length === 0) {
      return res.status(400).json({ error: 'At least one block must be selected' });
    }
    
    // Validate each block has required properties
    for (const block of selectedBlocks) {
      if (!block.name) {
        return res.status(400).json({ error: 'Each block must have a name' });
      }
      if (!block.path) {
        return res.status(400).json({ error: 'Each block must have a path' });
      }
      if (!block.selector) {
        return res.status(400).json({ error: 'Each block must have a selector' });
      }
    }
    
    // Launch browser
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    // Ensure directories exist
    const baselinePath = path.join(__dirname, 'baseline');
    const currentPath = path.join(__dirname, 'current');
    const diffPath = path.join(__dirname, 'diff');
    
    await fs.ensureDir(baselinePath);
    await fs.ensureDir(currentPath);
    await fs.ensureDir(diffPath);
    
    // Run tests for each selected block at each breakpoint
    const results = [];
    
    for (const block of selectedBlocks) {
      for (const breakpoint of breakpoints) {
      console.log('Processing block:', block);
      
      // Create directories for block path if needed
      const blockBaselinePath = path.join(baselinePath, block.name);
      const blockCurrentPath = path.join(currentPath, block.name);
      const blockDiffPath = path.join(diffPath, block.name);
      
      await fs.ensureDir(blockBaselinePath);
      await fs.ensureDir(blockCurrentPath);
      await fs.ensureDir(blockDiffPath);
      
        // Construct URLs with block path
        const baselineBlockUrl = new URL(block.path, baselineUrl).href;
        const currentBlockUrl = new URL(block.path, currentUrl).href;
        
        console.log('Baseline URL:', baselineBlockUrl);
        console.log('Current URL:', currentBlockUrl);
        console.log('Breakpoint:', breakpoint);
        
        // Create file names with breakpoint info
        const breakpointSuffix = breakpoint.name ? `-${breakpoint.name.toLowerCase()}` : '';
        const baselineImagePath = `tools/visual-testing/baseline/${block.name}/${block.name}${breakpointSuffix}.png`;
        const currentImagePath = `tools/visual-testing/current/${block.name}/${block.name}${breakpointSuffix}.png`;
        const diffImagePath = `tools/visual-testing/diff/${block.name}/${block.name}${breakpointSuffix}.png`;
        
        const result = {
          blockName: block.name,
          path: block.path || `/tools/blocks/${block.name}`,
          sample: block.sample || '',
          selector: block.selector,
          baselineImage: baselineImagePath,
          currentImage: currentImagePath,
          diffImage: diffImagePath,
          baselineUrl: baselineBlockUrl,
          currentUrl: currentBlockUrl,
          breakpoint: breakpoint,
          passed: false,
          diffPercentage: 0,
          error: null
        };
      
      try {
        // Capture screenshots
        
        // Capture baseline screenshot
        if (baselineUrl) {
          // Create file path with breakpoint info
          const breakpointSuffix = breakpoint.name ? `-${breakpoint.name.toLowerCase()}` : '';
          const baselineFilePath = path.join(blockBaselinePath, `${block.name}${breakpointSuffix}.png`);
          
          await captureScreenshot(
            browser,
            baselineBlockUrl,
            block.selector,
            baselineFilePath,
            { 
              width: breakpoint.width || 1280, 
              height: breakpoint.height || 800,
              deviceScaleFactor: breakpoint.deviceScaleFactor || 1,
              timeout: config.timeout || 30000,
              waitForSelector: config.waitForSelector || 10000
            }
          );
        }
        
        // Capture current screenshot
        if (currentUrl) {
          // Create file path with breakpoint info
          const currentFilePath = path.join(blockCurrentPath, `${block.name}${breakpointSuffix}.png`);
          
          await captureScreenshot(
            browser,
            currentBlockUrl,
            block.selector,
            currentFilePath,
            { 
              width: breakpoint.width || 1280, 
              height: breakpoint.height || 800,
              deviceScaleFactor: breakpoint.deviceScaleFactor || 1,
              timeout: config.timeout || 30000,
              waitForSelector: config.waitForSelector || 10000
            }
          );
        }
        
        // Compare screenshots if both exist
        // Reuse the same breakpoint suffix that was defined earlier
        const baselineImageFilePath = path.join(blockBaselinePath, `${block.name}${breakpointSuffix}.png`);
        const currentImageFilePath = path.join(blockCurrentPath, `${block.name}${breakpointSuffix}.png`);
        const diffImageFilePath = path.join(blockDiffPath, `${block.name}${breakpointSuffix}.png`);
        
        if (
          await fs.pathExists(baselineImageFilePath) &&
          await fs.pathExists(currentImageFilePath)
        ) {
          const comparisonResult = await compareImages(
            baselineImageFilePath,
            currentImageFilePath,
            diffImageFilePath,
            { threshold: config.threshold || 0.1 }
          );
          
          result.diffPercentage = comparisonResult.diffPercentage;
          result.passed = comparisonResult.diffPercentage < (config.threshold || 0.1);
        } else {
          result.error = 'Missing baseline or current image';
        }
      } catch (error) {
        result.error = error.message;
      }
      
        results.push(result);
      }
    }
    
    // Close browser
    await browser.close();
    
    // Return results
    res.json(results);
  } catch (error) {
    console.error('Error running visual tests:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Capture a screenshot of an element
 * @param {Object} browser - Puppeteer browser instance
 * @param {string} url - URL to navigate to
 * @param {string} selector - CSS selector for the element
 * @param {string} outputPath - Path to save the screenshot
 * @param {Object} options - Additional options
 */
async function captureScreenshot(browser, url, selector, outputPath, options = {}) {
  const page = await browser.newPage();
  
  // Set viewport size
  await page.setViewport({
    width: options.width || 1280,
    height: options.height || 800,
    deviceScaleFactor: options.deviceScaleFactor || 1
  });
  
  // Navigate to the URL
  await page.goto(url, {
    waitUntil: 'networkidle2',
    timeout: options.timeout || 30000
  });
  
  // Wait for the selector to be available
  await page.waitForSelector(selector, {
    timeout: options.timeout || 10000
  });
  
  // Get the element
  const element = await page.$(selector);
  if (!element) {
    throw new Error(`Element not found: ${selector}`);
  }
  
  // Take a screenshot of the element
  await element.screenshot({
    path: outputPath,
    omitBackground: options.omitBackground || false
  });
  
  await page.close();
}

/**
 * Compare two images and generate a diff image
 * @param {string} baselineImagePath - Path to baseline image
 * @param {string} currentImagePath - Path to current image
 * @param {string} diffImagePath - Path to save diff image
 * @param {Object} options - Comparison options
 * @returns {Object} - Comparison result
 */
async function compareImages(baselineImagePath, currentImagePath, diffImagePath, options = {}) {
  const baselineImage = PNG.sync.read(await fs.readFile(baselineImagePath));
  const currentImage = PNG.sync.read(await fs.readFile(currentImagePath));
  
  const { width, height } = baselineImage;
  const diffImage = new PNG({ width, height });
  
  // Ensure both images have the same dimensions
  if (
    baselineImage.width !== currentImage.width ||
    baselineImage.height !== currentImage.height
  ) {
    throw new Error('Image dimensions do not match');
  }
  
  // Manual comparison since pixelmatch is causing issues
  let diffPixels = 0;
  const threshold = (options.threshold || 0.1) * 255;
  
  for (let i = 0; i < baselineImage.data.length; i += 4) {
    if (
      Math.abs(baselineImage.data[i] - currentImage.data[i]) > threshold ||
      Math.abs(baselineImage.data[i + 1] - currentImage.data[i + 1]) > threshold ||
      Math.abs(baselineImage.data[i + 2] - currentImage.data[i + 2]) > threshold
    ) {
      diffPixels++;
      // Mark diff pixels in red
      diffImage.data[i] = 255;     // R
      diffImage.data[i + 1] = 0;   // G
      diffImage.data[i + 2] = 0;   // B
      diffImage.data[i + 3] = 255; // A
    } else {
      // Copy original pixels
      diffImage.data[i] = baselineImage.data[i];
      diffImage.data[i + 1] = baselineImage.data[i + 1];
      diffImage.data[i + 2] = baselineImage.data[i + 2];
      diffImage.data[i + 3] = baselineImage.data[i + 3];
    }
  }
  
  // Calculate diff percentage
  const diffPercentage = diffPixels / (width * height);
  
  // Save diff image
  await fs.writeFile(diffImagePath, PNG.sync.write(diffImage));
  
  return {
    diffPixels,
    diffPercentage,
    width,
    height
  };
}

// Start server
app.listen(PORT, () => {
  console.log(`Visual testing server running on port ${PORT}`);
  console.log(`Access the API at http://localhost:${PORT}/api/visual-tests`);
  console.log(`Access the images at http://localhost:${PORT}/tools/visual-testing`);
});
