(async () => {
  const { DLSITE_ENSPELL_STORAGE_KEY } = await import(chrome.runtime.getURL('content/base_filter.js'));
  const { observeFilteredBlocks } = await import(chrome.runtime.getURL('content/list_filter.js'));
  chrome.storage.local.get(DLSITE_ENSPELL_STORAGE_KEY, data => {
    const settings = data[DLSITE_ENSPELL_STORAGE_KEY] || {};
    if (!settings.enable_search) return;
    observeFilteredBlocks(document, settings, [
  {
    "root": "#main_inner",
    "cells": ".work_1col_table.n_worklist > tbody > tr, #search_result_img_box > li",
    "heading": ".base_title_br .original_name",
    "countCurrentResults": true
  },
  {
    "root": "#_works_type_ranking",
    "cells": "li.swiper-slide",
    "heading": "h2, h3, .work_subheading"
  }
]);
  });
})();
