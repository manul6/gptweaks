let hasRunOnThisPage = false;
let isWebSearchAlreadyActive = false;

function forceOpenToolsMenu() {
  const btn = document.getElementById("system-hint-button");
  if (!btn) {
    console.log("tools button not found");
    return false;
  }

  console.log("attempting to force open tools menu");
  
  if (btn.getAttribute("data-state") === "closed") {
    console.log("setting radix ui state to open");
    btn.setAttribute("data-state", "open");
    btn.setAttribute("aria-expanded", "true");
  }
  
  const events = [
    new Event('mousedown', { bubbles: true }),
    new Event('mouseup', { bubbles: true }),
    new Event('click', { bubbles: true }),
    new Event('pointerdown', { bubbles: true }),
    new Event('pointerup', { bubbles: true }),
    new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
    new KeyboardEvent('keyup', { key: 'Enter', bubbles: true })
  ];
  
  events.forEach(event => btn.dispatchEvent(event));
  
  btn.focus();
  setTimeout(() => {
    btn.dispatchEvent(new KeyboardEvent('keydown', { 
      key: ' ', 
      code: 'Space', 
      bubbles: true,
      cancelable: true
    }));
  }, 3000);
  
  return true;
}

function tryReactFiberClick() {
  const btn = document.getElementById("system-hint-button");
  if (!btn) return false;
  
  const fiber = btn._reactInternalFiber || btn._reactInternalInstance;
  if (fiber && fiber.memoizedProps && fiber.memoizedProps.onClick) {
    console.log("calling react onclick handler directly");
    fiber.memoizedProps.onClick({ preventDefault: () => {}, stopPropagation: () => {} });
    return true;
  }
  
  for (const key in btn) {
    if (key.startsWith('__reactInternalInstance') || key.startsWith('__reactEventHandlers')) {
      const instance = btn[key];
      if (instance && instance.onClick) {
        console.log("calling react handler via", key);
        instance.onClick({ preventDefault: () => {}, stopPropagation: () => {} });
        return true;
      }
    }
  }
  
  return false;
}

function isWebSearchCurrentlySelected() {
  const toolsButton = document.getElementById("system-hint-button");
  if (!toolsButton) return false;
  
  const buttonText = toolsButton.textContent || toolsButton.innerText || "";
  if (buttonText.toLowerCase().includes("web search")) {
    console.log("web search already active (detected via button text)");
    return true;
  }
  
  const ariaLabel = toolsButton.getAttribute("aria-label") || "";
  if (ariaLabel.toLowerCase().includes("web search")) {
    console.log("web search already active (detected via aria-label)");
    return true;
  }
  
  if (window.location.href.includes("tool=web_search")) {
    console.log("web search already active (detected via URL parameter)");
    return true;
  }
  
  const selectedItems = document.querySelectorAll('[role="menuitemradio"][data-state="checked"], [role="menuitemradio"][aria-checked="true"]');
  for (const item of selectedItems) {
    if (item.textContent && item.textContent.toLowerCase().includes("web search")) {
      console.log("web search already active (detected via checked menu item)");
      return true;
    }
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
    hasRunOnThisPage = true;
    return true;
  }
  return false;
}

function injectWebSearchMenu() {
  const btn = document.getElementById("system-hint-button");
  if (!btn) return false;
  
  console.log("injecting custom web search menu");
  
  const menu = document.createElement('div');
  menu.style.cssText = `
    position: absolute;
    top: 100%;
    left: 0;
    background: var(--main-surface-primary);
    border: 1px solid var(--border-light);
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    z-index: 10000;
    min-width: 200px;
    padding: 8px;
  `;
  
  const webSearchOption = document.createElement('div');
  webSearchOption.style.cssText = `
    padding: 8px 12px;
    border-radius: 6px;
    cursor: pointer;
    background: var(--interactive-bg-secondary-hover);
    color: var(--text-primary);
    font-size: 14px;
  `;
  webSearchOption.textContent = "web search";
  webSearchOption.setAttribute('role', 'menuitemradio');
  webSearchOption.setAttribute('data-auto-injected', 'true');
  
  webSearchOption.onclick = () => {
    console.log("custom web search option clicked");
    menu.remove();
    window.postMessage({ type: 'CHATGPT_SELECT_WEB_SEARCH' }, '*');
  };
  
  menu.appendChild(webSearchOption);
  
  const buttonRect = btn.getBoundingClientRect();
  menu.style.position = 'fixed';
  menu.style.top = (buttonRect.bottom + 4) + 'px';
  menu.style.left = buttonRect.left + 'px';
  
  document.body.appendChild(menu);
  
  setTimeout(() => {
    webSearchOption.click();
  }, 4000);
  
  return true;
}

function ensureWebSearch() {
  if (hasRunOnThisPage) {
    console.log("already ran on this page, skipping");
    return;
  }
  
  if (isWebSearchCurrentlySelected()) {
    console.log("web search already active, no action needed");
    hasRunOnThisPage = true;
    return;
  }
  
  console.log("web search not active, ensuring it gets selected");
  
  if (clickWebSearchItem()) {
    console.log("web search found and clicked directly");
    return;
  }
  
  console.log("attempting to open tools menu...");
  
  forceOpenToolsMenu();
  
  setTimeout(() => {
    if (!hasRunOnThisPage) {
      console.log("trying react fiber approach");
      tryReactFiberClick();
    }
  }, 5000);
  
  setTimeout(() => {
    if (!hasRunOnThisPage) {
      console.log("final attempt to click web search");
      if (clickWebSearchItem()) {
        console.log("web search clicked after very long delay");
      } else {
        console.log("falling back to custom menu injection");
        injectWebSearchMenu();
      }
    }
  }, 10000);
}

let lastUrl = window.location.href;
function checkForUrlChange() {
  const currentUrl = window.location.href;
  if (currentUrl !== lastUrl) {
    console.log("URL changed, resetting page flag");
    hasRunOnThisPage = false;
    lastUrl = currentUrl;
    setTimeout(waitForPageReady, 10000);
  }
}

function waitForPageReady() {
  const isReady = document.getElementById("system-hint-button") &&
                  document.querySelector('[data-testid*="thread"], main, .composer') &&
                  document.readyState === 'complete';
  
  if (isReady) {
    console.log("page appears ready, waiting extra 8 seconds before running ensurewebsearch");
    setTimeout(ensureWebSearch, 8000);
  } else {
    console.log("page not ready yet, waiting 2 seconds...");
    setTimeout(waitForPageReady, 2000);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log("dom loaded, waiting 10 seconds before checking readiness");
    setTimeout(waitForPageReady, 10000);
  });
} else {
  console.log("dom already ready, waiting 10 seconds before checking readiness");
  setTimeout(waitForPageReady, 10000);
}

const observer = new MutationObserver((mutations) => {
  checkForUrlChange();
  
  if (hasRunOnThisPage) return;
  
  let shouldCheck = false;
  
  mutations.forEach((mutation) => {
    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
      for (let node of mutation.addedNodes) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          if (node.id === 'system-hint-button' || 
              node.querySelector && (
                node.querySelector('#system-hint-button') ||
                node.querySelector('[data-testid*="thread"]') ||
                node.querySelector('main[class*="conversation"]')
              )) {
            shouldCheck = true;
            break;
          }
        }
      }
    }
  });
  
  if (shouldCheck) {
    setTimeout(waitForPageReady, 5000);
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

window.addEventListener('popstate', () => {
  console.log("popstate event, resetting page flag");
  hasRunOnThisPage = false;
  setTimeout(waitForPageReady, 10000);
});

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