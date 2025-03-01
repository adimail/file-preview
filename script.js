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

// CSV file handling
document
  .getElementById('csvFileInput')
  .addEventListener('change', function (event) {
    const file = event.target.files[0];
    const preview = document.getElementById('csvPreview');

    if (file) {
      // Show loading state
      preview.innerHTML =
        '<div style="text-align: center; padding: 20px;">Loading...</div>';

      Papa.parse(file, {
        complete: function (results) {
          if (results.data && results.data.length > 0) {
            displayCSV(results.data);
          } else {
            preview.innerHTML =
              '<div style="text-align: center; padding: 20px;">No data found in the CSV file.</div>';
          }
        },
        header: true,
        error: function (error) {
          preview.innerHTML = `<div style="text-align: center; padding: 20px; color: red;">Error reading CSV file: ${error.message}</div>`;
        },
      });
    }
  });

function displayCSV(data) {
  if (!data.length) return;

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
      const cellData = row[header] || '';
      html += `<td>${cellData}</td>`;
    });
    html += '</tr>';
  });

  html += '</tbody></table>';
  document.getElementById('csvPreview').innerHTML = html;
}
