(async () => {
  const { DLSITE_ENSPELL_STORAGE_KEY } = await import(chrome.runtime.getURL('content/base_filter.js'));
  const { observeGenreText } = await import(chrome.runtime.getURL('content/genre_text.js'));
  const { waitForTopPageReady: waitForPageReady } = await import(chrome.runtime.getURL('content/top_ranking_filter.js'));
  const settings = await new Promise(resolve => chrome.storage.local.get(DLSITE_ENSPELL_STORAGE_KEY, data => resolve(data[DLSITE_ENSPELL_STORAGE_KEY] || {})));
  if (!settings.enable_genre_revival) return;
  const response = await fetch(chrome.runtime.getURL('genre_mapping.json'));
  const mapping = await response.json();
  await waitForPageReady(document);
  observeGenreText(document, mapping);
})();
