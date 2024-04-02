// All frames content script
// Expects to run in every frame. Listens for "set rate" commands and applies
// that playback rate to all <video> and <audio> elements it finds.

console.debug("[frame.js] load", { self, window, "top": window === window.top });

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.debug(
    "[frame.js] chrome.runtime.onMessage",
    {request, sender, sendResponse},
  );
  switch (request.command) {
    case "browser action": {
      const rate = getNextRate();
      console.log(`[frame.js] Setting playback rate to ${rate}x`);
      setRate(rate);
      sendResponse({
        result: "success",
        rate: rate,
      });
      break;
    }
    default: {
      console.debug(
        "[frame.js] chrome.runtime.onMessage:default",
        {request, sender, sendResponse},
      );
      break;
    }
  }
});

const MEDIA_ELEMENT_SELECTOR = "video, audio";


function getLastRate() {
  const { dataset } = document.documentElement;
  return parseFloat(dataset.playbackSpeedExtensionRate);
}

function setLastRate(value) {
  const { dataset } = document.documentElement;
  return dataset.playbackSpeedExtensionRate = value;
}

function setRate(rate) {
  for (const element of document.querySelectorAll(MEDIA_ELEMENT_SELECTOR)) {
    element.playbackRate = rate;
  }
  setLastRate(rate);
}

function getNextRate() {
  const rates = [1.25, 1.5, 1.75, 2, 2.5, 3, 3.5, 4, 1];
  const lastRate = getLastRate();
  const nextIndex = (rates.indexOf(lastRate) + 1) % rates.length;
  return rates[nextIndex];
}
