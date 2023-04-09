// Send a message to the background script to get the secret
chrome.runtime.sendMessage({action: 'getSecret'}, function(response) {
  if (response.secret) {
    // Decrypt the secret using the password
    var password = prompt('Please enter your password:');
    var decryptedSecret = decryptSecret(response.secret, password);
    if (decryptedSecret) {
      // Replace all instances of the secret in the page with the decrypted secret
      var elements = document.getElementsByTagName('*');
      for (var i = 0; i < elements.length; i++) {
        var element = elements[i];
        for (var j = 0; j < element.childNodes.length; j++) {
          var node = element.childNodes[j];
          if (node.nodeType === 3) {
            var text = node.nodeValue;
            var replacedText = text.replace(response.secret, decryptedSecret);
            if (replacedText !== text) {
              element.replaceChild(document.createTextNode(replacedText), node);
            }
          }
        }
      }
    } else {
      alert('Authentication failed.');
    }
  } else {
    alert('Secret not found.');
  }
});

// Decrypt the encrypted secret using the password
function decryptSecret(encryptedSecret, password) {
  // Use the same encryption algorithm and key as the encryptSecret function in the background script
}