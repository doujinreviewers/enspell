chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url && tab.url.includes("dlsite.com")) {
      console.log("対象のURLが開かれました:", tab.url);

      chrome.scripting.executeScript({
          target: { tabId: tabId },
          files: ["inject.js"]
      }).then(() => {
          console.log("Vue.js スクリプトが挿入されました。");
      }).catch((error) => {
          console.error("スクリプトの挿入に失敗:", error);
      });
  }
});
