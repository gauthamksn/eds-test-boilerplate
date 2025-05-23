/**
 * Run visual tests via API
 * @param {Object} config - Test configuration
 * @param {string} config.baselineUrl - URL for baseline screenshots
 * @param {string} config.currentUrl - URL for current screenshots
 * @param {Array} config.selectedBlocks - Selected blocks to test
 * @param {Array} config.selectedBreakpoints - Selected breakpoints to test
 * @param {Function} onComplete - Callback when tests are complete
 * @param {Function} onError - Callback when an error occurs
 */
export async function runVisualTests(config, onComplete, onError) {
  try {
    console.log('Running visual tests with config:', config);
    
    // Validate config
    validateConfig(config);
    
    // API endpoint (assuming server is running on localhost:3001)
    const apiUrl = 'http://localhost:3001/api/visual-tests/run';
    
    // Send request to API
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config),
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    // Get results from API
    const results = await response.json();
    
    // Call complete callback with results
    onComplete(results);
  } catch (error) {
    console.error('Error running visual tests:', error);
    onError(error);
  }
}

/**
 * Validate test configuration
 * @param {Object} config - Test configuration
 * @throws {Error} - If configuration is invalid
 */
function validateConfig(config) {
  if (!config.baselineUrl) {
    throw new Error('Baseline URL is required');
  }
  
  if (!config.currentUrl) {
    throw new Error('Current URL is required');
  }
  
  if (!config.selectedBlocks || !Array.isArray(config.selectedBlocks) || config.selectedBlocks.length === 0) {
    throw new Error('At least one block must be selected');
  }
  
  if (!config.selectedBreakpoints || !Array.isArray(config.selectedBreakpoints) || config.selectedBreakpoints.length === 0) {
    throw new Error('At least one breakpoint must be selected');
  }
}
