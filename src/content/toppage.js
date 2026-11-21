(async () => {
  const { isFloorTop } = await import(chrome.runtime.getURL('content/floors.js'));
  if (!isFloorTop(location.pathname)) return;
  const { DLSITE_ENSPELL_STORAGE_KEY } = await import(chrome.runtime.getURL('content/base_filter.js'));
  const { observeNewWorks } = await import(chrome.runtime.getURL('content/new_work_filter.js'));
  const { observeTopRankings, waitForTopPageReady } = await import(chrome.runtime.getURL('content/top_ranking_filter.js'));
  const { observeRecommendations, observeLegacyTopRankings, observeGarumaniTop } = await import(chrome.runtime.getURL('content/list_filter.js'));
  const settings = await new Promise(resolve => chrome.storage.local.get(DLSITE_ENSPELL_STORAGE_KEY, data => resolve(data[DLSITE_ENSPELL_STORAGE_KEY] || {})));
  if (!settings.enable_top) return;
  await waitForTopPageReady(document);
  observeNewWorks(document, settings);
  observeTopRankings(document, settings);
  observeLegacyTopRankings(document, settings);
  observeRecommendations(document, settings);
  if (location.pathname.startsWith('/garumani/')) observeGarumaniTop(document, settings);
})();
