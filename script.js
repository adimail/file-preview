document
  .getElementById('csvFileInput')
  .addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (file) {
      Papa.parse(file, {
        complete: function (results) {
          displayCSV(results.data);
        },
        header: true,
      });
    }
  });

function displayCSV(data) {
  let html = '<table><thead><tr>';
  const headers = Object.keys(data[0]);
  headers.forEach((header) => {
    html += `<th>${header}</th>`;
  });
  html += '</tr></thead><tbody>';
  data.forEach((row) => {
    html += '<tr>';
    headers.forEach((header) => {
      html += `<td>${row[header]}</td>`;
    });
    html += '</tr>';
  });
  html += '</tbody></table>';
  document.getElementById('csvPreview').innerHTML = html;
}
