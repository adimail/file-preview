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
            <div class="file-type-tag">${fileType}</div>
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
  container.innerHTML = html;
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
