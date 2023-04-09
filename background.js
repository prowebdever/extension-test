importScripts('./lib/cryptojs-aes.min.js');
// Generate a new secret if one doesn't exist
chrome.runtime.onInstalled.addListener(function() {
  chrome.storage.local.get(['secret'], function(result) {
    if (!result.secret) {
      var secret = generateSecret();
      chrome.storage.local.set({secret: secret}, function() {
        console.log('Secret generated and stored.');
      });
    }
  });
});

// Handle messages from the content script and popup window
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action == 'initializeExtension') {
    var password = request.password;
    var secret = generateSecret();
    var encryptedSecret = encryptSecret(secret, password);
    chrome.storage.local.set({secret: encryptedSecret, password: password}, function() {
      console.log('Extension initialized.');
      sendResponse({success: true, secret: secret});
    });
  } else if (request.action == 'checkLoggedIn') {
    chrome.storage.local.get(['secret', 'password'], function(result) {
      if (result.secret && result.password) {
        sendResponse({loggedIn: true});
      } else {
        sendResponse({loggedIn: false});
      }
    });
  } else if (request.action == 'authenticateUser') {
    var password = request.password;
    chrome.storage.local.get(['secret', 'password'], function(result) {
      if (result.secret && result.password && result.password == password) {
        sendResponse({success: true, secret: decryptSecret(result.secret, result.password)});
      } else {
        sendResponse({success: false});
      }
    });
  } else if (request.action == 'regenerateSecret') {
    chrome.storage.local.get(['password'], function(result) {
      if (result.password) {
        var secret = generateSecret();
        var encryptedSecret = encryptSecret(secret, result.password);
        chrome.storage.local.set({secret: encryptedSecret}, function() {
          console.log('Secret regenerated.');
          sendResponse({secret: secret});
        });
      } else {
        sendResponse({success: false});
      }
    });
  } else if (request.action == 'logOut') {
    sendResponse({success: true});
  } else if (request.action == 'reset') {
    resetExtensionState();
    sendResponse({success: true});
  }
  
  return true;
});

// Generate a random string of a static length
function generateSecret() {
  var length = 16;
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var secret = '';
  for (var i = 0; i < length; i++) {
    secret += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return secret;
}

// Encrypt the secret using the password
function encryptSecret(secret, password) {
  var encryptedSecret = CryptoJS.AES.encrypt(secret, password).toString();
  return encryptedSecret;
}

// Decrypt the secret using the password
function decryptSecret(encryptedSecret, password) {
  try {
    var decryptedSecret = CryptoJS.AES.decrypt(encryptedSecret, password).toString(CryptoJS.enc.Utf8);
    return decryptedSecret;
  } catch (error) {
    return null;
  }
}

// Reset the extension state to a new-like application
function resetExtensionState() {
  chrome.storage.local.clear(function() {
    console.log('Extension state reset.');
  });
}