# Visual Testing Framework for EDS Components

This directory contains a Playwright-based visual testing framework for EDS components. The framework automatically fetches components from the sidekick library and runs visual tests on them across different viewports and browsers.

## Files

- `visual.spec.ts`: The main test file that runs visual tests on all components
- `visual-test-config.js`: Configuration file for viewports, browsers, and other options
- `playwright.config.js`: Playwright configuration file

## Running Tests

### Prerequisites

Before running the tests, ensure that:

1. The AEM server is running (if required)
2. The sidekick library is accessible at the configured URL

### Running Commands

Before running the tests, make sure the AEM server is running and the sidekick library is accessible.

#### Generating Tests

The framework includes a test generator that fetches components from the library.json endpoint and generates individual tests for each component:

```bash
npm run test:visual:generate
```

This will:
1. Fetch components from the library.json endpoint
2. Generate the visual.spec.ts file with individual tests for each component
3. Use fallback components if the endpoint is not accessible

#### Running Tests

To run the visual tests (this will also generate the tests first):

```bash
npm run test:visual
```

To update baseline screenshots:

```bash
npm run test:visual:update
```

Or you can use the Playwright commands directly (after generating tests):

```bash
npx playwright test --config=tests/playwright.config.js
```

To run tests for a specific browser:

```bash
npx playwright test --config=tests/playwright.config.js --project=chromium
```

### Server Requirements

The tests require access to the `/tools/sidekick/library.json` endpoint, which should return a JSON object with the following structure:

```json
{
  "blocks": {
    "data": [
      {"name": "component-name", "path": "/path/to/component"},
      ...
    ]
  }
}
```

Make sure your AEM server is properly configured to serve this endpoint.

### Troubleshooting Server Issues

If you encounter server-related errors:

1. **Port already in use**: Ensure no other process is using the required ports
2. **AEM server issues**: Start the AEM server manually before running tests:
   ```bash
   aem up
   ```
3. **Git repository errors**: If you see "aem up needs local git repository", initialize a git repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

## Configuration

You can customize the testing framework by editing the `visual-test-config.js` file:

### Viewports

Define the viewports you want to test:

```javascript
viewports: [
  { name: 'mobile', width: 375, height: 667 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1280, height: 720 },
  { name: 'widescreen', width: 1920, height: 1080 }
]
```

### Browsers

Enable or disable specific browsers:

```javascript
browsers: [
  { name: 'chromium', enabled: true },
  { name: 'firefox', enabled: true },
  { name: 'webkit', enabled: false }
]
```

### Additional Options

Configure additional options:

```javascript
options: {
  // Wait time in milliseconds before taking screenshots
  stabilizationTime: 500,
  
  // Whether to run tests in parallel across components
  parallelizeComponents: true,
  
  // Custom selectors for components
  customSelectors: {
    'cards': '.cards-container'
  }
}
```

## How It Works

1. The test framework fetches components from `/tools/sidekick/library.json`
2. For each viewport defined in the configuration:
   - Sets the viewport size
   - For each component:
     - Navigates to the component's page
     - Waits for the component to be visible
     - Takes a screenshot for comparison

## Troubleshooting

If a test fails due to visual differences:

1. Check the Playwright report to see the differences
2. If the differences are expected, update the baseline screenshots
3. If the component selector is incorrect, update the `customSelectors` in the configuration

## Alternative Implementation

The test file includes an alternative implementation (commented out) that creates separate tests for each component. This can be useful for more detailed reporting but may increase test execution time.
