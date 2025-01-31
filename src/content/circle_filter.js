"use strict";

// 共通の処理
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

// 設定を取得
chrome.storage.local.get({
  ng_circles: "",
  show_ng_count: false,
  enable_top: false,
  enable_search: false,
  enable_ranking: false,
  enable_announce: false,
  enable_new: false
}, (settings) => {
  
  let ng_arr = settings.ng_circles.split(/\r\n|\n/);
  let url = window.location.href;
  let ngcount = 0;

  if (url.includes("/maniax/ranking") && settings.enable_ranking) {
    let cells = document.querySelectorAll(".n_worklist > tbody > tr, li.ranking_top_worklist_item");
    ngcount = removeNGCircles(cells, ng_arr);
  } 
  else if (url.includes("/maniax/new") && settings.enable_new) {
    let cells = document.querySelectorAll(".n_worklist_item");
    ngcount = removeNGCircles(cells, ng_arr);
  }
  else if (url.includes("/maniax/announce") && settings.enable_announce) {
    let cells = document.querySelectorAll(".n_worklist_item");
    ngcount = removeNGCircles(cells, ng_arr);
  }
  else if (settings.enable_top && document.querySelector(".recommend_list.type_top")) {
    let cells = document.querySelectorAll("._top_total_ranking li, .work_push.type_genre_ranking li");
    ngcount = removeNGCircles(cells, ng_arr);
  }

  if (settings.show_ng_count && ngcount > 0) {
    let heading = document.querySelector("h1, h3.work_update");
    if (heading) {
      heading.innerHTML += `<strong>-${ngcount}</strong>件`;
    }
  }

});
