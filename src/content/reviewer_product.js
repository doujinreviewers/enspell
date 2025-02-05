import { DLSITE_ENSPELL_STORAGE_KEY, filterReviewCells } from './base_filter.js';

chrome.storage.local.get(DLSITE_ENSPELL_STORAGE_KEY, (data)=>{
  let settings = data[DLSITE_ENSPELL_STORAGE_KEY] || {};

  if(!settings.enable_product){
    return;
  }

  let cells = document.querySelectorAll(".review_contents");
  let ngcount = filterReviewCells(cells, settings.ng_reviewers)

  if (settings.show_reviewer_ng_count) {
    let review_sort_num = document.querySelector("#work_review .review_sort_num");
    if(review_sort_num){
      review_sort_num.innerHTML = review_sort_num.innerHTML + `<strong>-${ngcount}</strong>件`
    }
  }

});