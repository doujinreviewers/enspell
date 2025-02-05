(async () => {

  if (!/^\/[^/]+\/?$/.test(location.pathname)){
    return;
  }

  const baseFilterModule = await import(chrome.runtime.getURL('content/base_filter.js'));
  const { filterCells, filterSingleCell, DLSITE_ENSPELL_STORAGE_KEY } = baseFilterModule;

  let recommend_list = document.querySelectorAll(".recommend_list.type_top");
  let top_total_ranking_cells = document.querySelectorAll("._top_total_ranking li");
  let type_genre_ranking_blocks = document.querySelectorAll(".work_push.type_genre_ranking");
  let subheading = document.querySelectorAll("[data-section_name=top_recommend] h3.work_subheading");

  let discount_cells = [];
  let recommend_cells = [];
  Array.from(recommend_list).forEach((cell) => {
    if(cell.className.includes("_discount")){
      discount_cells = cell;
    }else if(cell.className.includes("_all_")){
      recommend_cells = cell;
    }
  })

  let titles = document.querySelectorAll(".title_01.with_work_push.clearfix")

  chrome.storage.local.get(DLSITE_ENSPELL_STORAGE_KEY, (data)=>{
    let settings = data[DLSITE_ENSPELL_STORAGE_KEY] || {};

    if (!settings.enable_top) {
      return;
    }

    let ngcount = filterCells(top_total_ranking_cells, settings.ng_circles);

    if(subheading[0] && settings.show_ng_count){
      subheading[0].innerHTML = subheading[0].innerHTML.replace("総合ランキング", `総合ランキング -${ngcount}`)
    }

    Array.from(type_genre_ranking_blocks).forEach((block, index) => {
      ngcount = 0;
      let type_genre_ranking_cells = block.querySelectorAll(".type_genre_ranking li");
      Array.from(type_genre_ranking_cells).forEach((cell) => {
        if(cell.querySelector("ul.genre_ranking_sub")){
          let sub_cells = cell.querySelector("ul.genre_ranking_sub li");
          ngcount += filterCells(sub_cells, settings.ng_circles);
        }else{
          ngcount += filterSingleCell(cell, settings.ng_circles);
        }
      })

      if(subheading[index+1] && settings.show_ng_count){
        subheading[index+1].innerHTML = subheading[index+1].innerHTML
        .replace("マンガ・CG新作ランキング", `マンガ・CG新作ランキング -${ngcount}`)
        .replace("ゲーム・動画新作ランキング", `ゲーム・動画新作ランキング -${ngcount}`)
        .replace("ボイス・ASMR・音楽新作ランキング", `ボイス・ASMR・音楽新作ランキング -${ngcount}`)
      }

    })

    let config = {
      childList: true,
      subtree: true
    };

    let dom = discount_cells;
    let mo = new MutationObserver(function(record, observer) {
      let cells = discount_cells.querySelectorAll("li.swiper-slide");
      if(cells){
        ngcount = filterCells(cells, settings.ng_circles);

        if (settings.show_ng_count) {
          Array.from(titles).forEach((cell) => {
            if(cell.innerHTML && cell.innerHTML.indexOf("割引開始作品") != -1 && settings.show_ng_count){
              cell.innerHTML = cell.innerHTML.replace("割引開始作品", `割引開始作品 -${ngcount}`)
            }
          })
        }
        mo.disconnect();
      }
    });
    mo.observe(dom, config);

    let r_dom = recommend_cells;
    let r_mo = new MutationObserver(function(record, observer) {
      let cells = recommend_cells.querySelectorAll("li.swiper-slide");
      if(cells){
        ngcount = filterCells(cells, settings.ng_circles);

        if (settings.show_ng_count) {
          Array.from(titles).forEach((cell) => {
            if(cell.innerHTML && cell.innerHTML.indexOf("あなたにオススメの同人作品") != -1 && settings.show_ng_count){
              cell.innerHTML = cell.innerHTML.replace("あなたにオススメの同人作品", `あなたにオススメの同人作品 -${ngcount}`)
            }
          })
        }

        r_mo.disconnect();
      }
    });
    r_mo.observe(r_dom, config);

    let new_worklist = document.querySelector("#new_worklist");
    let n_dom = new_worklist;
    let n_mo = new MutationObserver(function(record, observer) {
      let work_blocks = new_worklist.querySelectorAll(".work_block");

      Array.from(work_blocks).forEach((block) => {
        let cells = block.querySelectorAll(".n_worklist_item");
        let check_flag = block.getAttribute("data-filtered");
        if(cells && check_flag != "true"){
          ngcount = filterCells(cells, settings.ng_circles);

          let subheading_cell = block.querySelector(".work_subheading");
          if(subheading_cell.innerHTML && settings.show_ng_count){
            subheading_cell.innerHTML = subheading_cell.innerHTML + `-${ngcount}本`
          }
          block.setAttribute("data-filtered", "true");
        }
      })

    });
    n_mo.observe(n_dom, config);

  });

})();