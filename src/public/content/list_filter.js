import { filterCells } from './base_filter.js';

// 自分自身の削除・件数表示で再実行を繰り返さず、後付けのNG判定にも追従する。
export const observeDocument = (document, update) => {
  const observer = new document.defaultView.MutationObserver(run);
  function run() {
    observer.disconnect();
    try { update(); } finally {
      observer.observe(document.body, {
        childList: true, subtree: true, characterData: true,
        attributes: true, attributeFilter: ['class', 'href'],
      });
    }
  }
  run();
  return observer;
};

export const observeFilteredBlocks = (document, settings, specs, isReviewer = false) => {
  const totals = specs.map(() => new WeakMap());
  return observeDocument(document, () => {
    specs.forEach((spec, index) => {
      for (const root of document.querySelectorAll(spec.root)) {
        const cells = root.querySelectorAll(spec.cells);
        const ngList = isReviewer ? settings.ng_reviewers : settings.ng_circles;
        const showCount = isReviewer ? settings.show_reviewer_ng_count : settings.show_ng_count;
        let count;
        if (spec.countCurrentResults && showCount) {
          const markers = totals[index].get(root) || new Set();
          // 削除位置のコメントは一覧の差し替えと一緒に消える。
          // URL・タグ・見出しの更新順に依存せず、現在の結果だけを集計する。
          for (const marker of markers) {
            if (!root.contains(marker)) markers.delete(marker);
          }
          for (const cell of cells) {
            const parent = cell.parentNode;
            const next = cell.nextSibling;
            if (filterCells([cell], ngList, isReviewer, !isReviewer && settings.hide_ng_by_dlsite)) {
              // 作品のDOMは保持せず、レイアウトに影響しない空のコメントだけを置く。
              const marker = document.createComment('enspell-filtered');
              parent.insertBefore(marker, next);
              markers.add(marker);
            }
          }
          count = markers.size;
          totals[index].set(root, markers);
        } else {
          const removed = filterCells(cells, ngList, isReviewer, !isReviewer && settings.hide_ng_by_dlsite);
          count = (totals[index].get(root) || 0) + removed;
          totals[index].set(root, count);
        }
        const heading = typeof spec.heading === 'function' ? spec.heading(root) : root.querySelector(spec.heading);
        if (!heading) continue;
        let counter = heading.querySelector('[data-enspell-filter-count]');
        if (!showCount || !count) {
          counter?.remove();
          continue;
        }
        if (!counter) {
          counter = document.createElement('span');
          counter.setAttribute('data-enspell-filter-count', '');
          heading.append(counter);
        }
        const text = ` -${count}件`;
        if (counter.textContent !== text) counter.textContent = text;
      }
    });
  });
};

export const observeRecommendations = (document, settings) => observeFilteredBlocks(document, settings, [
  { root: '.recommended-products-content-pc', cells: '.keen-slider__slide', heading: '.headline__title' },
  {
    root: '.recommend_list.type_top', cells: 'li.swiper-slide',
    heading: root => [...document.querySelectorAll('.title_01.with_work_push')].find(heading =>
      heading.textContent.includes(root.className.includes('_discount') ? '割引開始作品' : 'あなたにオススメの同人作品')),
  },
]);
