// All frames content script
// Expects to run in every frame. Listens for "set rate" commands and applies
// that playback rate to all <video> and <audio> elements it finds.

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  switch (request.command) {
    case "set rate": {
      const { rate } = request;
      console.log(`Setting playback rate to ${rate}x`);
      setRate(rate);
      sendResponse({
        result: "success",
        rate: rate,
      });
      break;
    }
  }
});

const MEDIA_ELEMENT_SELECTOR = "video, audio";

function setRate(rate) {
  for (const element of document.querySelectorAll(MEDIA_ELEMENT_SELECTOR)) {
    element.playbackRate = rate;
  }
}
