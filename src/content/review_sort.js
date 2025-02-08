
// components.js をページに挿入
const componentScript = document.createElement("script");
componentScript.src = chrome.runtime.getURL("components.js");
document.head.appendChild(componentScript);

// inject.js をページに挿入
const injectScript = document.createElement("script");
injectScript.src = chrome.runtime.getURL("inject.js");
document.head.appendChild(injectScript);