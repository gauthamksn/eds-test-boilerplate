export default {
  // Define viewports to test
  viewports: [
    { name: 'mobile', width: 375, height: 667 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1280, height: 720 },
    { name: 'widescreen', width: 1920, height: 1080 }
  ],
  
  // Define browsers to test
  browsers: [
    { name: 'chromium', enabled: true },
    { name: 'firefox', enabled: true },
    { name: 'webkit', enabled: false }  // Disabled by default
  ],
  
  // Additional configuration options
  options: {
    // Wait time in milliseconds before taking screenshots (allows for animations to complete)
    stabilizationTime: 500,
    
    // Whether to run tests in parallel across components
    parallelizeComponents: true,
    
    // Custom selectors for components (if default .${component.name} doesn't work)
    customSelectors: {
      // Example: 'cards': '.cards-container'
    }
  }
};
