// TODO reviewer_productとほぼ同じ
"use strict";
{
  const DLSITE_ENSPELL_STORAGE_KEY = 'dlsite_enspell_options';

  let judge = (ng_arr, id_or_name) => {
    return ng_arr.some((ng_target) => {
      return ng_target.id == id_or_name || ng_target.name == id_or_name;
    });
  };

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

    let cells = document.querySelectorAll(".review_contents");
    let ngcount = 0;

    Array.from(cells).forEach((cell) => {
      let { reviewer_name, reviewer_number } = getReviewerNameAndNumber(cell);

      if (judge(settings.ng_reviewers, reviewer_name) || judge(settings.ng_reviewers, reviewer_number)){
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