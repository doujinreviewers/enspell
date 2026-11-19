(async () => {

  if (!/^\/[^/]+\/?$/.test(location.pathname)){
    return;
  }

  const baseFilterModule = await import(chrome.runtime.getURL('content/base_filter.js'));
  const { filterCells, filterSingleCell, DLSITE_ENSPELL_STORAGE_KEY } = baseFilterModule;
  const { observeNewWorks } = await import(chrome.runtime.getURL('content/new_work_filter.js'));
  const { observeTopRankings, waitForTopPageReady } = await import(chrome.runtime.getURL('content/top_ranking_filter.js'));

  const { observeRecommendations } = await import(chrome.runtime.getURL('content/list_filter.js'));

  await waitForTopPageReady(document);

  let top_total_ranking_cells = document.querySelectorAll("._top_total_ranking li");
  let type_genre_ranking_blocks = document.querySelectorAll(".work_push.type_genre_ranking");
  let subheading = document.querySelectorAll("[data-section_name=top_recommend] h3.work_subheading");

  chrome.storage.local.get(DLSITE_ENSPELL_STORAGE_KEY, (data)=>{
    let settings = data[DLSITE_ENSPELL_STORAGE_KEY] || {};

    if (!settings.enable_top) {
      return;
    }

    observeNewWorks(document, settings);
    observeTopRankings(document, settings);
    observeRecommendations(document, settings);

    let ngcount = filterCells(top_total_ranking_cells, settings.ng_circles, false, settings.hide_ng_by_dlsite);

    if(subheading[0] && settings.show_ng_count){
      subheading[0].innerHTML = subheading[0].innerHTML.replace("総合ランキング", `総合ランキング -${ngcount}`)
    }

    Array.from(type_genre_ranking_blocks).forEach((block, index) => {
      ngcount = 0;
      let type_genre_ranking_cells = block.querySelectorAll(".type_genre_ranking li");
      Array.from(type_genre_ranking_cells).forEach((cell) => {
        if(cell.querySelector("ul.genre_ranking_sub")){
          let sub_cells = cell.querySelector("ul.genre_ranking_sub li");
          ngcount += filterCells(sub_cells, settings.ng_circles, false, settings.hide_ng_by_dlsite);
        }else{
          ngcount += filterSingleCell(cell, settings.ng_circles, false, settings.hide_ng_by_dlsite);
        }
      })

      if(subheading[index+1] && settings.show_ng_count){
        subheading[index+1].innerHTML = subheading[index+1].innerHTML
        .replace("マンガ・CG新作ランキング", `マンガ・CG新作ランキング -${ngcount}`)
        .replace("ゲーム・動画新作ランキング", `ゲーム・動画新作ランキング -${ngcount}`)
        .replace("ボイス・ASMR・音楽新作ランキング", `ボイス・ASMR・音楽新作ランキング -${ngcount}`)
      }

    })

  });

})();
