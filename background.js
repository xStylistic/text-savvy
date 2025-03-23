// Create context menu item for simplifying text
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "simplifyText",
    title: "Simplify Text",
    contexts: ["selection"],
  });
});

// Handle clicks on the context menu item
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "simplifyText") {
    chrome.tabs.sendMessage(tab.id, {
      action: "modifyPageText",
      prompt:
        "Rewrite the following to be simpler and easier to read. DO NOT RESPOND WITH ANYTHING ELSE BUT THE SIMPLIFIED TEXT. Here is the text you simplify:\n\n{{text}}\n DO NOT REPLY WITH 'Here is your simplified text:'",
    });
  }
});
