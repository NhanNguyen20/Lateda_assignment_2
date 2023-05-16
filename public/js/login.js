document.addEventListener('DOMContentLoaded', function() {
    const inputBoxes = document.querySelectorAll('.input-box input');
    inputBoxes.forEach(function(input) {
      const label = input.nextElementSibling;
      if (input.value !== '') {
        label.style.top = '-5px';
      }
      input.addEventListener('input', function() {
        if (this.value !== '') {
          label.style.top = '-5px';
        } else {
          label.style.top = '';
        }
      });
      input.addEventListener('blur', function() {
        if (this.value === '') {
          label.style.top = '';
        }
      });
    });
  });
  


 
 // Get the select elements, code for the birthday in register form
var daySelect = document.getElementById('day');
var monthSelect = document.getElementById('month');
var yearSelect = document.getElementById('year');

// Generate options for days (1-31)
for (var day = 1; day <= 31; day++) {
  var option = document.createElement('option');
  option.value = day;
  option.text = day;
  daySelect.appendChild(option);
}

// Generate options for months (January-December)
var months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
for (var i = 0; i < months.length; i++) {
  var option = document.createElement('option');
  option.value = months[i];
  option.text = months[i];
  monthSelect.appendChild(option);
}

// Generate options for years (1940 - current year)
var currentYear = new Date().getFullYear();
for (var year = 1940; year <= currentYear; year++) {
  var option = document.createElement('option');
  option.value = year;
  option.text = year;
  yearSelect.appendChild(option);
}

function showImage(input) {
  var reader = new FileReader();

  reader.onload = function (e) {
    var profilePicturePreview = document.getElementById("profilePicturePreview");
    profilePicturePreview.src = e.target.result;
  };

  reader.readAsDataURL(input.files[0]);
}

/*my account*/ 

function toggleInput(inputId) {
  var inputElement = document.getElementById(inputId);
  var labelElement = document.getElementById(inputId + "-label");
  var isReadOnly = inputElement.getAttribute('readonly') === 'readonly';

  if (isReadOnly) {
    inputElement.removeAttribute('readonly');
    inputElement.focus();
    labelElement.style.display = "none";
  } else {
    inputElement.setAttribute('readonly', 'readonly');
    labelElement.style.display = "inline";
  }
}

function updateLabel(labelId) {
  var labelElement = document.getElementById(labelId + "-label");
  var inputElement = document.getElementById(labelId + "-input");
  labelElement.textContent = inputElement.value;
}