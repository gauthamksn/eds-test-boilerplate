/**
 * Create a results view for displaying test results
 * @param {Array} results - Test results
 * @returns {HTMLElement} - Results element
 */
export function createResultsView(results) {
  const resultsContainer = document.createElement('div');
  resultsContainer.className = 'test-results';
  
  // Create results summary
  const summary = createResultsSummary(results);
  
  // Create results list
  const resultsList = createResultsList(results);
  
  // Append all elements to results container
  resultsContainer.appendChild(summary);
  resultsContainer.appendChild(resultsList);
  
  return resultsContainer;
}

/**
 * Create results summary
 * @param {Array} results - Test results
 * @returns {HTMLElement} - Summary element
 */
function createResultsSummary(results) {
  const summary = document.createElement('div');
  summary.className = 'results-summary';
  
  const passedTests = results.filter(result => result.passed).length;
  const totalTests = results.length;
  
  const summaryText = document.createElement('p');
  summaryText.textContent = `${passedTests} of ${totalTests} tests passed`;
  summaryText.className = passedTests === totalTests ? 'all-passed' : 'some-failed';
  
  summary.appendChild(summaryText);
  
  return summary;
}

/**
 * Create results list
 * @param {Array} results - Test results
 * @returns {HTMLElement} - Results list element
 */
function createResultsList(results) {
  const resultsList = document.createElement('div');
  resultsList.className = 'results-list';
  
  // Group results by block name
  const resultsByBlock = groupResultsByBlock(results);
  
  // Create accordion items for each block
  Object.entries(resultsByBlock).forEach(([blockName, blockResults]) => {
    const resultItem = createResultItem(blockName, blockResults);
    resultsList.appendChild(resultItem);
  });
  
  return resultsList;
}

/**
 * Group results by block name
 * @param {Array} results - Test results
 * @returns {Object} - Results grouped by block name
 */
function groupResultsByBlock(results) {
  const resultsByBlock = {};
  results.forEach(result => {
    if (!resultsByBlock[result.blockName]) {
      resultsByBlock[result.blockName] = [];
    }
    resultsByBlock[result.blockName].push(result);
  });
  return resultsByBlock;
}

/**
 * Create a result item for a block
 * @param {string} blockName - Block name
 * @param {Array} blockResults - Results for the block
 * @returns {HTMLElement} - Result item element
 */
function createResultItem(blockName, blockResults) {
  const resultItem = document.createElement('div');
  resultItem.className = `result-item ${blockResults.every(r => r.passed) ? 'passed' : 'failed'}`;
  
  // Create accordion header
  const resultHeader = createResultHeader(blockName, blockResults);
  
  // Create accordion content
  const resultDetails = createResultDetails(blockName, blockResults);
  
  // Add click event to toggle accordion
  resultHeader.addEventListener('click', () => {
    // Toggle visibility
    const isVisible = resultDetails.style.display !== 'none';
    resultDetails.style.display = isVisible ? 'none' : 'block';
    
    // Toggle icon rotation
    const toggleIcon = resultHeader.querySelector('.toggle-icon');
    toggleIcon.classList.toggle('rotated', !isVisible);
    
    // Toggle active class on header
    resultHeader.classList.toggle('active', !isVisible);
  });
  
  resultItem.appendChild(resultHeader);
  resultItem.appendChild(resultDetails);
  
  return resultItem;
}

/**
 * Create a result header
 * @param {string} blockName - Block name
 * @param {Array} blockResults - Results for the block
 * @returns {HTMLElement} - Result header element
 */
function createResultHeader(blockName, blockResults) {
  const resultHeader = document.createElement('div');
  resultHeader.className = 'result-header accordion-header';
  
  const resultTitle = document.createElement('h3');
  resultTitle.textContent = blockName;
  
  const resultStatus = document.createElement('span');
  resultStatus.className = 'result-status';
  resultStatus.textContent = blockResults.every(r => r.passed) ? 'PASSED' : 'FAILED';
  
  // Add expand/collapse icon
  const toggleIcon = document.createElement('div');
  toggleIcon.className = 'toggle-icon';
  toggleIcon.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  `;
  
  resultHeader.appendChild(resultTitle);
  resultHeader.appendChild(resultStatus);
  resultHeader.appendChild(toggleIcon);
  
  return resultHeader;
}

/**
 * Create result details
 * @param {string} blockName - Block name
 * @param {Array} blockResults - Results for the block
 * @returns {HTMLElement} - Result details element
 */
function createResultDetails(blockName, blockResults) {
  const resultDetails = document.createElement('div');
  resultDetails.className = 'result-details accordion-content';
  resultDetails.style.display = 'none'; // Hidden by default
  
  // Create result info section (outside tabs)
  const resultInfo = createResultInfo(blockName, blockResults);
  resultDetails.appendChild(resultInfo);
  
  // Create breakpoint tabs
  const breakpointTabs = createBreakpointTabs(blockResults);
  resultDetails.appendChild(breakpointTabs);
  
  return resultDetails;
}

/**
 * Create result info
 * @param {string} blockName - Block name
 * @param {Array} blockResults - Results for the block
 * @returns {HTMLElement} - Result info element
 */
function createResultInfo(blockName, blockResults) {
  const resultInfo = document.createElement('div');
  resultInfo.className = 'result-info';
  
  // Add block info
  const blockInfo = document.createElement('p');
  blockInfo.className = 'block-info';
  blockInfo.innerHTML = `<strong>Block:</strong> ${blockName}`;
  resultInfo.appendChild(blockInfo);
  
  // Add baseline URL (using the first result's URL)
  if (blockResults[0] && blockResults[0].baselineUrl) {
    const baselineUrlInfo = document.createElement('p');
    baselineUrlInfo.className = 'url-info';
    baselineUrlInfo.innerHTML = `<strong>Baseline URL:</strong> <a href="${blockResults[0].baselineUrl}" target="_blank">${blockResults[0].baselineUrl}</a>`;
    resultInfo.appendChild(baselineUrlInfo);
  }
  
  // Add current URL (using the first result's URL)
  if (blockResults[0] && blockResults[0].currentUrl) {
    const currentUrlInfo = document.createElement('p');
    currentUrlInfo.className = 'url-info';
    currentUrlInfo.innerHTML = `<strong>Current URL:</strong> <a href="${blockResults[0].currentUrl}" target="_blank">${blockResults[0].currentUrl}</a>`;
    resultInfo.appendChild(currentUrlInfo);
  }
  
  return resultInfo;
}

/**
 * Create breakpoint tabs
 * @param {Array} blockResults - Results for the block
 * @returns {HTMLElement} - Breakpoint tabs element
 */
function createBreakpointTabs(blockResults) {
  const breakpointTabs = document.createElement('div');
  breakpointTabs.className = 'breakpoint-tabs';
  
  const breakpointTabList = document.createElement('div');
  breakpointTabList.className = 'breakpoint-tab-list';
  
  const breakpointTabContent = document.createElement('div');
  breakpointTabContent.className = 'breakpoint-tab-content';
  
  // Add tabs for each breakpoint
  blockResults.forEach((result, index) => {
    // Create tab button
    const tabButton = document.createElement('button');
    tabButton.className = `breakpoint-tab-button ${index === 0 ? 'active' : ''}`;
    tabButton.textContent = result.breakpoint ? result.breakpoint.name : 'Default';
    tabButton.dataset.tabIndex = index;
    
    // Create tab content
    const tabContent = document.createElement('div');
    tabContent.className = `breakpoint-tab-pane ${index === 0 ? 'active' : ''}`;
    tabContent.dataset.tabIndex = index;
    
    if (result.error) {
      const errorMessage = document.createElement('p');
      errorMessage.className = 'error-message';
      errorMessage.textContent = `Error: ${result.error}`;
      tabContent.appendChild(errorMessage);
    } else {
      // Add breakpoint info and difference percentage
      const tabInfo = createTabInfo(result);
      tabContent.appendChild(tabInfo);
      
      // Create image comparison view
      const imageComparison = createImageComparison(result);
      tabContent.appendChild(imageComparison);
    }
    
    // Add tab button to tab list
    breakpointTabList.appendChild(tabButton);
    
    // Add tab content to tab content container
    breakpointTabContent.appendChild(tabContent);
    
    // Add click event to tab button
    tabButton.addEventListener('click', () => {
      // Remove active class from all tab buttons
      Array.from(breakpointTabList.querySelectorAll('.breakpoint-tab-button')).forEach(btn => {
        btn.classList.remove('active');
      });
      
      // Remove active class from all tab panes
      Array.from(breakpointTabContent.querySelectorAll('.breakpoint-tab-pane')).forEach(pane => {
        pane.classList.remove('active');
      });
      
      // Add active class to clicked tab button
      tabButton.classList.add('active');
      
      // Add active class to corresponding tab pane
      const tabPane = breakpointTabContent.querySelector(`.breakpoint-tab-pane[data-tab-index="${index}"]`);
      if (tabPane) {
        tabPane.classList.add('active');
      }
    });
  });
  
  // Add tabs to breakpoint tabs container
  breakpointTabs.appendChild(breakpointTabList);
  breakpointTabs.appendChild(breakpointTabContent);
  
  return breakpointTabs;
}

/**
 * Create tab info
 * @param {Object} result - Test result
 * @returns {HTMLElement} - Tab info element
 */
function createTabInfo(result) {
  const tabInfo = document.createElement('div');
  tabInfo.className = 'tab-info';
  
  // Add breakpoint info
  if (result.breakpoint) {
    const breakpointInfo = document.createElement('p');
    breakpointInfo.className = 'breakpoint-info';
    breakpointInfo.innerHTML = `<strong>Breakpoint:</strong> ${result.breakpoint.name} (${result.breakpoint.width}x${result.breakpoint.height})`;
    tabInfo.appendChild(breakpointInfo);
  }
  
  // Add difference percentage
  const diffPercentage = document.createElement('p');
  diffPercentage.className = 'diff-percentage';
  diffPercentage.innerHTML = `<strong>Difference:</strong> ${(result.diffPercentage * 100).toFixed(2)}%`;
  tabInfo.appendChild(diffPercentage);
  
  return tabInfo;
}

/**
 * Create image comparison
 * @param {Object} result - Test result
 * @returns {HTMLElement} - Image comparison element
 */
function createImageComparison(result) {
  const imageComparison = document.createElement('div');
  imageComparison.className = 'image-comparison';
  
  // Baseline image
  const baselineContainer = createImageContainer('Baseline', result.baselineImage, result.blockName);
  
  // Current image
  const currentContainer = createImageContainer('Current', result.currentImage, result.blockName);
  
  // Diff image
  const diffContainer = createImageContainer('Diff', result.diffImage, result.blockName);
  
  // Append all images to comparison container
  imageComparison.appendChild(baselineContainer);
  imageComparison.appendChild(currentContainer);
  imageComparison.appendChild(diffContainer);
  
  return imageComparison;
}

/**
 * Create image container
 * @param {string} label - Image label
 * @param {string} imageSrc - Image source
 * @param {string} blockName - Block name
 * @returns {HTMLElement} - Image container element
 */
function createImageContainer(label, imageSrc, blockName) {
  const container = document.createElement('div');
  container.className = 'image-container';
  
  const labelElement = document.createElement('p');
  labelElement.textContent = label;
  
  // Create image wrapper
  const imageWrapper = document.createElement('div');
  imageWrapper.className = 'image-wrapper';
  
  const image = document.createElement('img');
  // Fix double slashes by ensuring we have exactly one leading slash
  const imageSource = imageSrc.startsWith('/') 
    ? imageSrc 
    : `/${imageSrc}`;
  image.src = imageSource;
  image.alt = `${blockName} ${label.toLowerCase()}`;
  image.loading = 'lazy';
  image.className = 'clickable-image';
  image.title = 'Click to open in new tab';
  
  // Add click event to open image in new tab
  imageWrapper.addEventListener('click', () => {
    window.open(imageSource, '_blank');
  });
  
  imageWrapper.appendChild(image);
  
  // Add zoom icon
  const zoomIcon = document.createElement('div');
  zoomIcon.className = 'zoom-icon';
  zoomIcon.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      <line x1="11" y1="8" x2="11" y2="14"></line>
      <line x1="8" y1="11" x2="14" y2="11"></line>
    </svg>
  `;
  imageWrapper.appendChild(zoomIcon);
  
  container.appendChild(labelElement);
  container.appendChild(imageWrapper);
  
  return container;
}
