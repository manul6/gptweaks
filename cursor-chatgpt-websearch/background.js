/*  background service worker for chatgpt web search auto-selector  */

// cross-browser compatibility
const browserApi = typeof browser !== 'undefined' ? browser : chrome;

// listen for tab updates
browserApi.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // only act when the page has finished loading
  if (changeInfo.status === "complete" && tab.url) {
    // check if this is a chatgpt page
    if (/^https:\/\/(chat\.openai\.com|chatgpt\.com)\//.test(tab.url)) {
      console.log("chatgpt page loaded, sending message to content script");
      
      // send message to content script to ensure web search is selected
      browserApi.tabs.sendMessage(tabId, { 
        action: "ensureWebSearch" 
      }).catch((error) => {
        // ignore errors - content script might not be ready yet
        console.log("could not send message to content script:", error);
      });
    }
  }
});

// listen for navigation within spa (pushstate/popstate events)
browserApi.webNavigation?.onHistoryStateUpdated?.addListener((details) => {
  if (/^https:\/\/(chat\.openai\.com|chatgpt\.com)\//.test(details.url)) {
    console.log("chatgpt spa navigation detected");
    
    // delay to allow page to render
    setTimeout(() => {
      browserApi.tabs.sendMessage(details.tabId, { 
        action: "ensureWebSearch" 
      }).catch((error) => {
        console.log("could not send message after navigation:", error);
      });
    }, 500);
  }
});

console.log("chatgpt web search auto-selector background script loaded");