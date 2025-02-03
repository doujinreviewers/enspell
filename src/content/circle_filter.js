// QUESTION 無理に共通にしなくても良いか？

import { DLSITE_ENSPELL_STORAGE_KEY } from "../options/storage.js";

let judge = (ng_circles, maker_name_or_circle_number) => {
  return ng_circles.some((pattern) => pattern && pattern == maker_name_or_circle_number);
}

let getMakerNameAndCircleNumber = (cell) => {
  let makerAnchor = cell.querySelector(".maker_name a");
  return {
    maker_name: makerAnchor ? makerAnchor.textContent.trim() : "",
    circle_number: makerAnchor ? (makerAnchor.href.match(/RG\d*/)?.[0] || "") : ""
  };
}

let removeNGCircles = (cells, ng_arr) => {
  let ngcount = 0;
  Array.from(cells).forEach((cell) => {
    let { maker_name, circle_number } = getMakerNameAndCircleNumber(cell);
    if (judge(ng_arr, maker_name) || judge(ng_arr, circle_number)) {
      cell.remove();
      ngcount++;
    }
  });
  return ngcount;
}

  // let showNGCount = (cell, replace_string_pair, ng_count) => {

  // }

// let isSearchUrl = (url) => {
//   const patterns = [
//     "^https?://(?:\\w+\\.)?dlsite\\.com/.*/fsr/.*$",
//     "^https?://(?:\\w+\\.)?dlsite\\.com/.*/works/.*$"
//   ];
//   return patterns.some(pattern => new RegExp(pattern).test(url));
// }

  // 設定を取得
  // chrome.storage.local.get(DLSITE_ENSPELL_STORAGE_KEY, (data)=>{
  //   let settings = data[DLSITE_ENSPELL_STORAGE_KEY] || {};
    
  //   let ng_arr = settings.ng_circles.split(/\r\n|\n/);
  //   let url = window.location.href;
  //   let ngcount = 0;

  //   if(isSearchUrl(url) && settings.enable_search) {
  //     let type1_cells = document.querySelectorAll(".work_1col_table.n_worklist > tbody > tr");
  //     let type3_cells = document.querySelectorAll("#search_result_img_box > li");
  //     let cells = type1_cells.length != 0 ? type1_cells : type3_cells;
  //     ngcount = removeNGCircles(cells, ng_arr);
  //   } else if (url.includes("/ranking") && settings.enable_ranking) {
  //     let cells = document.querySelectorAll(".n_worklist > tbody > tr, li.ranking_top_worklist_item");
  //     ngcount = removeNGCircles(cells, ng_arr);
  //   } else if (url.includes("/new") && settings.enable_new) {
  //     let cells = document.querySelectorAll(".n_worklist_item");
  //     ngcount = removeNGCircles(cells, ng_arr);
  //   } else if (url.includes("/announce") && settings.enable_announce) {
  //     let cells = document.querySelectorAll(".n_worklist_item");
  //     ngcount = removeNGCircles(cells, ng_arr);
  //   } else if (settings.enable_top && document.querySelector(".recommend_list.type_top")) {
  //     let cells = document.querySelectorAll("._top_total_ranking li, .work_push.type_genre_ranking li");
  //     ngcount = removeNGCircles(cells, ng_arr);
  //   }

  //   if (settings.show_ng_count && ngcount > 0) {

  //   }

  // });