import { DLSITE_ENSPELL_STORAGE_KEY, filterCells } from './base_filter.js';

let all_cells = document.querySelectorAll(".n_worklist > tbody > tr");
let category_cells = document.querySelectorAll("li.ranking_top_worklist_item");

chrome.storage.local.get(DLSITE_ENSPELL_STORAGE_KEY, (data)=>{
  let settings = data[DLSITE_ENSPELL_STORAGE_KEY] || {};

  if(!settings.enable_ranking){
    return;
  }

  let cells = all_cells.length != 0 ? all_cells : category_cells;
  let ngcount = filterCells(cells, settings.ng_circles);

  if (settings.show_ng_count) {
    let heading = document.querySelector("h1");
    if(heading){
      heading.innerHTML = heading.innerHTML + `<strong>-${ngcount}</strong>件`
    }
  }

});