/**
 * Add CSS styles for the plugin
 */
export function addStyles() {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = '/tools/sidekick/plugins/test/test.css';
  document.head.appendChild(link);
}

/**
 * Create a loading indicator
 * @param {string} message - Loading message
 * @returns {HTMLElement} - Loading element
 */
export function createLoadingIndicator(message = 'Running visual tests...') {
  const loadingContainer = document.createElement('div');
  loadingContainer.className = 'loading-container';
  
  const spinner = document.createElement('div');
  spinner.className = 'spinner';
  
  const loadingMessage = document.createElement('p');
  loadingMessage.textContent = message;
  
  loadingContainer.appendChild(spinner);
  loadingContainer.appendChild(loadingMessage);
  
  return loadingContainer;
}

/**
 * Load plugin configuration
 * @returns {Promise<Object>} - Plugin configuration
 */
export async function loadConfig() {
  try {
    const response = await fetch('/tools/sidekick/plugins/test/config.json');
    if (!response.ok) {
      throw new Error(`Failed to load config: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error loading config:', error);
    // Return default config if loading fails
    return {
      defaultBaselineUrl: '',
      defaultCurrentUrl: window.location.href,
      threshold: 0.1,
      defaultViewport: {
        width: 1280,
        height: 800,
        deviceScaleFactor: 1
      },
      breakpoints: [
        {
          name: "Mobile",
          width: 375,
          height: 667,
          deviceScaleFactor: 2
        },
        {
          name: "Desktop",
          width: 1280,
          height: 800,
          deviceScaleFactor: 1
        }
      ],
      timeout: 30000,
      waitForSelector: 10000
    };
  }
}
