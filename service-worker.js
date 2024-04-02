// Background script
// - handles clicks on the extension icon
// - coordinates communication between content scripts

// forwards all messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.debug(
    "[service-worker.js] chrome.runtime.onMessage",
    {request, sender, sendResponse},
  );
  // TODO: pass along response
  sendMessage(request);
});

// broadcasts when the browser action is clicked
chrome.action.onClicked.addListener(async tab => {
  console.debug(
    "[service-worker.js] chrome.action.onClicked",
    { tab },
  );
  const rate = await getNextRate(tab.tabId);
  
  console.debug(
    "[service-worker.js] chrome.action.onClicked",
    { rate },
  );
  sendMessage({
    command: "browser action",
    rate: rate,
  });
  setLastRate(tab.tabId, rate);
});

// abstract away minutiae of message sending
function sendMessage(message, callback) {
  console.debug(
    "[service-worker.js] sendMessage()",
    {message, callback},
  );
  chrome.tabs.query({
    active: true,
    currentWindow: true,
  }, tabs => {
    const { id } = tabs[0];
    chrome.tabs.sendMessage(id, message, callback);
  });
}

async function getLastRate(tabId) {
  const badgeText = await new Promise(resolve => {
    chrome.action.getBadgeText({tabId}, result => resolve(result));
  }) ?? "1";
  const rate = parseFloat(badgeText)
  return rate;
}

function setLastRate(tabId, text) {
  text = String(text);
  chrome.action.setBadgeText({tabId, text}, result => resolve(result));
}

function setRate(rate) {
  for (const element of document.querySelectorAll(MEDIA_ELEMENT_SELECTOR)) {
    element.playbackRate = rate;
  }
  setLastRate(rate);
}

async function getNextRate(tabId) {
  const rates = [1.25, 1.5, 1.75, 2, 2.5, 3, 3.5, 4, 1];
  const lastRate = await getLastRate(tabId);
  const nextIndex = (rates.indexOf(lastRate) + 1) % rates.length;
  return rates[nextIndex];
}
