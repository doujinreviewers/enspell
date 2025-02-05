import { DLSITE_ENSPELL_STORAGE_KEY, filterCells } from './base_filter.js';

chrome.storage.local.get(DLSITE_ENSPELL_STORAGE_KEY, (data)=>{
  let settings = data[DLSITE_ENSPELL_STORAGE_KEY] || {};

  if(!settings.enable_announce){
    return;
  }

  let cells = document.querySelectorAll(".n_worklist_item");
  let ngcount = filterCells(cells, settings.ng_circles);

  if (settings.show_ng_count) {
    let heading = document.querySelector("h3.work_update");
    if(heading){
      heading.innerHTML = heading.innerHTML + `<strong>-${ngcount}</strong>件`
    }
  }

});