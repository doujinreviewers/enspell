import { filterCells } from './base_filter.js';

const ROOT_SELECTOR = '#new_worklist, [data-section_name="new_product"]';

// 新旧の新着欄を初期表示時と動的更新後に処理する。
export const observeNewWorks = (document, settings) => {
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
        const category = [...root.querySelectorAll('.new-product-filter .is-active, .display_filter .active')]
          .map((element) => element.textContent).join('|');
        const blockSelector = '.new-product-section, .work_block, .n_work_list_container';
        const blocks = [...root.querySelectorAll(blockSelector)].filter(block => {
          const outer = block.parentElement?.closest(blockSelector);
          return !outer || !root.contains(outer);
        });
        for (const block of blocks) {
          const heading = block.querySelector('.headline__title, .work_subheading');
          const title = heading?.cloneNode(true);
          title?.querySelector('[data-enspell-new-work-count]')?.remove();
          const signature = `${category}|${title?.textContent || ''}`;
          const previous = counts.get(block);
          const removed = filterCells(
            block.querySelectorAll('.new-product-section__item, .n_worklist_item, .push_list > li'),
            settings.ng_circles, false, settings.hide_ng_by_dlsite,
          );
          const count = (previous?.signature === signature ? previous.count : 0) + removed;
          counts.set(block, { signature, count });
          if (!heading) continue;
          let counter = heading.querySelector('[data-enspell-new-work-count]');
          if (settings.show_ng_count && count > 0) {
            if (!counter) {
              counter = document.createElement('span');
              counter.setAttribute('data-enspell-new-work-count', '');
              heading.append(counter);
            }
            const text = ` -${count}本`;
            if (counter.textContent !== text) counter.textContent = text;
          } else {
            counter?.remove();
          }
        }
      }
    } finally {
      observer.observe(document.body, config);
    }
  };

  const observer = new document.defaultView.MutationObserver((records) => {
    // 新着欄以外のアニメーションや表示変更では再走査しない。
    if (records.some((record) => {
      const target = record.target.nodeType === 1 ? record.target : record.target.parentElement;
      return target?.closest(ROOT_SELECTOR) || [...record.addedNodes].some((node) =>
        node.nodeType === 1 && (node.matches(ROOT_SELECTOR) || node.querySelector(ROOT_SELECTOR)));
    })) update();
  });

  update();
  return observer;
};
