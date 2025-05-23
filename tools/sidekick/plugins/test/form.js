/**
 * Create a form for configuring visual tests
 * @param {Object} data - Plugin data containing blocks information
 * @param {Object} config - Plugin configuration
 * @param {Function} onSubmit - Submit handler
 * @returns {HTMLElement} - Form element
 */
export function createTestForm(data, config, onSubmit) {
  const form = document.createElement('form');
  form.className = 'visual-test-form';
  
  // Create baseline URL input
  const baselineUrlGroup = createBaselineUrlInput(config);
  
  // Create current URL input
  const currentUrlGroup = createCurrentUrlInput(config);
  
  // Create breakpoint selection
  const breakpointSelectionGroup = createBreakpointSelection(config);
  
  // Create fetch baseline option
  const fetchBaselineGroup = createFetchBaselineOption();
  
  // Create block selection
  const blockSelectionGroup = createBlockSelection(data);
  
  // Create submit button
  const submitButton = document.createElement('sp-button');
  submitButton.variant = 'primary';
  submitButton.textContent = 'Run Visual Tests';
  submitButton.type = 'submit';
  
  // Add event listener for form submission
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    
    const formData = new FormData(form);
    const baselineUrl = formData.get('baselineUrl');
    const currentUrl = formData.get('currentUrl');
    const fetchBaselineIfMissing = formData.get('fetchBaselineIfMissing') === 'on';
    
    // Get selected breakpoints
    const selectedBreakpoints = Array.from(
      form.querySelectorAll('input[name="selectedBreakpoints"]:checked')
    ).map(checkbox => {
      try {
        return JSON.parse(checkbox.value);
      } catch (e) {
        console.error('Error parsing breakpoint data:', e);
        return null;
      }
    }).filter(Boolean);
    
    // Get selected blocks
    const selectedBlocks = Array.from(
      form.querySelectorAll('input[name="selectedBlocks"]:checked')
    ).map(checkbox => {
      try {
        const blockData = JSON.parse(checkbox.value);
        return {
          ...blockData,
          selector: checkbox.dataset.selector
        };
      } catch (e) {
        console.error('Error parsing block data:', e);
        return {
          name: 'unknown',
          path: '/unknown',
          sample: '',
          selector: checkbox.dataset.selector
        };
      }
    });
    
    onSubmit({
      baselineUrl,
      currentUrl,
      selectedBlocks,
      selectedBreakpoints,
      fetchBaselineIfMissing
    });
  });
  
  // Append all elements to form
  form.appendChild(baselineUrlGroup);
  form.appendChild(currentUrlGroup);
  form.appendChild(breakpointSelectionGroup);
  form.appendChild(fetchBaselineGroup);
  form.appendChild(blockSelectionGroup);
  form.appendChild(submitButton);
  
  return form;
}

/**
 * Create baseline URL input
 * @param {Object} config - Plugin configuration
 * @returns {HTMLElement} - Form group element
 */
function createBaselineUrlInput(config) {
  const baselineUrlGroup = document.createElement('div');
  baselineUrlGroup.className = 'form-group';
  
  const baselineUrlLabel = document.createElement('label');
  baselineUrlLabel.textContent = 'Baseline URL (main branch):';
  baselineUrlLabel.setAttribute('for', 'baseline-url');
  
  const baselineUrlInput = document.createElement('input');
  baselineUrlInput.type = 'text';
  baselineUrlInput.id = 'baseline-url';
  baselineUrlInput.name = 'baselineUrl';
  baselineUrlInput.placeholder = 'https://main--project--owner.hlx.page/';
  baselineUrlInput.value = config.defaultBaselineUrl || '';
  
  baselineUrlGroup.appendChild(baselineUrlLabel);
  baselineUrlGroup.appendChild(baselineUrlInput);
  
  return baselineUrlGroup;
}

/**
 * Create current URL input
 * @param {Object} config - Plugin configuration
 * @returns {HTMLElement} - Form group element
 */
function createCurrentUrlInput(config) {
  const currentUrlGroup = document.createElement('div');
  currentUrlGroup.className = 'form-group';
  
  const currentUrlLabel = document.createElement('label');
  currentUrlLabel.textContent = 'Current URL:';
  currentUrlLabel.setAttribute('for', 'current-url');
  
  const currentUrlInput = document.createElement('input');
  currentUrlInput.type = 'text';
  currentUrlInput.id = 'current-url';
  currentUrlInput.name = 'currentUrl';
  currentUrlInput.value = config.defaultCurrentUrl || window.location.href;
  
  currentUrlGroup.appendChild(currentUrlLabel);
  currentUrlGroup.appendChild(currentUrlInput);
  
  return currentUrlGroup;
}

/**
 * Create fetch baseline option
 * @returns {HTMLElement} - Form group element
 */
function createFetchBaselineOption() {
  const fetchBaselineGroup = document.createElement('div');
  fetchBaselineGroup.className = 'form-group';
  
  const fetchBaselineOption = document.createElement('div');
  fetchBaselineOption.className = 'fetch-baseline-option';
  
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.id = 'fetch-baseline-if-missing';
  checkbox.name = 'fetchBaselineIfMissing';
  checkbox.checked = false; // Default to unchecked
  
  const label = document.createElement('label');
  label.setAttribute('for', 'fetch-baseline-if-missing');
  label.textContent = 'Fetch baseline images only if missing';
  
  fetchBaselineOption.appendChild(checkbox);
  fetchBaselineOption.appendChild(label);
  fetchBaselineGroup.appendChild(fetchBaselineOption);
  
  return fetchBaselineGroup;
}

/**
 * Create breakpoint selection
 * @param {Object} config - Plugin configuration
 * @returns {HTMLElement} - Form group element
 */
function createBreakpointSelection(config) {
  const breakpointSelectionGroup = document.createElement('div');
  breakpointSelectionGroup.className = 'form-group';
  
  const breakpointSelectionLabel = document.createElement('label');
  breakpointSelectionLabel.textContent = 'Select breakpoints to test:';
  
  const breakpointSelection = document.createElement('div');
  breakpointSelection.className = 'breakpoint-selection';
  
  // Use breakpoints from config
  const breakpoints = config.breakpoints || [];
  breakpoints.forEach((breakpoint, index) => {
    const breakpointOption = document.createElement('div');
    breakpointOption.className = 'breakpoint-option';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `breakpoint-${index}`;
    checkbox.name = 'selectedBreakpoints';
    checkbox.value = JSON.stringify(breakpoint);
    checkbox.checked = true; // Default to checked
    
    const label = document.createElement('label');
    label.setAttribute('for', `breakpoint-${index}`);
    label.textContent = `${breakpoint.name} (${breakpoint.width}x${breakpoint.height})`;
    
    breakpointOption.appendChild(checkbox);
    breakpointOption.appendChild(label);
    breakpointSelection.appendChild(breakpointOption);
  });
  
  breakpointSelectionGroup.appendChild(breakpointSelectionLabel);
  breakpointSelectionGroup.appendChild(breakpointSelection);
  
  return breakpointSelectionGroup;
}

/**
 * Create block selection
 * @param {Object} data - Plugin data containing blocks information
 * @returns {HTMLElement} - Form group element
 */
function createBlockSelection(data) {
  const blockSelectionGroup = document.createElement('div');
  blockSelectionGroup.className = 'form-group';
  
  const blockSelectionLabel = document.createElement('label');
  blockSelectionLabel.textContent = 'Select blocks to test:';
  
  blockSelectionGroup.appendChild(blockSelectionLabel);
  
  const blockSelection = document.createElement('div');
  blockSelection.className = 'block-selection';
  
  // Create select all option inside the block selection
  const selectAllContainer = document.createElement('div');
  selectAllContainer.className = 'select-all-container';
  
  const selectAllCheckbox = document.createElement('input');
  selectAllCheckbox.type = 'checkbox';
  selectAllCheckbox.id = 'select-all-blocks';
  selectAllCheckbox.name = 'selectAllBlocks';
  
  const selectAllLabel = document.createElement('label');
  selectAllLabel.setAttribute('for', 'select-all-blocks');
  selectAllLabel.textContent = 'Select All';
  selectAllLabel.className = 'select-all-label';
  
  selectAllContainer.appendChild(selectAllCheckbox);
  selectAllContainer.appendChild(selectAllLabel);
  blockSelection.appendChild(selectAllContainer);
  
  // Use blocks from data argument
  const blocks = data || [];
  const blockCheckboxes = [];
  
  blocks.forEach((block, index) => {
    const blockOption = document.createElement('div');
    blockOption.className = 'block-option';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `block-${index}`;
    checkbox.name = 'selectedBlocks';
    checkbox.value = JSON.stringify(block);
    checkbox.dataset.selector = `.${block.name}.block`;
    
    const label = document.createElement('label');
    label.setAttribute('for', `block-${index}`);
    label.textContent = `${block.name}${block.sample ? ` (${block.sample})` : ''}`;
    
    blockOption.appendChild(checkbox);
    blockOption.appendChild(label);
    blockSelection.appendChild(blockOption);
    
    // Add to blockCheckboxes array for select all functionality
    blockCheckboxes.push(checkbox);
  });
  
  // Add select all functionality
  selectAllCheckbox.addEventListener('change', () => {
    const isChecked = selectAllCheckbox.checked;
    blockCheckboxes.forEach(checkbox => {
      checkbox.checked = isChecked;
    });
  });
  
  // Add listener to update select all checkbox when individual checkboxes change
  blockCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      const allChecked = blockCheckboxes.every(cb => cb.checked);
      const someChecked = blockCheckboxes.some(cb => cb.checked);
      
      selectAllCheckbox.checked = allChecked;
      selectAllCheckbox.indeterminate = someChecked && !allChecked;
    });
  });
  
  blockSelectionGroup.appendChild(blockSelection);
  
  return blockSelectionGroup;
}
