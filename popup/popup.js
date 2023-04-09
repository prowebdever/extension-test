window.onload = function () {
  // Get the login screen, secret screen, and other elements
  var signupScreen = document.getElementById('signupScreen');
  var passwordInput = document.getElementById('passwordInput');
  var confirmPasswordInput = document.getElementById('confirmPasswordInput');
  var confirmButton = document.getElementById('confirmButton');
  var loginScreen = document.getElementById('loginScreen');
  var loginPasswordInput = document.getElementById('loginPasswordInput');
  var loginButton = document.getElementById('loginButton');
  var resetButton = document.getElementById('resetButton');
  var secretScreen = document.getElementById('secretScreen');
  var secretElement = document.getElementById('secret');
  var regenerateButton = document.getElementById('regenerateButton');
  var logOutButton = document.getElementById('logOutButton');

  // Add event listeners to the buttons
  confirmButton.addEventListener('click', function() {
    var password = passwordInput.value;
    var confirmPassword = confirmPasswordInput.value;
    if (password === confirmPassword) {
      if (password === '') {
        alert('Passwords is empry.');
        return;
      }
      chrome.runtime.sendMessage({action: 'initializeExtension', password: password}, function(response) {
        if (response.success) {
          showSecret(response.secret);
        } else {
          alert('Error initializing extension.');
        }
      });
    } else {
      alert('Passwords do not match. Please try again.');
    }
  });

  loginButton.addEventListener('click', function() {
    var password = loginPasswordInput.value;
    if (password === '') {
      alert('Passwords is empry.');
      return;
    }
    chrome.runtime.sendMessage({action: 'authenticateUser', password: password}, function(response) {
      if (response.success) {
        showSecret(response.secret);
      } else {
        alert('Passwords do not match. Please try again.');
      }
    });
  });

  resetButton.addEventListener('click', function() {
    chrome.runtime.sendMessage({action: 'reset'}, function(response) {
      if (response.success) {
        showsignup();
      } else {
        alert('Can not reset. Please try again.');
      }
    });
  });
  
  regenerateButton.addEventListener('click', function() {
    chrome.runtime.sendMessage({action: 'regenerateSecret'}, function(response) {
      if (response.secret) {
        showSecret(response.secret);
        alert('Secret regenerated successfully.');
      } else {
        alert('Error regenerating secret.');
      }
    });
  });

  logOutButton.addEventListener('click', function() {
    chrome.runtime.sendMessage({action: 'logOut'}, function(response) {
      if (response.success) {
        alert('You have been logged out.');
        showLogin();
      } else {
        alert('Error logging out.');
      }
    });
  });

  // Show the login screen
  function showLogin() {
    loginScreen.style.display = 'block';
    signupScreen.style.display = 'none';
    secretScreen.style.display = 'none';
  }

  // Show the signup screen
  function showsignup() {
    signupScreen.style.display = 'block';
    loginScreen.style.display = 'none';
    secretScreen.style.display = 'none';
  }

  // Show the secret screen
  function showSecret(secret) {
    secretElement.innerText = secret;
    signupScreen.style.display = 'none';
    loginScreen.style.display = 'none';
    secretScreen.style.display = 'block';
  }

  // Check if the user is already logged in
  chrome.runtime.sendMessage({action: 'checkLoggedIn'}, function(response) {
    if (response.loggedIn) {
      showLogin();
    } else {
      showsignup();
    }
  });
}