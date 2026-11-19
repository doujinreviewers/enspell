(async () => {
  const { DLSITE_ENSPELL_STORAGE_KEY } = await import(chrome.runtime.getURL('content/base_filter.js'));
  const { observeFilteredBlocks } = await import(chrome.runtime.getURL('content/list_filter.js'));
  const { waitForTopPageReady: waitForPageReady } = await import(chrome.runtime.getURL('content/top_ranking_filter.js'));
  const settings = await new Promise(resolve => chrome.storage.local.get(DLSITE_ENSPELL_STORAGE_KEY, data => resolve(data[DLSITE_ENSPELL_STORAGE_KEY] || {})));
  if (!settings.enable_review_list) return;
  await waitForPageReady(document);
  observeFilteredBlocks(document, settings, [{"root":"#main_inner","cells":".review_contents","heading":".page_total"}], true);
})();
