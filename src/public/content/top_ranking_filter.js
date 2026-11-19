import { filterCells } from './base_filter.js';

const ROOT_SELECTOR = '.ranking-content-pc';
const CELL_SELECTOR = '.keen-slider__slide, .ranking-top3__main, .ranking-top3__sub-item';

// 現行トップの総合・ジャンル別ランキング。順位バッジと外枠も作品ごと削除する。
export const observeTopRankings = (document, settings) => {
  if (!settings.enable_top || !document.body) return;

  const counts = new WeakMap();
  const config = {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class', 'href'],
    characterData: true,
  };

  const update = () => {
    observer.disconnect();
    try {
      for (const root of document.querySelectorAll(ROOT_SELECTOR)) {
        for (const block of root.querySelectorAll('.ranking-content-pc__category')) {
          const removed = filterCells(
            block.querySelectorAll(CELL_SELECTOR),
            settings.ng_circles, false, settings.hide_ng_by_dlsite,
          );
          const count = (counts.get(block) || 0) + removed;
          counts.set(block, count);

          const heading = block.querySelector('.headline__title');
          if (!heading || !settings.show_ng_count || count === 0) continue;
          let counter = heading.querySelector('[data-enspell-top-ranking-count]');
          if (!counter) {
            counter = document.createElement('span');
            counter.setAttribute('data-enspell-top-ranking-count', '');
            heading.append(counter);
          }
          const text = ` -${count}本`;
          if (counter.textContent !== text) counter.textContent = text;
        }
      }
    } finally {
      observer.observe(document.body, config);
    }
  };

  const observer = new document.defaultView.MutationObserver((records) => {
    // スライダーのstyle更新や、ランキング外の変更による不要な再走査を避ける。
    if (records.some((record) => {
      const target = record.target.nodeType === 1 ? record.target : record.target.parentElement;
      return target?.closest(ROOT_SELECTOR) || [...record.addedNodes].some((node) =>
        node.nodeType === 1 && (node.matches(ROOT_SELECTOR) || node.querySelector(ROOT_SELECTOR)));
    })) update();
  });

  update();
  return observer;
};
