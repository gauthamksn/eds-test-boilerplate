import { test, expect } from '@playwright/test';
import config from './visual-test-config.js';

// This will be populated in the setup
let components: { name: string, path: string }[] = [];

// Setup: Fetch components before running tests
test.beforeAll(async ({ request }) => {
  try {
    const response = await request.get('/tools/sidekick/library.json');
    
    // Check if the response was successful
    if (!response.ok()) {
      throw new Error(`Failed to fetch components: ${response.status()} ${response.statusText()}`);
    }
    
    const data = await response.json();
    
    // Check if the data has the expected structure
    if (!data.blocks || !Array.isArray(data.blocks.data)) {
      throw new Error('Invalid response format: missing blocks.data array');
    }
    
    components = data.blocks.data;
    console.log(`Found ${components.length} components to test:`, components);
    
    // Validate component data
    components.forEach((component, index) => {
      if (!component.name || !component.path) {
        console.warn(`Warning: Component at index ${index} is missing required properties:`, component);
      }
    });
  } catch (error) {
    console.error('Error fetching components:', error);
    // Initialize with empty array rather than failing completely
    components = [];
    // Re-throw to fail the test
    throw error;
  }
});

// Verify we have components to test
test('Should have components to test', async () => {
  expect(components.length).toBeGreaterThan(0);
});

// For each viewport defined in the config
for (const viewport of config.viewports) {
  test.describe(`Viewport: ${viewport.name} (${viewport.width}x${viewport.height})`, () => {
    // Set up the viewport size for all tests in this describe block
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ 
        width: viewport.width, 
        height: viewport.height 
      });
    });
    
    // This will dynamically create tests for each component
    test('Component list loaded', async () => {
      // This test just verifies components were loaded
      expect(components.length).toBeGreaterThan(0);
    });
    
    // Create a test for each component
    test.describe('Individual component tests', () => {
      // We need to use a function to create tests dynamically
      // This ensures the tests are created after components are loaded
      test.beforeAll(async () => {
        // This will run before all tests in this describe block
        console.log(`Setting up tests for ${components.length} components at ${viewport.name} viewport`);
      });
      
      // Create a test for each component
      // Note: We're using a function that will be evaluated at runtime
      // rather than a for loop that would be evaluated at parse time
      const createComponentTest = (component: { name: string, path: string }) => {
        test(`Component: ${component.name}`, async ({ page }) => {
          console.log(`Testing component: ${component.name} at path: ${component.path} for viewport: ${viewport.name}`);
          
          // Navigate to the component
          await page.goto(component.path);
          
          // Get the appropriate selector
          const selector = config.options.customSelectors?.[component.name] || `.${component.name}`;
          
          // Wait for component to be fully rendered
          await page.waitForSelector(selector, { state: 'visible' });
          
          // Wait for stabilization time if configured
          if (config.options.stabilizationTime) {
            await page.waitForTimeout(config.options.stabilizationTime);
          }
          
          // Take screenshot for comparison
          await expect(page.locator(selector)).toHaveScreenshot(
            `${component.name}-${viewport.name}.png`
          );
        });
      };
      
      // Register a test for each component
      for (const component of components) {
        createComponentTest(component);
      }
    });
  });
}
