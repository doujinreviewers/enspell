import { DLSITE_ENSPELL_STORAGE_KEY, filterCells } from './base_filter.js';

let type1_cells = document.querySelectorAll(".work_1col_table.n_worklist > tbody > tr");
let type3_cells = document.querySelectorAll("#search_result_img_box > li");

chrome.storage.local.get(DLSITE_ENSPELL_STORAGE_KEY, (data)=>{
  let settings = data[DLSITE_ENSPELL_STORAGE_KEY] || {};

  if(!settings.enable_search){
    return;
  }

  let cells = type1_cells.length != 0 ? type1_cells : type3_cells;
  let ngcount = filterCells(cells, settings.ng_circles);

  if (settings.show_ng_count) {
    let dom = document.querySelector("#wrapper");
    let mo = new MutationObserver(function(record, observer) {
      let page_total = document.querySelector(".page_total");
      if(page_total){
        page_total.innerHTML = page_total.innerHTML + `<strong>-${ngcount}</strong>件`
        mo.disconnect();
      }
    });
    let config = {
      childList: true,
      subtree: true
    };
    mo.observe(dom, config);
  }

});