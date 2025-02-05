(async () => {

  const baseFilterModule = await import(chrome.runtime.getURL('content/base_filter.js'));
  const { filterCells, DLSITE_ENSPELL_STORAGE_KEY } = baseFilterModule;

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
      let page_total = document.querySelector(".page_total");
      if(page_total){
        page_total.innerHTML = page_total.innerHTML + `<strong>-${ngcount}</strong>件`
      }
    }

    let works_type_ranking = document.querySelector("#_works_type_ranking");

    if(works_type_ranking){
      let works_type_rankings = works_type_ranking.querySelectorAll("li.swiper-slide");
      ngcount = filterCells(works_type_rankings, settings.ng_circles);
      if (settings.show_ng_count) {
        if(works_type_ranking.innerHTML && works_type_ranking.innerHTML.indexOf("人気ランキング (24時間)") != -1){
          works_type_ranking.innerHTML = works_type_ranking.innerHTML.replace("人気ランキング (24時間)", `人気ランキング (24時間) -${ngcount}`)
        }
      }
    }

  });

})();