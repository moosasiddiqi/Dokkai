chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ tabId: tab.id });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "GET_PAGE_CONTENT") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]) return sendResponse({ error: "No active tab" });
      chrome.scripting.executeScript(
        {
          target: { tabId: tabs[0].id },
          func: () => {
            const unwanted = ["script", "style", "nav", "footer", "header", "aside", "noscript"];
            unwanted.forEach(tag => document.querySelectorAll(tag).forEach(el => el.remove()));
            const text = document.body.innerText;
            return {
              text: text.slice(0, 15000),
              title: document.title,
              url: window.location.href
            };
          }
        },
        (results) => {
          if (chrome.runtime.lastError || !results?.[0]?.result) {
            return sendResponse({ error: "Could not read page" });
          }
          sendResponse({ data: results[0].result });
        }
      );
    });
    return true; // keep channel open for async
  }
});
