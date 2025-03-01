// Theme toggle functionality
const themeToggle = document.getElementById('themeToggle');
const htmlElement = document.documentElement;
const moonIcon = '<i class="fas fa-moon"></i>';
const sunIcon = '<i class="fas fa-sun"></i>';

// Load saved theme from localStorage
const savedTheme = localStorage.getItem('theme') || 'light';
htmlElement.setAttribute('data-theme', savedTheme);
themeToggle.innerHTML = savedTheme === 'light' ? moonIcon : sunIcon;

themeToggle.addEventListener('click', () => {
  const currentTheme = htmlElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';

  htmlElement.setAttribute('data-theme', newTheme);
  themeToggle.innerHTML = newTheme === 'light' ? moonIcon : sunIcon;
  localStorage.setItem('theme', newTheme);
});

// File handling
const fileInput = document.getElementById('fileInput');
const filePreview = document.getElementById('filePreview');
const fileMetadata = document.getElementById('fileMetadata');
const MAX_FILES = 10;

// File type mapping
const FILE_TYPES = {
  // Images
  'image/jpeg': 'IMAGE',
  'image/png': 'IMAGE',
  'image/gif': 'IMAGE',
  'image/webp': 'IMAGE',
  'image/svg+xml': 'IMAGE',

  // Videos
  'video/mp4': 'VIDEO',
  'video/webm': 'VIDEO',
  'video/ogg': 'VIDEO',

  // Spreadsheets
  'text/csv': 'CSV',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'XLSX',
  'application/vnd.ms-excel': 'XLS',

  // PDF
  'application/pdf': 'PDF',

  // Text/Code
  'text/plain': 'TEXT',
  'text/javascript': 'CODE',
  'application/javascript': 'CODE',
  'text/typescript': 'CODE',
  'text/x-python': 'CODE',
  'text/x-c': 'CODE',
  'text/html': 'CODE',
  'text/css': 'CODE',
  'application/json': 'CODE',
};

// Code file extensions mapping
const CODE_EXTENSIONS = {
  js: 'javascript',
  ts: 'typescript',
  py: 'python',
  c: 'c',
  cpp: 'cpp',
  h: 'c',
  hpp: 'cpp',
  html: 'html',
  css: 'css',
  json: 'json',
  md: 'markdown',
  txt: 'plaintext',
};

// File change event
fileInput.addEventListener('change', function (event) {
  filePreview.innerHTML = '';
  fileMetadata.innerHTML = '';

  const files = event.target.files;

  if (files.length === 0) {
    showMessage('No files selected', 'info');
    return;
  }

  if (files.length > MAX_FILES) {
    showMessage(
      `Maximum ${MAX_FILES} files allowed. Only the first ${MAX_FILES} will be processed.`,
      'info'
    );
  }

  const filesToProcess = Array.from(files).slice(0, MAX_FILES);

  // Process each file
  filesToProcess.forEach((file) => {
    displayFileMetadata(file);
    processFile(file);
  });
});

// Display file metadata
function displayFileMetadata(file) {
  const fileExtension = getFileExtension(file.name);
  const fileSize = formatFileSize(file.size);
  const fileType = getFileType(file);
  const lastModified = new Date(file.lastModified).toLocaleString();

  const metadataCard = document.createElement('div');
  metadataCard.className = 'metadata-card';
  metadataCard.id = `metadata-${generateFileId(file)}`;

  metadataCard.innerHTML = `
        <div class="metadata-header">
            <div class="metadata-title">${file.name}</div>
            <div class="metadata-actions">
                <div class="file-type-tag">${fileType}</div>
                <button class="fullscreen-button" data-file-id="${generateFileId(
                  file
                )}" title="View in full screen">
                    <i class="fas fa-expand"></i>
                </button>
                <button class="close-button" data-file-id="${generateFileId(
                  file
                )}" title="Close file">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
        <div class="metadata-details">
            <div class="metadata-item">
                <span class="metadata-label">Type</span>
                <span class="metadata-value">${file.type || 'Unknown'}</span>
            </div>
            <div class="metadata-item">
                <span class="metadata-label">Size</span>
                <span class="metadata-value">${fileSize}</span>
            </div>
            <div class="metadata-item">
                <span class="metadata-label">Last Modified</span>
                <span class="metadata-value">${lastModified}</span>
            </div>
            <div class="metadata-item">
                <span class="metadata-label">Extension</span>
                <span class="metadata-value">${
                  fileExtension ? '.' + fileExtension : 'None'
                }</span>
            </div>
        </div>
    `;

  fileMetadata.appendChild(metadataCard);

  // Add event listener to the close button
  metadataCard
    .querySelector('.close-button')
    .addEventListener('click', function () {
      closeFile(this.getAttribute('data-file-id'));
    });

  // Add event listener to the fullscreen button
  metadataCard
    .querySelector('.fullscreen-button')
    .addEventListener('click', function () {
      toggleFullScreen(this.getAttribute('data-file-id'), file.name);
    });
}

// Function to close/remove a file
function closeFile(fileId) {
  // Remove the metadata card
  const metadataCard = document.getElementById(`metadata-${fileId}`);
  if (metadataCard) {
    metadataCard.remove();
  }

  // Remove the preview container
  const previewContainer = document.getElementById(`preview-${fileId}`);
  if (previewContainer) {
    previewContainer.remove();
  }

  // If no files left, show a message
  if (fileMetadata.children.length === 0) {
    fileMetadata.innerHTML =
      '<div class="message info">No files selected</div>';
    filePreview.innerHTML = '';
  }
}

// Process file based on type
function processFile(file) {
  const fileId = generateFileId(file);
  const fileType = getFileType(file);
  const fileExtension = getFileExtension(file.name);

  // Create preview container
  const previewContainer = document.createElement('div');
  previewContainer.className = 'preview-container';
  previewContainer.id = `preview-${fileId}`;
  filePreview.appendChild(previewContainer);

  // Loading indicator
  previewContainer.innerHTML =
    '<div class="message info">Loading preview...</div>';

  // Process by file type
  switch (fileType) {
    case 'CSV':
      processCSV(file, previewContainer);
      break;
    case 'XLSX':
    case 'XLS':
      processExcel(file, previewContainer);
      break;
    case 'IMAGE':
      processImage(file, previewContainer);
      break;
    case 'VIDEO':
      processVideo(file, previewContainer);
      break;
    case 'PDF':
      processPDF(file, previewContainer);
      break;
    case 'CODE':
    case 'TEXT':
      processTextOrCode(file, previewContainer, fileExtension);
      break;
    default:
      previewContainer.innerHTML =
        '<div class="message info">Preview not available for this file type</div>';
  }
}

// Process CSV files
function processCSV(file, container) {
  Papa.parse(file, {
    complete: function (results) {
      if (results.data && results.data.length > 0) {
        displayTable(results.data, container);
      } else {
        container.innerHTML =
          '<div class="message info">No data found in the CSV file.</div>';
      }
    },
    header: true,
    error: function (error) {
      container.innerHTML = `<div class="message error">Error reading CSV file: ${error.message}</div>`;
    },
  });
}

// Process Excel files
function processExcel(file, container) {
  const reader = new FileReader();

  reader.onload = function (e) {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });

      // Get first worksheet
      const firstSheet = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheet];

      // Convert to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (jsonData.length > 0) {
        displayTable(jsonData, container);
      } else {
        container.innerHTML =
          '<div class="message info">No data found in the Excel file.</div>';
      }
    } catch (error) {
      container.innerHTML = `<div class="message error">Error reading Excel file: ${error.message}</div>`;
    }
  };

  reader.onerror = function () {
    container.innerHTML =
      '<div class="message error">Error reading the file.</div>';
  };

  reader.readAsArrayBuffer(file);
}

// Process image files
function processImage(file, container) {
  const reader = new FileReader();

  reader.onload = function (e) {
    const img = document.createElement('img');
    img.src = e.target.result;
    img.className = 'image-preview';
    img.alt = file.name;

    container.innerHTML = '';
    container.appendChild(img);
  };

  reader.onerror = function () {
    container.innerHTML =
      '<div class="message error">Error reading the image file.</div>';
  };

  reader.readAsDataURL(file);
}

// Process video files
function processVideo(file, container) {
  const reader = new FileReader();

  reader.onload = function (e) {
    const video = document.createElement('video');
    video.src = e.target.result;
    video.className = 'video-preview';
    video.controls = true;

    container.innerHTML = '';
    container.appendChild(video);
  };

  reader.onerror = function () {
    container.innerHTML =
      '<div class="message error">Error reading the video file.</div>';
  };

  reader.readAsDataURL(file);
}

// Process PDF files
function processPDF(file, container, isFullscreen = false) {
  const reader = new FileReader();

  reader.onload = function (e) {
    const pdfData = new Uint8Array(e.target.result);

    // Create the PDF viewer container
    const pdfPreview = document.createElement('div');
    pdfPreview.className = 'pdf-preview';

    // Create controls
    const pdfControls = document.createElement('div');
    pdfControls.className = 'pdf-controls';

    // Create canvas container
    const canvasContainer = document.createElement('div');
    canvasContainer.className = 'pdf-canvas-container';

    const canvas = document.createElement('canvas');
    canvas.className = 'pdf-canvas';
    canvasContainer.appendChild(canvas);

    // Add controls and canvas to preview
    pdfPreview.appendChild(pdfControls);
    pdfPreview.appendChild(canvasContainer);

    // Clear container and add preview
    container.innerHTML = '';
    container.appendChild(pdfPreview);

    // Load the PDF
    const loadingTask = pdfjsLib.getDocument({ data: pdfData });
    loadingTask.promise
      .then(function (pdf) {
        // Store PDF data
        container.pdfDocument = pdf;
        container.currentPage = 1;

        // Update controls
        updatePDFControls(container, pdfControls, canvas);

        // Render first page with appropriate scale
        const scale = isFullscreen ? 2.0 : 1.5;
        renderPDFPage(
          container.pdfDocument,
          container.currentPage,
          canvas,
          scale
        );
      })
      .catch(function (error) {
        container.innerHTML = `<div class="message error">Error loading PDF: ${error.message}</div>`;
      });
  };

  reader.onerror = function () {
    container.innerHTML =
      '<div class="message error">Error reading the PDF file.</div>';
  };

  reader.readAsArrayBuffer(file);
}

// Update PDF controls
function updatePDFControls(container, controlsElement, canvas) {
  const pdf = container.pdfDocument;
  const currentPage = container.currentPage;
  const totalPages = pdf.numPages;

  controlsElement.innerHTML = `
    <button class="prev-button" ${currentPage <= 1 ? 'disabled' : ''}>
      <i class="fas fa-chevron-left"></i> Previous
    </button>
    <span class="page-info">Page ${currentPage} of ${totalPages}</span>
    <button class="next-button" ${currentPage >= totalPages ? 'disabled' : ''}>
      Next <i class="fas fa-chevron-right"></i>
    </button>
  `;

  // Add event listeners
  const prevButton = controlsElement.querySelector('.prev-button');
  const nextButton = controlsElement.querySelector('.next-button');

  prevButton.addEventListener('click', function () {
    if (currentPage > 1) {
      container.currentPage--;
      renderPDFPage(pdf, container.currentPage, canvas);
      updatePDFControls(container, controlsElement, canvas);
    }
  });

  nextButton.addEventListener('click', function () {
    if (currentPage < totalPages) {
      container.currentPage++;
      renderPDFPage(pdf, container.currentPage, canvas);
      updatePDFControls(container, controlsElement, canvas);
    }
  });
}

// Render PDF page
function renderPDFPage(pdf, pageNumber, canvas, scale = 1.5) {
  pdf.getPage(pageNumber).then(function (page) {
    const viewport = page.getViewport({ scale: scale });

    // Set canvas dimensions
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    // Render the page
    const renderContext = {
      canvasContext: canvas.getContext('2d'),
      viewport: viewport,
    };

    page.render(renderContext);
  });
}

// Process text or code files
function processTextOrCode(file, container, fileExtension) {
  const reader = new FileReader();

  reader.onload = function (e) {
    const content = e.target.result;
    const codeElement = document.createElement('pre');
    const codeContent = document.createElement('code');

    // If we have a recognized language for syntax highlighting
    if (fileExtension && CODE_EXTENSIONS[fileExtension.toLowerCase()]) {
      codeContent.className = `language-${
        CODE_EXTENSIONS[fileExtension.toLowerCase()]
      }`;
    }

    codeContent.textContent = content;
    codeElement.className = 'code-preview';
    codeElement.appendChild(codeContent);

    container.innerHTML = '';
    container.appendChild(codeElement);

    // Apply syntax highlighting
    if (fileExtension && CODE_EXTENSIONS[fileExtension.toLowerCase()]) {
      hljs.highlightElement(codeContent);
    }
  };

  reader.onerror = function () {
    container.innerHTML =
      '<div class="message error">Error reading the file.</div>';
  };

  reader.readAsText(file);
}

// Display table for CSV and Excel
function displayTable(data, container) {
  if (!data.length) {
    container.innerHTML = '<div class="message info">No data to display.</div>';
    return;
  }

  // Create table wrapper
  const tableWrapper = document.createElement('div');
  tableWrapper.className = 'table-wrapper';

  let html = '<table><thead><tr>';
  const headers = Object.keys(data[0]);

  // Add headers
  headers.forEach((header) => {
    html += `<th>${header}</th>`;
  });

  html += '</tr></thead><tbody>';

  // Add data rows
  data.forEach((row) => {
    html += '<tr>';
    headers.forEach((header) => {
      const cellData = row[header] !== undefined ? row[header] : '';
      html += `<td>${cellData}</td>`;
    });
    html += '</tr>';
  });

  html += '</tbody></table>';
  tableWrapper.innerHTML = html;
  container.innerHTML = '';
  container.appendChild(tableWrapper);

  // Check if table is scrollable
  const table = tableWrapper.querySelector('table');
  if (table.scrollWidth > tableWrapper.clientWidth) {
    tableWrapper.classList.add('is-scrollable');
  }

  // Update scrollable class on resize
  const updateScrollableClass = () => {
    if (table.scrollWidth > tableWrapper.clientWidth) {
      tableWrapper.classList.add('is-scrollable');
    } else {
      tableWrapper.classList.remove('is-scrollable');
    }
  };

  // Add resize observer
  const resizeObserver = new ResizeObserver(updateScrollableClass);
  resizeObserver.observe(tableWrapper);

  // Clean up observer when container is removed
  const cleanupObserver = () => {
    resizeObserver.disconnect();
    container.removeEventListener('DOMNodeRemoved', cleanupObserver);
  };
  container.addEventListener('DOMNodeRemoved', cleanupObserver);
}

// Helper functions
function getFileExtension(filename) {
  return filename.split('.').pop().toLowerCase();
}

function getFileType(file) {
  // Check by MIME type first
  if (file.type && FILE_TYPES[file.type]) {
    return FILE_TYPES[file.type];
  }

  // Fallback to extension check
  const extension = getFileExtension(file.name);

  if (extension) {
    if (['csv'].includes(extension)) {
      return 'CSV';
    } else if (['xlsx', 'xls'].includes(extension)) {
      return 'XLSX';
    } else if (
      ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension)
    ) {
      return 'IMAGE';
    } else if (['mp4', 'webm', 'ogg', 'mov'].includes(extension)) {
      return 'VIDEO';
    } else if (['pdf'].includes(extension)) {
      return 'PDF';
    } else if (Object.keys(CODE_EXTENSIONS).includes(extension)) {
      return 'CODE';
    }
  }

  // Default to TEXT
  return 'TEXT';
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function generateFileId(file) {
  // Create a unique ID based on file name and last modified date
  return `${file.name.replace(/[^a-zA-Z0-9]/g, '')}-${file.lastModified}`;
}

function showMessage(message, type) {
  const messageElement = document.createElement('div');
  messageElement.className = `message ${type}`;
  messageElement.textContent = message;

  filePreview.innerHTML = '';
  filePreview.appendChild(messageElement);
}

// Toggle full screen mode for a file
function toggleFullScreen(fileId, fileName) {
  const previewContainer = document.getElementById(`preview-${fileId}`);
  if (!previewContainer) return;

  // Check if we're already in fullscreen
  const existingFullscreen = document.querySelector('.fullscreen-mode');
  if (existingFullscreen) {
    // Exit fullscreen
    document.body.removeChild(existingFullscreen);
    document.body.style.overflow = '';
    return;
  }

  // Create fullscreen container
  const fullscreenContainer = document.createElement('div');
  fullscreenContainer.className = 'fullscreen-mode';

  // Create header
  const header = document.createElement('div');
  header.className = 'fullscreen-header';

  // Add title
  const title = document.createElement('div');
  title.className = 'fullscreen-title';
  title.textContent = fileName;
  header.appendChild(title);

  // Add actions
  const actions = document.createElement('div');
  actions.className = 'fullscreen-actions';

  const exitButton = document.createElement('button');
  exitButton.className = 'fullscreen-button';
  exitButton.title = 'Exit full screen';
  exitButton.innerHTML = '<i class="fas fa-compress"></i>';
  exitButton.addEventListener('click', function () {
    document.body.removeChild(fullscreenContainer);
    document.body.style.overflow = '';
  });

  actions.appendChild(exitButton);
  header.appendChild(actions);

  // Create content area
  const content = document.createElement('div');
  content.className = 'fullscreen-content';

  // Clone the preview content
  const previewContent = previewContainer.cloneNode(true);
  content.appendChild(previewContent);

  // Add everything to the fullscreen container
  fullscreenContainer.appendChild(header);
  fullscreenContainer.appendChild(content);

  // Add to body and prevent scrolling of background
  document.body.appendChild(fullscreenContainer);
  document.body.style.overflow = 'hidden';

  // Special handling for PDFs in fullscreen
  const pdfPreview = content.querySelector('.pdf-preview');
  if (pdfPreview) {
    // We need to re-render the PDF in fullscreen mode
    const fileMetadataCard = document.getElementById(`metadata-${fileId}`);
    if (fileMetadataCard) {
      const fileRow = fileMetadataCard.closest('.metadata-card');
      if (fileRow) {
        // Find the original file from the input
        const files = fileInput.files;
        for (let i = 0; i < files.length; i++) {
          if (generateFileId(files[i]) === fileId) {
            // Re-process the PDF for fullscreen
            const pdfContainer = content.querySelector('.preview-container');
            processPDF(files[i], pdfContainer, true);
            break;
          }
        }
      }
    }
  }
}
