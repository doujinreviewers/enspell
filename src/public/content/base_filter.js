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
  const makerLink = cell.querySelector(".maker_name a") ||
    cell.querySelector('.c-mediaBlock__author > a[href*="/maker_id/"]');
  if (makerLink?.href.includes('/keyword_creater/')) return { id: '', name: '' };
  const makerId = makerLink?.href.match(/(?:RG|VG|BG|AJ)\d+/)?.[0] || '';

  return {
    id: makerId,
    name: makerLink?.textContent.trim() || ''
  };
};

// サークル・メーカー・出版社・著者を照合する。声優の検索リンクは対象にしない。
export const getMakerCandidates = cell => {
  const first = getMakerIdAndName(cell);
  const candidates = first.id || first.name ? [first] : [];
  for (const link of cell.querySelectorAll?.('a[href*="/maker_id/"], a[href*="/author_id/"]') || []) {
    const id = link.href.match(/\/(?:maker_id|author_id)\/((?:RG|VG|BG|AJ)\d+)(?:[/.?#]|$)/)?.[1];
    if (id) candidates.push({ id, name: link.textContent.trim() });
  }
  for (const data of cell.querySelectorAll?.('[data-maker_id]') || []) {
    const id = data.getAttribute('data-maker_id');
    if (/^(?:RG|VG|BG)\d+$/.test(id || '')) candidates.push({ id, name: '' });
  }
  for (const input of cell.querySelectorAll?.('input.__product_attributes') || []) {
    const id = input.value.split(',')[0];
    if (/^(?:RG|VG|BG)\d+$/.test(id)) candidates.push({ id, name: '' });
  }
  const cards = cell.matches?.('.productCard') ? [cell] : cell.querySelectorAll?.('.productCard') || [];
  for (const card of cards) {
    try {
      const info = JSON.parse(card.getAttribute('data-enspell-product') || 'null');
      const id = card.querySelector('a[href*="/product_id/"]')?.href.match(/\/product_id\/((?:RJ|BJ|VJ)\d+)/)?.[1];
      if (info?.id !== id || !Array.isArray(info?.makers)) continue;
      for (const maker of info.makers) {
        if (/^(?:RG|VG|BG|AJ)\d+$/.test(maker.id || '') && typeof maker.name === 'string') candidates.push(maker);
      }
    } catch { /* ページ側の壊れた補助情報ではフィルターを止めない。 */ }
  }
  return candidates;
};

export const getVoiceActorNames = cell => {
  const pathname = cell.ownerDocument?.location?.pathname || '';
  if (!/^\/garumani\/voice\/?$/.test(pathname)) return [];
  const cards = cell.matches?.('.productCard') ? [cell] : cell.querySelectorAll?.('.productCard') || [];
  const names = new Set();
  for (const card of cards) {
    const raw = card.getAttribute('data-enspell-product');
    if (raw) {
      try {
        const info = JSON.parse(raw);
        const id = card.querySelector('a[href*="/product_id/"]')?.href.match(/\/product_id\/((?:RJ|BJ|VJ)\d+)/)?.[1];
        // 再利用中のカードでは、旧商品の声優名を表示側から拾い直すことも避ける。
        if (!id || info?.id !== id) continue;
        if (Array.isArray(info.voiceActors)) {
          for (const name of info.voiceActors) {
            if (typeof name === 'string' && name.trim()) names.add(name.trim());
          }
          // 公開データの一覧を正とし、再描画途中に残った旧表示名は混ぜない。
          continue;
        }
      } catch { continue; }
    }
    for (const link of card.querySelectorAll('.voiceActors .voiceActor a')) {
      if (link.textContent.trim()) names.add(link.textContent.trim());
    }
  }
  return [...names];
};

const matchesNg = (cell, ngList, isReviewer) => {
  const candidates = isReviewer ? [getReviewerIdAndName(cell)] : getMakerCandidates(cell);
  if (candidates.some(({ id, name }) => judge(ngList, id) || judge(ngList, name))) return true;
  if (isReviewer) return false;
  const voiceNames = getVoiceActorNames(cell);
  return ngList.some(target => typeof target?.name === 'string' && voiceNames.includes(target.name.trim()));
};

export const getReviewerIdAndName = (cell) => {
  const link = cell.querySelector('.reveiw_author_item a, .c-review__writer a');
  return {
    id: link?.href.match(/REV\d+/)?.[0] || '',
    name: link?.textContent.trim() || ''
  };
};

export const isDlsiteNgCell = (cell) => {
  return !!(
    cell.matches?.('._filter, ._censored, .shouldFilter, .c-mediaBlock__filter, .thumbnail-filter') ||
    cell.querySelector('._filter, ._censored, .shouldFilter, .c-mediaBlock__filter, .thumbnail-filter')
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

    if (matchesNg(cell, ng_list, isReviewer)) {
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

  if (matchesNg(cell, ng_list, isReviewer)) {
    cell.remove();
    return 1;
  }
  return 0;
};
