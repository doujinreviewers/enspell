export const DLSITE_ENSPELL_STORAGE_KEY = 'dlsite_enspell_options';

export const judge = (ng_arr, id_or_name) => {
  if (!Array.isArray(ng_arr) || !id_or_name) {
    return false;
  }

  return ng_arr.some((ng_target) => {
    if (!ng_target) {
      return false;
    }

    return ng_target.id == id_or_name || ng_target.name == id_or_name;
  });
};

export const getMakerIdAndName = (cell) => {
  const makerLink = cell.querySelector(".maker_name a");
  const makerId = makerLink?.href.match(/(RG|AJ)\d+/)?.[0] || '';

  return {
    id: makerId,
    name: makerLink?.textContent.trim() || ''
  };
};

export const getReviewerIdAndName = (cell) => {
  return {
    id: cell.querySelector(".reveiw_author_item a").href.match(/REV\d+/)[0],
    name: cell.querySelector(".reveiw_author_item a").textContent.trim()
  };
};

export const isDlsiteNgCell = (cell) => {
  return !!(
    cell.matches?.('._filter, ._censored, .shouldFilter') ||
    cell.querySelector('._filter, ._censored, .shouldFilter')
  );
};

/**
 * 指定されたセル群から条件に一致するセルを削除し、削除件数を返す
 * @param {NodeList|Array} cells - 対象となるセルの集合
 * @param {Object} ng_list - `ng_circles`か`ng_reviewers`
 * @param {Boolean} isReviewer - `ng_circles`ならfalse、`ng_reviewers`ならtrue
 * @returns {number} 削除件数
 */
export const filterCells = (cells, ng_list, isReviewer = false, hideDlsiteNg = false) => {
  let ngcount = 0;
  Array.from(cells).forEach((cell) => {
    if (hideDlsiteNg && isDlsiteNgCell(cell)) {
      cell.remove();
      ngcount++;
      return;
    }

    if (!Array.isArray(ng_list) || ng_list.length === 0) {
      return;
    }

    let { id, name } = isReviewer ? getReviewerIdAndName(cell) : getMakerIdAndName(cell);

    if (
      judge(ng_list, id) ||
      judge(ng_list, name)
    ) {
      cell.remove();
      ngcount++;
    }
  });
  return ngcount;
};

export const filterReviewCells = (cells, ng_list) => {
  return filterCells(cells, ng_list, true);
};

export const filterSingleCell = (cell, ng_list, isReviewer = false, hideDlsiteNg = false) => {
  if (hideDlsiteNg && isDlsiteNgCell(cell)) {
    cell.remove();
    return 1;
  }

  if (!Array.isArray(ng_list) || ng_list.length === 0) {
    return 0;
  }

  let { id, name } = isReviewer ? getReviewerIdAndName(cell) : getMakerIdAndName(cell);

  if (judge(ng_list, id) || judge(ng_list, name)) {
    cell.remove();
    return 1;
  }
  return 0;
};
