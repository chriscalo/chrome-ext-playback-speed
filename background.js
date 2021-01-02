// Background script
// - handles clicks on the extension icon
// - coordinates communication between content scripts

// forwards all messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // TODO: pass along response
  sendMessage(request);
});

// broadcasts when the browser action is clicked
chrome.browserAction.onClicked.addListener(tab => {
  sendMessage({
    command: "browser action",
  });
});

// abstract away minutiae of message sending
function sendMessage(message, callback) {
  chrome.tabs.query({
    active: true,
    currentWindow: true,
  }, tabs => {
    const { id } = tabs[0];
    chrome.tabs.sendMessage(id, message, callback);
  });
}
