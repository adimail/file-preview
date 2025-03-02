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

  // Model files
  'application/x-hdf5': 'H5',
  'application/octet-stream': 'H5',

  // JSON - Giving JSON its own type for specialized handling
  'application/json': 'JSON',

  // Text/Code
  'text/plain': 'TEXT',
  'text/javascript': 'CODE',
  'application/javascript': 'CODE',
  'text/typescript': 'CODE',
  'text/x-python': 'CODE',
  'text/x-c': 'CODE',
  'text/html': 'CODE',
  'text/css': 'CODE',
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
    case 'H5':
      processH5Model(file, previewContainer);
      break;
    case 'JSON':
      processJSON(file, previewContainer);
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
    } else if (['h5', 'hdf5'].includes(extension)) {
      return 'H5';
    } else if (['json'].includes(extension)) {
      return 'JSON';
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

// Process H5 model files
async function processH5Model(file, container) {
  container.innerHTML = `
    <div class="message info">
      <h3>H5 Model File Detected</h3>
      <p>Browser-side loading of .h5 files is not directly supported by TensorFlow.js. To view this model, you need to first convert it to the TensorFlow.js format using one of these methods:</p>
      <ol style="text-align: left; margin-top: 10px;">
        <li>Using Python tensorflowjs converter:
          <pre style="background: var(--code-bg); padding: 10px; margin: 5px 0; border-radius: 4px;">
pip install tensorflowjs
tensorflowjs_converter --input_format=keras /path/to/model.h5 /path/to/output/folder</pre>
        </li>
        <li>Using Python code:
          <pre style="background: var(--code-bg); padding: 10px; margin: 5px 0; border-radius: 4px;">
import tensorflowjs as tfjs
tfjs.converters.save_keras_model(model, '/path/to/output/folder')</pre>
        </li>
      </ol>
      <p>After conversion, you'll get a model.json file and one or more binary weight files that can be loaded in the browser.</p>
    </div>
  `;
}

// Process JSON files
function processJSON(file, container) {
  const reader = new FileReader();

  reader.onload = function (e) {
    try {
      const content = e.target.result;
      const jsonData = JSON.parse(content);

      // Create JSON viewer container
      const jsonViewerContainer = document.createElement('div');
      jsonViewerContainer.className = 'json-viewer-container';

      // Create toolbar
      const toolbar = document.createElement('div');
      toolbar.className = 'json-toolbar';

      // Add buttons
      toolbar.innerHTML = `
        <div class="json-toolbar-left">
          <button class="json-btn expand-all" title="Expand All"><i class="fas fa-expand-arrows-alt"></i></button>
          <button class="json-btn collapse-all" title="Collapse All"><i class="fas fa-compress-arrows-alt"></i></button>
          <div class="json-search-container">
            <input type="text" class="json-search" placeholder="Search in JSON...">
            <i class="fas fa-search json-search-icon"></i>
          </div>
        </div>
        <div class="json-toolbar-right">
          <select class="json-view-mode">
            <option value="tree">Tree View</option>
            <option value="raw">Raw View</option>
            ${
              hasChartableData(jsonData)
                ? '<option value="chart">Chart View</option>'
                : ''
            }
          </select>
        </div>
      `;

      // Create content area
      const jsonContent = document.createElement('div');
      jsonContent.className = 'json-content';

      // Initial view - Tree structure
      const treeView = document.createElement('div');
      treeView.className = 'json-tree-view active-view';

      // Raw view (for code highlighting)
      const rawView = document.createElement('div');
      rawView.className = 'json-raw-view';
      const rawPre = document.createElement('pre');
      const rawCode = document.createElement('code');
      rawCode.className = 'language-json';
      rawCode.textContent = JSON.stringify(jsonData, null, 2);
      rawPre.appendChild(rawCode);
      rawView.appendChild(rawPre);

      // Chart view if applicable
      const chartView = document.createElement('div');
      chartView.className = 'json-chart-view';

      // Add all views to content
      jsonContent.appendChild(treeView);
      jsonContent.appendChild(rawView);
      jsonContent.appendChild(chartView);

      // Add elements to container
      jsonViewerContainer.appendChild(toolbar);
      jsonViewerContainer.appendChild(jsonContent);

      // Clear container and add JSON viewer
      container.innerHTML = '';
      container.appendChild(jsonViewerContainer);

      // Create tree view
      renderJSONTreeView(jsonData, treeView);

      // Apply syntax highlighting to raw view
      hljs.highlightElement(rawCode);

      // Create chart if needed
      if (hasChartableData(jsonData)) {
        createChartView(jsonData, chartView);
      }

      // Add event listeners
      setupJSONViewerListeners(jsonViewerContainer, jsonData);
    } catch (error) {
      container.innerHTML = `<div class="message error">Error parsing JSON file: ${error.message}</div>`;
    }
  };

  reader.onerror = function () {
    container.innerHTML =
      '<div class="message error">Error reading the JSON file.</div>';
  };

  reader.readAsText(file);
}

// Render JSON as tree view
function renderJSONTreeView(data, container, path = '') {
  const ul = document.createElement('ul');
  ul.className = 'json-tree';

  if (Array.isArray(data)) {
    // Process array
    for (let i = 0; i < data.length; i++) {
      const li = document.createElement('li');
      const itemPath = path ? `${path}[${i}]` : `[${i}]`;

      if (isObject(data[i]) || Array.isArray(data[i])) {
        const isArr = Array.isArray(data[i]);
        const count = isArr ? data[i].length : Object.keys(data[i]).length;
        const type = isArr ? 'array' : 'object';

        li.innerHTML = `
          <div class="json-item json-expandable" data-path="${itemPath}">
            <span class="json-toggle"><i class="fas fa-caret-right"></i></span>
            <span class="json-key">[${i}]</span>
            <span class="json-separator">: </span>
            <span class="json-value json-${type}">
              ${isArr ? '[ ... ]' : '{ ... }'} 
              <span class="json-item-count">${count} item${
          count !== 1 ? 's' : ''
        }</span>
            </span>
          </div>
          <div class="json-children" style="display: none;"></div>
        `;

        ul.appendChild(li);

        // Lazy loading of children when expanded
        const expandableItem = li.querySelector('.json-expandable');
        const childrenContainer = li.querySelector('.json-children');

        expandableItem.addEventListener('click', function (e) {
          if (
            e.target.classList.contains('json-tree') ||
            e.target.closest('.json-item') !== this
          ) {
            return;
          }

          const wasExpanded = this.classList.contains('expanded');

          if (!wasExpanded && childrenContainer.children.length === 0) {
            renderJSONTreeView(data[i], childrenContainer, itemPath);
          }

          this.classList.toggle('expanded');
          this.querySelector('.json-toggle i').className = wasExpanded
            ? 'fas fa-caret-right'
            : 'fas fa-caret-down';
          childrenContainer.style.display = wasExpanded ? 'none' : 'block';
        });
      } else {
        // Simple values
        const valueType = getValueType(data[i]);
        const displayValue = formatJSONValue(data[i], valueType);

        li.innerHTML = `
          <div class="json-item" data-path="${itemPath}">
            <span class="json-empty-toggle"></span>
            <span class="json-key">[${i}]</span>
            <span class="json-separator">: </span>
            <span class="json-value json-${valueType}">${displayValue}</span>
          </div>
        `;
        ul.appendChild(li);
      }
    }
  } else if (isObject(data)) {
    // Process object
    const keys = Object.keys(data);
    for (const key of keys) {
      const li = document.createElement('li');
      const itemPath = path ? `${path}.${key}` : key;

      if (isObject(data[key]) || Array.isArray(data[key])) {
        const isArr = Array.isArray(data[key]);
        const count = isArr ? data[key].length : Object.keys(data[key]).length;
        const type = isArr ? 'array' : 'object';

        li.innerHTML = `
          <div class="json-item json-expandable" data-path="${itemPath}">
            <span class="json-toggle"><i class="fas fa-caret-right"></i></span>
            <span class="json-key">"${escapeHTML(key)}"</span>
            <span class="json-separator">: </span>
            <span class="json-value json-${type}">
              ${isArr ? '[ ... ]' : '{ ... }'} 
              <span class="json-item-count">${count} item${
          count !== 1 ? 's' : ''
        }</span>
            </span>
          </div>
          <div class="json-children" style="display: none;"></div>
        `;

        ul.appendChild(li);

        // Lazy loading of children when expanded
        const expandableItem = li.querySelector('.json-expandable');
        const childrenContainer = li.querySelector('.json-children');

        expandableItem.addEventListener('click', function (e) {
          if (
            e.target.classList.contains('json-tree') ||
            e.target.closest('.json-item') !== this
          ) {
            return;
          }

          const wasExpanded = this.classList.contains('expanded');

          if (!wasExpanded && childrenContainer.children.length === 0) {
            renderJSONTreeView(data[key], childrenContainer, itemPath);
          }

          this.classList.toggle('expanded');
          this.querySelector('.json-toggle i').className = wasExpanded
            ? 'fas fa-caret-right'
            : 'fas fa-caret-down';
          childrenContainer.style.display = wasExpanded ? 'none' : 'block';
        });
      } else {
        // Simple values
        const valueType = getValueType(data[key]);
        const displayValue = formatJSONValue(data[key], valueType);

        li.innerHTML = `
          <div class="json-item" data-path="${itemPath}">
            <span class="json-empty-toggle"></span>
            <span class="json-key">"${escapeHTML(key)}"</span>
            <span class="json-separator">: </span>
            <span class="json-value json-${valueType}">${displayValue}</span>
          </div>
        `;
        ul.appendChild(li);
      }
    }
  }

  container.appendChild(ul);
}

// Helper functions for JSON viewer
function isObject(item) {
  return typeof item === 'object' && item !== null && !Array.isArray(item);
}

function getValueType(value) {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (typeof value === 'boolean') return 'boolean';
  if (typeof value === 'number') return 'number';
  if (typeof value === 'string') return 'string';
  if (Array.isArray(value)) return 'array';
  if (isObject(value)) return 'object';
  return 'unknown';
}

function formatJSONValue(value, type) {
  switch (type) {
    case 'null':
      return 'null';
    case 'undefined':
      return 'undefined';
    case 'boolean':
      return value ? 'true' : 'false';
    case 'number':
      return value;
    case 'string':
      return `"${escapeHTML(value)}"`;
    default:
      return value;
  }
}

function escapeHTML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Determine if JSON contains chartable data
function hasChartableData(data) {
  // Check for arrays of numbers or objects with consistent numeric properties
  if (Array.isArray(data) && data.length > 0) {
    // Check for array of numbers
    if (data.every((item) => typeof item === 'number')) {
      return true;
    }

    // Check for array of objects with numeric values
    if (data.every((item) => isObject(item))) {
      const firstItem = data[0];
      const numericProps = Object.keys(firstItem).filter(
        (key) => typeof firstItem[key] === 'number'
      );

      if (numericProps.length > 0) {
        return true;
      }
    }
  }

  // Check for nested arrays
  if (isObject(data)) {
    for (const key in data) {
      if (Array.isArray(data[key]) && data[key].length > 0) {
        if (data[key].every((item) => typeof item === 'number')) {
          return true;
        }
      }
    }
  }

  return false;
}

// Create chart view for JSON data
function createChartView(data, container) {
  // Add canvas for chart
  const canvas = document.createElement('canvas');
  canvas.className = 'json-chart-canvas';
  container.appendChild(canvas);

  // Add chart type selector
  const chartControls = document.createElement('div');
  chartControls.className = 'json-chart-controls';
  chartControls.innerHTML = `
    <div class="chart-control-group">
      <label>Chart Type:</label>
      <select class="chart-type-selector">
        <option value="bar">Bar Chart</option>
        <option value="line">Line Chart</option>
        <option value="pie">Pie Chart</option>
        <option value="radar">Radar Chart</option>
        <option value="polarArea">Polar Area</option>
      </select>
    </div>
    <div class="chart-control-group">
      <label>Data Path:</label>
      <select class="chart-data-path"></select>
    </div>
    <div class="chart-data-key-selector" style="display:none">
      <div class="chart-control-group">
        <label>Label Key:</label>
        <select class="chart-label-key"></select>
      </div>
      <div class="chart-control-group">
        <label>Value Key:</label>
        <select class="chart-value-key"></select>
      </div>
    </div>
  `;

  container.insertBefore(chartControls, canvas);

  // Find possible data paths for charts
  const dataPaths = findChartableDataPaths(data);
  const dataPathSelect = chartControls.querySelector('.chart-data-path');

  // Add options for data paths
  dataPaths.forEach((path) => {
    const option = document.createElement('option');
    option.value = path.path;
    option.textContent = path.path || 'Root';
    dataPathSelect.appendChild(option);
  });

  // Set up event listeners for chart controls
  const chartTypeSelect = chartControls.querySelector('.chart-type-selector');
  const labelKeySelect = chartControls.querySelector('.chart-label-key');
  const valueKeySelect = chartControls.querySelector('.chart-value-key');
  const keySelectors = chartControls.querySelector('.chart-data-key-selector');

  let currentChart = null;

  function updateChart() {
    const chartType = chartTypeSelect.value;
    const dataPath = dataPathSelect.value;

    // Get data at path
    let chartData = dataPath ? getValueAtPath(data, dataPath) : data;

    if (!chartData) {
      container.innerHTML =
        '<div class="message error">Unable to find data at specified path.</div>';
      return;
    }

    // For object arrays, we need label and value keys
    let labels = [];
    let values = [];

    if (Array.isArray(chartData) && chartData.length > 0) {
      if (chartData.every((item) => typeof item === 'number')) {
        // Simple number array
        labels = chartData.map((_, i) => `Item ${i + 1}`);
        values = chartData;
      } else if (chartData.every((item) => isObject(item))) {
        // Array of objects - use keys
        const labelKey = labelKeySelect.value;
        const valueKey = valueKeySelect.value;

        labels = chartData.map((item) => item[labelKey] || '');
        values = chartData.map((item) => parseFloat(item[valueKey]) || 0);
      }
    } else if (isObject(chartData)) {
      // Object with key-value pairs
      labels = Object.keys(chartData);
      values = Object.values(chartData).map((v) =>
        typeof v === 'number' ? v : 0
      );
    }

    // Generate random colors
    const colors = generateChartColors(values.length);

    // Destroy previous chart
    if (currentChart) {
      currentChart.destroy();
    }

    // Create chart configuration
    const chartConfig = {
      type: chartType,
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Data',
            data: values,
            backgroundColor: chartType === 'line' ? colors[0] : colors,
            borderColor: chartType === 'line' ? colors[0] : colors,
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: chartType === 'pie' || chartType === 'polarArea',
          },
          tooltip: {
            enabled: true,
          },
        },
      },
    };

    // Create new chart
    currentChart = new Chart(canvas.getContext('2d'), chartConfig);
  }

  // Update key selectors when data path changes
  dataPathSelect.addEventListener('change', function () {
    const path = this.value;
    let pathData = path ? getValueAtPath(data, path) : data;

    if (
      Array.isArray(pathData) &&
      pathData.length > 0 &&
      isObject(pathData[0])
    ) {
      // Show and update key selectors for object arrays
      keySelectors.style.display = 'flex';

      // Get possible keys from first object
      const keys = Object.keys(pathData[0]);

      // Clear and update key selectors
      labelKeySelect.innerHTML = '';
      valueKeySelect.innerHTML = '';

      keys.forEach((key) => {
        const labelOption = document.createElement('option');
        labelOption.value = key;
        labelOption.textContent = key;
        labelKeySelect.appendChild(labelOption);

        const valueOption = document.createElement('option');
        valueOption.value = key;
        valueOption.textContent = key;
        valueKeySelect.appendChild(valueOption);

        // Select first string-like key for labels
        if (typeof pathData[0][key] === 'string') {
          labelKeySelect.value = key;
        }

        // Select first number-like key for values
        if (typeof pathData[0][key] === 'number') {
          valueKeySelect.value = key;
        }
      });
    } else {
      // Hide key selectors for simple arrays
      keySelectors.style.display = 'none';
    }

    updateChart();
  });

  // Update chart when controls change
  chartTypeSelect.addEventListener('change', updateChart);
  labelKeySelect.addEventListener('change', updateChart);
  valueKeySelect.addEventListener('change', updateChart);

  // Initial chart setup
  if (dataPaths.length > 0) {
    dataPathSelect.dispatchEvent(new Event('change'));
  }
}

// Find all possible data paths for charts
function findChartableDataPaths(data, path = '', results = []) {
  if (Array.isArray(data) && data.length > 0) {
    if (data.every((item) => typeof item === 'number')) {
      results.push({ path, data });
    } else if (data.every((item) => isObject(item))) {
      const numericProps = Object.keys(data[0]).filter(
        (key) => typeof data[0][key] === 'number'
      );

      if (numericProps.length > 0) {
        results.push({ path, data });
      }
    }
  } else if (isObject(data)) {
    // Add the object itself if it has numeric values
    const hasNumericValues = Object.values(data).some(
      (v) => typeof v === 'number'
    );
    if (hasNumericValues) {
      results.push({ path, data });
    }

    // Search nested objects/arrays
    for (const key in data) {
      const value = data[key];
      const newPath = path ? `${path}.${key}` : key;

      if (Array.isArray(value) || isObject(value)) {
        findChartableDataPaths(value, newPath, results);
      }
    }
  }

  return results;
}

// Get a value at a given path in an object
function getValueAtPath(obj, path) {
  if (!path) return obj;

  const parts = path.split('.');
  let current = obj;

  for (const part of parts) {
    // Handle array indexing
    if (part.includes('[') && part.includes(']')) {
      const arrName = part.substring(0, part.indexOf('['));
      const index = parseInt(
        part.substring(part.indexOf('[') + 1, part.indexOf(']'))
      );

      if (
        current[arrName] &&
        Array.isArray(current[arrName]) &&
        current[arrName][index] !== undefined
      ) {
        current = current[arrName][index];
      } else {
        return undefined;
      }
    } else if (current[part] !== undefined) {
      current = current[part];
    } else {
      return undefined;
    }
  }

  return current;
}

// Generate array of colors for charts
function generateChartColors(count) {
  const colors = [];
  const hueStep = 360 / count;

  for (let i = 0; i < count; i++) {
    const hue = (hueStep * i) % 360;
    colors.push(`hsla(${hue}, 70%, 60%, 0.8)`);
  }

  return colors;
}

// Set up event listeners for JSON viewer
function setupJSONViewerListeners(container, jsonData) {
  const expandAllBtn = container.querySelector('.expand-all');
  const collapseAllBtn = container.querySelector('.collapse-all');
  const searchInput = container.querySelector('.json-search');
  const viewModeSelect = container.querySelector('.json-view-mode');
  const treeView = container.querySelector('.json-tree-view');
  const rawView = container.querySelector('.json-raw-view');
  const chartView = container.querySelector('.json-chart-view');

  // Expand all button
  expandAllBtn.addEventListener('click', function () {
    const allExpandables = treeView.querySelectorAll(
      '.json-expandable:not(.expanded)'
    );

    for (const expandable of allExpandables) {
      const childrenContainer = expandable.nextElementSibling;

      // Load content if not already loaded
      if (childrenContainer.children.length === 0) {
        const path = expandable.getAttribute('data-path');
        const pathValue = getValueAtPath(jsonData, path);
        renderJSONTreeView(pathValue, childrenContainer, path);
      }

      // Expand
      expandable.classList.add('expanded');
      expandable.querySelector('.json-toggle i').className =
        'fas fa-caret-down';
      childrenContainer.style.display = 'block';
    }
  });

  // Collapse all button
  collapseAllBtn.addEventListener('click', function () {
    const allExpanded = treeView.querySelectorAll('.json-expandable.expanded');

    for (const expanded of allExpanded) {
      expanded.classList.remove('expanded');
      expanded.querySelector('.json-toggle i').className = 'fas fa-caret-right';
      expanded.nextElementSibling.style.display = 'none';
    }
  });

  // Search functionality
  searchInput.addEventListener('input', function () {
    const searchTerm = this.value.toLowerCase();

    if (!searchTerm) {
      // Clear highlights when search is empty
      const allHighlighted = treeView.querySelectorAll('.json-item.highlight');
      for (const highlighted of allHighlighted) {
        highlighted.classList.remove('highlight');
      }
      return;
    }

    // Perform search
    const allItems = treeView.querySelectorAll('.json-item');

    for (const item of allItems) {
      const text = item.textContent.toLowerCase();
      const path = item.getAttribute('data-path').toLowerCase();

      if (text.includes(searchTerm) || path.includes(searchTerm)) {
        item.classList.add('highlight');

        // Ensure parents are expanded to show the result
        let parent = item.closest('.json-children');
        while (parent) {
          const parentItem = parent.previousElementSibling;
          if (parentItem && parentItem.classList.contains('json-expandable')) {
            parentItem.classList.add('expanded');
            parentItem.querySelector('.json-toggle i').className =
              'fas fa-caret-down';
            parent.style.display = 'block';
          }
          parent = parent.closest('.json-children');
        }
      } else {
        item.classList.remove('highlight');
      }
    }
  });

  // View mode switcher
  viewModeSelect.addEventListener('change', function () {
    const mode = this.value;

    // Hide all views
    treeView.classList.remove('active-view');
    rawView.classList.remove('active-view');
    if (chartView) chartView.classList.remove('active-view');

    // Show selected view
    switch (mode) {
      case 'tree':
        treeView.classList.add('active-view');
        break;
      case 'raw':
        rawView.classList.add('active-view');
        break;
      case 'chart':
        chartView.classList.add('active-view');
        break;
    }
  });
}
