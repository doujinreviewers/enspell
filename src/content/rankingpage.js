(async () => {
  const { DLSITE_ENSPELL_STORAGE_KEY } = await import(chrome.runtime.getURL('content/base_filter.js'));
  const { observeFilteredBlocks } = await import(chrome.runtime.getURL('content/list_filter.js'));
  chrome.storage.local.get(DLSITE_ENSPELL_STORAGE_KEY, data => {
    const settings = data[DLSITE_ENSPELL_STORAGE_KEY] || {};
    if (!settings.enable_ranking) return;
    observeFilteredBlocks(document, settings, [
  {
    "root": "#main_inner",
    "cells": ".n_worklist > tbody > tr, li.ranking_top_worklist_item",
    "heading": "h1"
  }
]);
  });
})();
