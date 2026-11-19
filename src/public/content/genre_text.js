import { observeDocument } from './list_filter.js';

const SELECTOR = "a.btn_default, a[href='#'], a[href*='genre/'], #modal_area_genre li > a, ul.select_content > li";
const EXCLUDED = 'script, style, input, textarea, select, [contenteditable]';

export const createGenreReplacer = mapping => {
  const entries = mapping.filter(item => item.ng).slice().sort((a,b) => b.ng.length-a.ng.length);
  if (!entries.length) return text => text;
  const replacements = new Map(entries.map(item => [item.ng, item.ok]));
  const pattern = new RegExp(entries.map(item => item.ng.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'g');
  return text => text.replace(pattern, (match, offset) => {
    const replacement = replacements.get(match);
    // 復元後の語が元の語を含む場合も、二度目以降に増殖させない。
    return text.startsWith(replacement, offset) ? match : replacement;
  });
};

export const observeGenreText = (document, mapping) => {
  const replace = createGenreReplacer(mapping);
  return observeDocument(document, () => {
    for (const element of document.querySelectorAll(SELECTOR)) {
      const walker = document.createTreeWalker(element, document.defaultView.NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) {
        const node = walker.currentNode;
        if (node.parentElement.closest(EXCLUDED)) continue;
        const text = replace(node.data);
        if (text !== node.data) node.data = text;
      }
    }
  });
};
