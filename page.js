// Root page content script
// Expects to run only in top-level pages, not in all frames. Listens for the
// extension click ("browser action"), calculates the new playback rate and then
// sends a message to all frames to apply that rate.

console.debug("[page.js] load", { self, window, "top": window === window.top });

const nextRate = cycle(1.25, 1.5, 1.75, 2, 2.5, 3, 3.5, 4, 1);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.debug(
    "[page.js] chrome.runtime.onMessage.addListener()",
    {request, sender, sendResponse},
  );
  switch (request.command) {
    case "browser action": {
      const rate = nextRate();
      
      chrome.runtime.sendMessage({
        command: "set rate",
        rate: rate,
      });
      
      messageChange(rate);
      break;
    }
  }
});

// Accepts a list of values and returns a function that returns the next value
// each time it's called, cycling back to the first value after the last value.
function cycle(...values) {
  let i = 0;
  return function next() {
    return values[i++ % values.length];
  };
};

// Displays a page-level visual indication each time the rate is changed.
async function messageChange(rate) {
  const iframe = createMessageElement(rate);
  document.body.appendChild(iframe);
  
  const idoc = iframe.contentDocument;
  idoc.open();
  idoc.write(`
    <style>
      body {
        display: grid;
        place-content: center center;
      }
      
      div {
        color: white;
        font-size: 7rem;
        font-weight: 900;
        font-family: Menlo, Consolas, Monaco, Liberation Mono, Lucida Console,
          monospace;
        background: black;
        padding: 3rem;
        border-radius: 2rem;
        opacity: 0;
        animation: 500ms ease-out fade-in-out;
      }
      
      @keyframes fade-in-out {
        0% {
          opacity: 0;
          transform: scale(0.75);
        }
        
        50% {
          opacity: 1;
        }
        
        100% {
          opacity: 0;
          transform: scale(1);
        }
      }
    </style>
    <div>${rate}×</div>
  `);
  idoc.close();
  
  await delay(500);
  document.body.removeChild(iframe);
}

function createMessageElement(content) {
  const iframe = document.createElement("iframe");
  Object.entries({
    "position": "fixed",
    "z-index": "99999999",
    "width": "100vw",
    "height": "100vh",
    "top": "0",
    "left": "0",
    "pointer-events": "none",
    "border": "none",
  }).forEach(([property, value]) => {
    iframe.style[property] = value;
  });
  return iframe;
}

function setMessageContent(element, message) {
  
}

// Await-able function for a specified delay in milliseconds.
// usage: await delay(150);
function delay(ms = 0) {
  return new Promise(resolve => {
    setTimeout(() => resolve(ms), Number(ms));
  });
}
