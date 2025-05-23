// Import modules
import { addStyles, createLoadingIndicator, loadConfig } from './utils.js';
import { createTestForm } from './form.js';
import { createResultsView } from './results.js';
import { runVisualTests } from './api.js';

/**
 * Decorate the plugin container
 * @param {HTMLElement} container - Plugin container
 * @param {Object} data - Plugin data
 * @param {Object} query - Query parameters
 */
export async function decorate(container, data, query) {
  console.log('Visual tests plugin loaded with data:', data);
  
  // Load configuration
  const config = await loadConfig();
  console.log('Loaded config:', config);
  
  // Ensure data is an array
  const blocks = Array.isArray(data) ? data : [];
  
  // If no blocks provided, add some default blocks
  if (blocks.length === 0) {
    blocks.push(
      {
        name: "cards",
        path: "/blocks/cards",
      },
      {
        name: "columns",
        path: "/blocks/columns",
      },
      {
        name: "hero",
        path: "/blocks/hero",
      }
    );
  }
  
  // Add styles
  addStyles();
  
  // Create plugin container
  const pluginContainer = document.createElement('div');
  pluginContainer.className = 'visual-test-container';
  
  // Create two-column layout
  const twoColumnLayout = document.createElement('div');
  twoColumnLayout.className = 'two-column-layout';
  
  // Create left column (form)
  const leftColumn = document.createElement('div');
  leftColumn.className = 'left-column';
  
  // Create right column (results)
  const rightColumn = document.createElement('div');
  rightColumn.className = 'right-column';
  
  // Add columns to layout
  twoColumnLayout.appendChild(leftColumn);
  twoColumnLayout.appendChild(rightColumn);
  
  // Add layout to container
  pluginContainer.appendChild(twoColumnLayout);
  
  // Set container content
  container.innerHTML = '';
  container.appendChild(pluginContainer);
  
  // Create test form with default values from config
  const testForm = createTestForm(blocks, config, async (formData) => {
    // Show loading indicator
    rightColumn.innerHTML = '';
    rightColumn.appendChild(createLoadingIndicator());
    
    // Run visual tests
    await runVisualTests(
      formData,
      (results) => {
        // Show results
        rightColumn.innerHTML = '';
        rightColumn.appendChild(createResultsView(results));
      },
      (error) => {
        // Show error
        rightColumn.innerHTML = '';
        const errorElement = document.createElement('div');
        errorElement.className = 'error-container';
        errorElement.innerHTML = `
          <h3>Error running visual tests</h3>
          <p>${error.message}</p>
          <sp-button variant="primary">Try Again</sp-button>
        `;
        errorElement.querySelector('sp-button').addEventListener('click', () => {
          // Clear error and run tests again
          rightColumn.innerHTML = '';
          runVisualTests(formData, 
            (results) => {
              rightColumn.innerHTML = '';
              rightColumn.appendChild(createResultsView(results));
            }, 
            (error) => {
              rightColumn.innerHTML = '';
              rightColumn.appendChild(errorElement);
            }
          );
        });
        rightColumn.appendChild(errorElement);
      }
    );
  });
  
  // Add test form to left column
  leftColumn.appendChild(testForm);
}

export default {
  title: 'Visual Tests',
  searchEnabled: true,
};
