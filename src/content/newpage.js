(async () => {
  const { DLSITE_ENSPELL_STORAGE_KEY } = await import(chrome.runtime.getURL('content/base_filter.js'));
  const { observeFilteredBlocks } = await import(chrome.runtime.getURL('content/list_filter.js'));
  chrome.storage.local.get(DLSITE_ENSPELL_STORAGE_KEY, data => {
    const settings = data[DLSITE_ENSPELL_STORAGE_KEY] || {};
    if (!settings.enable_new) return;
    observeFilteredBlocks(document, settings, [
  {
    "root": "#main_inner",
    "cells": ".n_worklist_item",
    "heading": "h3.work_update"
  }
]);
  });
})();
