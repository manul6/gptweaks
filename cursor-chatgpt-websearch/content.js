/*  force-select "web search" in every new chatgpt chat.  */

function openToolMenu() {
  const btn = document.getElementById("system-hint-button");
  if (btn && btn.getAttribute("aria-expanded") === "false") {
    console.log("clicking tools button");
    btn.click();
    return true;
  }
  return false;
}

function clickWebSearchItem() {
  const items = document.querySelectorAll('div[role="menuitemradio"]');
  const webSearchItem = Array.from(items).find(el => 
    el.textContent && el.textContent.trim().toLowerCase().includes("web search")
  );
  
  if (webSearchItem) {
    console.log("clicking web search menu item");
    webSearchItem.click();
    return true;
  }
  return false;
}

function ensureWebSearch() {
  console.log("ensuring web search is selected");
  
  // first, try to open the tools menu
  if (openToolMenu()) {
    // give the menu a moment to render before clicking the item
    setTimeout(() => {
      clickWebSearchItem();
    }, 100);
  } else {
    // if menu is already open, just try to click the item
    clickWebSearchItem();
  }
}

// run on initial load
setTimeout(ensureWebSearch, 1000);

// observe for changes to handle navigation within the spa
const observer = new MutationObserver((mutations) => {
  let shouldCheck = false;
  
  mutations.forEach((mutation) => {
    // check if new nodes were added that might be the tools button or menu
    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
      for (let node of mutation.addedNodes) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          // check if the tools button or menu items were added
          if (node.id === 'system-hint-button' || 
              node.querySelector && (
                node.querySelector('#system-hint-button') ||
                node.querySelector('div[role="menuitemradio"]')
              )) {
            shouldCheck = true;
            break;
          }
        }
      }
    }
  });
  
  if (shouldCheck) {
    setTimeout(ensureWebSearch, 200);
  }
});

observer.observe(document.body, { 
  childList: true, 
  subtree: true 
});

// listen for messages from background script
// use the standard webextension API that works in both firefox and chrome
try {
  if (typeof browser !== 'undefined' && browser.runtime && browser.runtime.onMessage) {
    browser.runtime.onMessage.addListener((msg) => {
      if (msg && msg.action === "ensureWebSearch") {
        console.log("received message to ensure web search");
        ensureWebSearch();
      }
    });
  }
} catch (e) {
  console.log("browser api not available:", e);
}

console.log("chatgpt web search auto-selector content script loaded");