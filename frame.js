// All frames content script
// Expects to run in every frame. Listens for "browser action" commands and
// applies that playback rate to all <video> and <audio> elements it finds.

import { debug } from "./debug.js";

const moduleContext = {
  package: "chrome-ext-playback-speed",
  file: "frame.js",
};

debug({
  ...moduleContext,
  event: "load",
});

chrome.runtime.onMessage.addListener(function messageHandler(
  request,
  sender,
  sendResponse,
) {
  return debug({
    ...moduleContext,
    event: "chrome.runtime.onMessage",
    function: "messageHandler(request, sender, sendResponse)",
    arguments: { request, sender, sendResponse },
  }, async function execute(context) {
    switch (request.command) {
      case "browser action": {
        context.$log(`Setting playback rate to ${request.rate}×`);
        setRate(request.rate);
        const response = {
          result: "success",
          rate: request.rate,
        };
        context.$log("response", response);
        break;
      }
      default: {
        context.$log(`switch (request.command): default branch reached`, {
          expected: "browser action",
          actual: request.command,
        });
        break;
      }
    }
  });
});

const MEDIA_ELEMENT_SELECTOR = "video, audio";

function setRate(rate) {
  return debug({
    ...moduleContext,
    function: "setRate(rate)",
    arguments: { rate },
  }, async function execute(context) {
    for (const element of document.querySelectorAll(MEDIA_ELEMENT_SELECTOR)) {
      context.$log("media element", element);
      element.playbackRate = rate;
    }
  });
}
