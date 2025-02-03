"use strict";
{
  const DLSITE_ENSPELL_STORAGE_KEY = 'dlsite_enspell_options';

  let judge = (ng_arr, id_or_name) => {
    return ng_arr.some((ng_target) => {
      return ng_target.id == id_or_name || ng_target.name == id_or_name;
    });
  };

  let getMakerNameAndCircleNumber = (cell) => {
    return {
      maker_name: cell.querySelector(".maker_name a").textContent.trim(),
      circle_number: cell.querySelector(".maker_name a").href.match(/RG\d*/)[0]
    };
  }

  chrome.storage.local.get(DLSITE_ENSPELL_STORAGE_KEY, (data)=>{
    let settings = data[DLSITE_ENSPELL_STORAGE_KEY] || {};

    if(!settings.enable_announce){
      return;
    }

    let cells = document.querySelectorAll(".n_worklist_item");
    let ngcount = 0;

    Array.from(cells).forEach((cell) => {
      let { maker_name, circle_number } = getMakerNameAndCircleNumber(cell);

      if (judge(settings.ng_circles, maker_name) || judge(settings.ng_circles, circle_number)){
        cell.remove();
        ngcount++;
      }
    })

    if (settings.show_ng_count) {
      let heading = document.querySelector("h3.work_update");
      if(heading){
        heading.innerHTML = heading.innerHTML + `<strong>-${ngcount}</strong>件`
      }
    }

  });

}