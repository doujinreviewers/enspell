export const DLSITE_ENSPELL_STORAGE_KEY = 'dlsite_enspell_options';

export const judge = (ng_arr, id_or_name) => {
  return ng_arr.some((ng_target) => {
    return ng_target.id == id_or_name || ng_target.name == id_or_name;
  });
};

export const getMakerIdAndName = (cell) => {
  return {
    id: cell.querySelector(".maker_name a").href.match(/RG\d*/)[0],
    name: cell.querySelector(".maker_name a").textContent.trim()
  };
};

export const getReviewerIdAndName = (cell) => {
  return {
    id: cell.querySelector(".reveiw_author_item a").href.match(/REV\d*/)[0],
    name: cell.querySelector(".reveiw_author_item a").textContent.trim()
  };
}

/**
 * 指定されたセル群から条件に一致するセルを削除し、削除件数を返す
 * @param {NodeList|Array} cells - 対象となるセルの集合
 * @param {Object} ng_list - `ng_circles`か`ng_reviewers`
 * @param {Boolean} isReviewer - `ng_circles`ならfalse、`ng_reviewers`ならtrue
 * @returns {number} 削除件数
 */
export const filterCells = (cells, ng_list, isReviewer = false) => {
  let ngcount = 0;
  Array.from(cells).forEach((cell) => {
    let { id, name } = isReviewer ? getReviewerIdAndName(cell) : getMakerIdAndName(cell);

    if (judge(ng_list, id) || judge(ng_list, name)) {
      cell.remove();
      ngcount++;
    }
  });
  return ngcount;
};

export const filterReviewCells = (cells, ng_list) => {
  return filterCells(cells, ng_list, true);
};

export const filterSingleCell = (cell, ng_list, isReviewer = false) => {
  let { id, name } = isReviewer ? getReviewerIdAndName(cell) : getMakerIdAndName(cell);

  if (judge(ng_list, id) || judge(ng_list, name)) {
    cell.remove();
    return 1;
  }
  return 0;
};