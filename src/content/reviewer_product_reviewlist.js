import { DLSITE_ENSPELL_STORAGE_KEY, filterReviewCells } from './base_filter.js';

chrome.storage.local.get(DLSITE_ENSPELL_STORAGE_KEY, (data)=>{
  let settings = data[DLSITE_ENSPELL_STORAGE_KEY] || {};

  if(!settings.enable_review_list){
    return;
  }

  let cells = document.querySelectorAll(".review_contents");
  let ngcount = filterReviewCells(cells, settings.ng_reviewers)

  if (settings.show_reviewer_ng_count) {
    let page_total = document.querySelector("#main_inner .page_total");
    if(page_total){
      page_total.innerHTML = page_total.innerHTML + `<strong>-${ngcount}</strong>件`
    }
  }

});