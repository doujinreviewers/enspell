import { observeDocument } from './list_filter.js';

const integer = text => {
  const digits = text?.replace(/[\s,]/g, '');
  if (!digits || !/^\d+$/.test(digits)) return null;
  const value = Number(digits);
  return Number.isSafeInteger(value) ? value : null;
};
const yen = node => {
  if (!node) return null;
  const suffix = node.querySelector('.app-price_suffix');
  if (suffix && suffix.textContent.trim() !== '円') return null;
  return integer(node.querySelector('.app-price_base')?.textContent || node.textContent.replace(/円\s*$/, ''));
};

export const readEstimate = document => {
  let count, price, normal, target;
  const stats = document.querySelector('.c-productStatsPc');
  if (stats) {
    const row = [...stats.querySelectorAll('.c-productStatsItemPc')].find(row =>
      /^販売数\s*[:：]?$/.test(row.querySelector('dt')?.textContent.trim() || ''));
    count = integer(row?.querySelector('.c-productStatsPc__strong')?.textContent);
    const prices = document.querySelector('.c-purchaseBox__priceInfo');
    price = yen(prices?.querySelector('.app-price:not(.app-price_strike)'));
    normal = yen(prices?.querySelector('.app-price_strike')) ?? price;
    target = stats;
  } else {
    count = integer(document.querySelector('.work_right_info_title.value > .point')?.textContent);
    price = yen(document.querySelector('#work_price [itemprop="offers"] .price'));
    normal = yen(document.querySelector('#work_price .work_buy_content')) ?? price;
    target = document.querySelector('#work_right .work_right_info');
  }
  if (!target || count == null || price == null || normal == null || normal < price) return null;
  const min = count * price, max = count * normal;
  if (!Number.isSafeInteger(min) || !Number.isSafeInteger(max)) return null;
  return { target, min, max };
};

export const formatYen = (value, format) => {
  if (format !== '12万3456円') return `${value.toLocaleString('ja-JP')}円`;
  let number = BigInt(value), parts = [], index = 0;
  const units = ['', '万', '億', '兆'];
  do {
    const group = number % 10000n;
    if (group) parts.unshift(`${group}${units[index]}`);
    number /= 10000n;
    index++;
  } while (number);
  return `${parts.join('') || '0'}円`;
};

export const observeEstimate = (document, settings) => {
  if (!settings.show_estimate) return;
  return observeDocument(document, () => {
    const result = readEstimate(document);
    let output = document.querySelector('[data-enspell-estimate]');
    if (!result) { output?.remove(); return; }
    if (output && !result.target.contains(output)) { output.remove(); output = null; }
    if (!output) {
      output = document.createElement('div');
      output.setAttribute('data-enspell-estimate', '');
      output.className = 'work_right_info_item';
      result.target.append(output);
    }
    output.classList.toggle('gold', settings.estimate_text_design === 'ゴールドのテキスト');
    const text = `推定売上額：${formatYen(result.min, settings.estimate_format)} ～ ${formatYen(result.max, settings.estimate_format)}`;
    if (output.textContent !== text) output.textContent = text;
  });
};
