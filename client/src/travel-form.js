(function() {
    'use strict';

    // DOM elements
    const form = document.getElementById('travelBookingForm');
    const submitBtn = document.getElementById('submitBtn');
    const submitText = document.getElementById('submitText');
    const submitSpinner = document.getElementById('submitSpinner');
    const fileSizeLimitToggle = document.getElementById('fileSizeLimit');
    const fileSizeText = document.getElementById('fileSizeText');
    const documentUpload = document.getElementById('documentUpload');
    const fileInfo = document.getElementById('fileInfo');
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');
    const removeFileBtn = document.getElementById('removeFile');
    const dropZone = document.getElementById('dropZone');
    
    let includesCounter = 7; // Start after preset items (a-g)
    let excludesCounter = 2; // Start after preset items (a-b)

    // Preset data
    const presetIncludes = [
        "Return International air fare + airport taxes + fuel surcharges + 20kg checked luggage",
        "Stay 05 Night as per itinerary based on twin / triple sharing",
        "Private touring in A/C coach with local Mandarin speaking guide as per itinerary",
        "Meals as per itinerary",
        "Tipping of tour guide & driver",
        "Travel Insurance (for age above 69 years old, require to top up RM108)",
        "01 tour leader service"
    ];

    const presetExcludes = [
        "Hotel Portage in/out luggage",
        "Other expenses which are not indicated in itinerary"
    ];

    // Initialize the form
    function init() {
        populatePresetItems();
        attachEventListeners();
        updateFileSizeText();
    }

    // Populate preset items in the lists
    function populatePresetItems() {
        const includesList = document.getElementById('includesList');
        const excludesList = document.getElementById('excludesList');

        // Populate includes
        presetIncludes.forEach((item, index) => {
            const letter = String.fromCharCode(97 + index); // a, b, c...
            const itemDiv = createPresetItem(letter, item);
            includesList.appendChild(itemDiv);
        });

        // Populate excludes
        presetExcludes.forEach((item, index) => {
            const letter = String.fromCharCode(97 + index); // a, b
            const itemDiv = createPresetItem(letter, item);
            excludesList.appendChild(itemDiv);
        });
    }

    // Create preset item element
    function createPresetItem(letter, text) {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'flex items-start space-x-3';
        itemDiv.setAttribute('data-preset', 'true');
        itemDiv.innerHTML = `
            <span class="text-primary font-medium" data-testid="text-item-letter">${letter})</span>
            <span class="text-card-foreground">${text}</span>
        `;
        return itemDiv;
    }

    // Attach event listeners
    function attachEventListeners() {
        // File size limit toggle
        fileSizeLimitToggle.addEventListener('change', handleFileSizeLimitToggle);

        // File upload
        documentUpload.addEventListener('change', handleFileUpload);
        removeFileBtn.addEventListener('click', clearFile);

        // Drag and drop
        dropZone.addEventListener('dragover', handleDragOver);
        dropZone.addEventListener('dragleave', handleDragLeave);
        dropZone.addEventListener('drop', handleDrop);

        // Dynamic list management
        document.getElementById('addIncludeBtn').addEventListener('click', () => {
            includesCounter = addListItem('includesList', includesCounter);
        });

        document.getElementById('addExcludeBtn').addEventListener('click', () => {
            excludesCounter = addListItem('excludesList', excludesCounter);
        });

        // Form submission
        form.addEventListener('submit', handleFormSubmit);

        // Real-time validation
        form.addEventListener('input', handleRealTimeValidation);
    }

    // File size limit toggle handler
    function handleFileSizeLimitToggle() {
        updateFileSizeText();
        validateFile();
    }

    function updateFileSizeText() {
        const limitEnabled = fileSizeLimitToggle.checked;
        fileSizeText.textContent = limitEnabled ? '10MB' : 'unlimited';
    }

    // Dynamic list management
    function addListItem(listId, counter) {
        const list = document.getElementById(listId);
        const letter = String.fromCharCode(97 + counter); // Convert to letter
        
        const itemDiv = document.createElement('div');
        itemDiv.className = 'flex items-start space-x-3 fade-in';
        itemDiv.innerHTML = `
            <span class="text-primary font-medium" data-testid="text-item-letter">${letter})</span>
            <input type="text" 
                   class="flex-1 px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-ring focus:border-transparent text-sm"
                   placeholder="Enter custom item..."
                   data-testid="input-custom-item"
                   required>
            <button type="button" 
                    class="text-destructive hover:text-destructive/80 transition-colors duration-200"
                    onclick="removeListItem(this)"
                    data-testid="button-remove-item">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        `;
        
        list.appendChild(itemDiv);
        return counter + 1;
    }

    // Global function for removing list items
    window.removeListItem = function(button) {
        const item = button.closest('.flex');
        item.classList.add('slide-out');
        setTimeout(() => {
            item.remove();
            // In a production app, you would renumber items here
        }, 300);
    };

    // Drag and drop handlers
    function handleDragOver(event) {
        event.preventDefault();
        dropZone.classList.add('drag-over');
    }

    function handleDragLeave(event) {
        event.preventDefault();
        dropZone.classList.remove('drag-over');
    }

    function handleDrop(event) {
        event.preventDefault();
        dropZone.classList.remove('drag-over');
        
        const files = event.dataTransfer.files;
        if (files.length > 0) {
            documentUpload.files = files;
            handleFileUpload({ target: documentUpload });
        }
    }

    // File upload handling
    function handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        // File type validation
        const allowedTypes = ['.pdf', '.doc', '.docx'];
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
        
        if (!allowedTypes.includes(fileExtension)) {
            showError('Invalid file type. Please upload PDF, DOC, or DOCX files only.');
            clearFile();
            return;
        }

        // File size validation
        const limitEnabled = fileSizeLimitToggle.checked;
        const maxSize = limitEnabled ? 10 * 1024 * 1024 : Infinity; // 10MB in bytes
        
        if (file.size > maxSize) {
            showError(`File size exceeds ${limitEnabled ? '10MB' : 'unlimited'} limit.`);
            clearFile();
            return;
        }

        // Display file info
        fileName.textContent = file.name;
        fileSize.textContent = formatFileSize(file.size);
        fileInfo.classList.remove('hidden');
        clearErrors(documentUpload.closest('.form-group'));
    }

    function clearFile() {
        documentUpload.value = '';
        fileInfo.classList.add('hidden');
    }

    function validateFile() {
        if (documentUpload.files.length > 0) {
            handleFileUpload({ target: documentUpload });
        }
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Real-time validation
    function handleRealTimeValidation(event) {
        const field = event.target;
        const formGroup = field.closest('.form-group');
        
        if (formGroup) {
            if (field.hasAttribute('required') && !field.value.trim()) {
                // Don't show error immediately, wait for blur or submit
                return;
            } else {
                clearErrors(formGroup);
            }
        }
    }

    // Form validation
    function validateForm() {
        let isValid = true;
        const requiredFields = form.querySelectorAll('[required]');
        
        // Clear all previous errors
        form.querySelectorAll('.form-group').forEach(group => {
            clearErrors(group);
        });
        
        requiredFields.forEach(field => {
            const formGroup = field.closest('.form-group');
            if (!field.value.trim()) {
                showFieldError(formGroup, 'This field is required');
                isValid = false;
            }
        });

        // Special validation for file upload
        if (documentUpload.files.length === 0) {
            const fileFormGroup = documentUpload.closest('.form-group');
            showFieldError(fileFormGroup, 'Please upload a document file');
            isValid = false;
        }

        return isValid;
    }

    function showFieldError(formGroup, message) {
        if (!formGroup) return;
        formGroup.classList.add('error');
        const errorMsg = formGroup.querySelector('.error-message');
        if (errorMsg) {
            errorMsg.textContent = message;
        }
    }

    function clearErrors(formGroup) {
        if (!formGroup) return;
        formGroup.classList.remove('error');
    }

    // Status messages
    function showError(message) {
        showStatusMessage(message, 'error');
    }

    function showSuccess(message) {
        showStatusMessage(message, 'success');
    }

    function showStatusMessage(message, type) {
        const statusMessages = document.getElementById('statusMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `px-4 py-3 rounded-lg shadow-lg max-w-sm fade-in status-message ${
            type === 'error' ? 'bg-destructive text-destructive-foreground' : 'bg-primary text-primary-foreground'
        }`;
        messageDiv.innerHTML = `
            <div class="flex items-center space-x-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    ${type === 'error' 
                        ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>'
                        : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>'
                    }
                </svg>
                <span>${message}</span>
            </div>
        `;
        
        statusMessages.appendChild(messageDiv);
        
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
    }

    // Form submission
    async function handleFormSubmit(event) {
        event.preventDefault();
        
        if (!validateForm()) {
            showError('Please fix the validation errors before submitting.');
            return;
        }

        // Show loading state
        submitBtn.disabled = true;
        submitText.classList.add('hidden');
        submitSpinner.classList.remove('hidden');

        try {
            // Collect form data
            const formData = await collectFormData();
            
            // Submit to backend
            await submitToBackend(formData);
            
            showSuccess('Travel booking form submitted successfully!');
            form.reset();
            clearFile();
            
            // Reset counters and clear custom items
            includesCounter = 7;
            excludesCounter = 2;
            clearCustomItems();
            
        } catch (error) {
            showError('Failed to submit form. Please try again.');
            console.error('Submission error:', error);
        } finally {
            // Reset loading state
            submitBtn.disabled = false;
            submitText.classList.remove('hidden');
            submitSpinner.classList.add('hidden');
        }
    }

    function clearCustomItems() {
        // Remove all custom items (not preset items)
        document.querySelectorAll('#includesList .flex:not([data-preset])').forEach(item => {
            item.remove();
        });
        document.querySelectorAll('#excludesList .flex:not([data-preset])').forEach(item => {
            item.remove();
        });
    }

    async function collectFormData() {
        const formData = new FormData(form);
        
        // Collect dynamic list items
        const includesItems = Array.from(document.querySelectorAll('#includesList .flex')).map(item => {
            const textElement = item.querySelector('span:last-child') || item.querySelector('input');
            return textElement.textContent || textElement.value;
        }).filter(Boolean);

        const excludesItems = Array.from(document.querySelectorAll('#excludesList .flex')).map(item => {
            const textElement = item.querySelector('span:last-child') || item.querySelector('input');
            return textElement.textContent || textElement.value;
        }).filter(Boolean);

        // Create JSON structure
        const data = {
            starting_date: formData.get('startingDate') || null,
            meals_provided: formData.get('mealsProvided') === 'yes',
            flight_information: formData.get('flightInfo') || '',
            tour_fair_includes: includesItems,
            tour_fair_excludes: excludesItems,
            uploaded_file: null,
            file_size_limit_enabled: fileSizeLimitToggle.checked
        };

        // Handle file upload
        const file = documentUpload.files[0];
        if (file) {
            const base64Data = await fileToBase64(file);
            data.uploaded_file = {
                filename: file.name,
                size: file.size,
                type: file.type,
                data: base64Data
            };
        }

        return data;
    }

    function fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                // Remove the data URL prefix (e.g., "data:application/pdf;base64,")
                const base64 = reader.result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = error => reject(error);
        });
    }

    async function submitToBackend(data) {
        const response = await fetch('/api/travel-booking', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        return response.json();
    }

    // Initialize the application
    document.addEventListener('DOMContentLoaded', init);

})();
