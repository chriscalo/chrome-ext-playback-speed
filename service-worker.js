// Background script
// - handles clicks on the extension icon
// - coordinates communication between content scripts

import { debug } from "./debug.js";

const moduleContext = {
  package: "chrome-ext-playback-speed",
  file: "service-worker.js",
};

debug({
  ...moduleContext,
  event: "load",
});

const TabSessionStore = {
  async get(tabId) {
    return debug({
      ...moduleContext,
      function: "TabSessionStore.get(tabId)",
      arguments: { tabId },
    }, async function execute(context) {
      const key = `tabs/${tabId}`;
      const data = await chrome.storage.session.get();
      return data[key];
    });
  },
  async set(tabId, data) {
    return debug({
      ...moduleContext,
      function: "TabSessionStore.set(tabId, data)",
      arguments: { tabId, data },
    }, async function execute(context) {
      const key = `tabs/${tabId}`;
      const payload = { [key]: data };
      await chrome.storage.session.set(payload);
      return TabSessionStore.get(tabId);
    });
  },
}

// forwards all messages from content scripts
chrome.runtime.onMessage.addListener(async function messageHandler(
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
    const response = await sendMessage(request);
    context.$log("response", reponse);
    sendResponse(response);
  });
});

// broadcasts when the browser action is clicked
chrome.action.onClicked.addListener(async function actionHandler(tab) {
  return debug({
    ...moduleContext,
    event: "chrome.action.onClicked",
    function: "actionHandler(tab)",
    arguments: { tab },
  }, async function execute(context) {
    const tabId = tab.id;
    context.$log("tabId", tabId);
    const rate = await getNextRate(tabId);
    context.$log("rate", rate);
    
    const message = {
      command: "browser action",
      rate: rate,
    };
    context.$log("message", message);
    chrome.tabs.sendMessage(tabId, message);
    
    const badgeText = String(rate);
    context.$log("badgeText", badgeText);
    chrome.action.setBadgeText({tabId, text: badgeText});
    
    await writeSavedRate(tabId, rate);
  });
});

async function readSavedRate(tabId) {
  return debug({
    ...moduleContext,
    function: "readSavedRate(tabId)",
    arguments: { tabId },
  }, async function execute(context) {
    const defaultRate = 1;
    const storedData = await TabSessionStore.get(tabId);
    context.$log("storedData", storedData);
    
    return storedData?.rate ?? defaultRate;
  });
}

async function writeSavedRate(tabId, rate) {
  return debug({
    ...moduleContext,
    function: "writeSavedRate(tabId, rate)",
    arguments: { tabId, rate },
  }, async function execute(context) {
    const payload = { rate: rate };
    context.$log("payload", payload);
    
    const saved = await TabSessionStore.set(tabId, payload);
    context.$log("saved", saved);
  });
}

const rates = [1.25, 1.5, 1.75, 2, 2.5, 3, 3.5, 4, 1];
async function getNextRate(tabId) {
  return debug({
    ...moduleContext,
    function: "getNextRate(tabId)",
    arguments: { tabId },
  }, async function execute(context) {
    context.$log("rates", rates);
    
    const lastRate = await readSavedRate(tabId);
    context.$log("lastRate", lastRate);
    
    const nextIndex = (rates.indexOf(lastRate) + 1) % rates.length;
    context.$log("nextIndex", nextIndex);
    
    return rates[nextIndex];
  });
}
