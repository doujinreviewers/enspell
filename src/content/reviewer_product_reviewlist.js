// TODO reviewer_productとほぼ同じ
"use strict";
{
  const DLSITE_ENSPELL_STORAGE_KEY = 'dlsite_enspell_options';

  let judge = (ng_reviewers, reviewer_name_or_reviewer_number) => {
    return ng_reviewers.some((pattern) => {
      return pattern && pattern == reviewer_name_or_reviewer_number
    });
  }

  let getReviewerNameAndNumber = (cell) => {
    return {
      reviewer_name: cell.querySelector(".reveiw_author_item a").textContent.trim(),
      reviewer_number: cell.querySelector(".reveiw_author_item a").href.match(/REV\d*/)[0]
    };
  }

  chrome.storage.local.get(DLSITE_ENSPELL_STORAGE_KEY, (data)=>{
    let settings = data[DLSITE_ENSPELL_STORAGE_KEY] || {};

    if(!settings.enable_review_list){
      return;
    }

    let ng_arr = settings.ng_reviewers.split(/\r\n|\n/);
    let cells = document.querySelectorAll(".review_contents");
    let ngcount = 0;

    Array.from(cells).forEach((cell) => {
      let { reviewer_name, reviewer_number } = getReviewerNameAndNumber(cell);

      if (judge(ng_arr, reviewer_name) || judge(ng_arr, reviewer_number)){
        cell.remove();
        ngcount++;
      }
    })

    if (settings.show_reviewer_ng_count) {
      let page_total = document.querySelector("#main_inner .page_total");
      if(page_total){
        page_total.innerHTML = page_total.innerHTML + `<strong>-${ngcount}</strong>件`
      }
    }

  });

}