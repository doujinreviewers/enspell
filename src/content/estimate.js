(async () => {
  const { DLSITE_ENSPELL_STORAGE_KEY } = await import(chrome.runtime.getURL('content/base_filter.js'));
  const { observeEstimate } = await import(chrome.runtime.getURL('content/sales_estimate.js'));
  const { waitForTopPageReady: waitForPageReady } = await import(chrome.runtime.getURL('content/top_ranking_filter.js'));
  const settings = await new Promise(resolve => chrome.storage.local.get(DLSITE_ENSPELL_STORAGE_KEY, data => resolve(data[DLSITE_ENSPELL_STORAGE_KEY] || {})));
  if (!settings.show_estimate) return;
  await waitForPageReady(document);
  observeEstimate(document, settings);
})();
