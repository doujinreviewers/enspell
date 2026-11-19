import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { JSDOM } from 'jsdom';
import { observeTopRankings } from '../src/public/content/top_ranking_filter.js';

// 2026-11-19のトップページから作品情報を除いた、3種類のランキング枠の構造。
const card = (id, kind = 'slide', maker = 'RG12345', marker = '') => {
  const body = `<span class="rank-badge">順位</span><div class="c-mediaBlock">
    <div class="c-mediaBlock__author"><a href="/maniax/circle/profile/=/maker_id/${maker}.html">サークル${maker}</a></div>
    <a class="c-mediaBlock__thumb"><div class="${marker}"></div></a></div>`;
  if (kind === 'slide') return `<div id="${id}" class="keen-slider__slide"><div class="ranking-card">${body}</div></div>`;
  return `<div id="${id}" class="${kind === 'main' ? 'ranking-card ranking-top3__main' : 'ranking-card-horizontal ranking-top3__sub-item'}">${body}</div>`;
};
const category = (id, cards, genre = false) => `<div class="ranking-content-pc__category" id="${id}">
  <div class="headline"><h3 class="headline__title"><a href="#">${id}</a></h3></div>
  ${genre ? `<div class="ranking-top3">${cards}</div>` : `<button>前へ</button><div class="keen-slider">${cards}</div><button>次へ</button>`}
  </div>`;
const root = (blocks) => `<section class="ranking-content-pc" data-section_name="top_recommend">${blocks}</section>`;
const settings = { enable_top: true, ng_circles: [{ id: 'RG12345' }], hide_ng_by_dlsite: true, show_ng_count: true };
const flush = () => new Promise(resolve => setTimeout(resolve, 0));
const setup = (t, html, options = settings) => {
  const dom = new JSDOM(html, { url: 'https://www.dlsite.com/maniax/' });
  const observer = observeTopRankings(dom.window.document, options);
  t.after(() => { observer?.disconnect(); dom.window.close(); });
  return dom.window.document;
};
const countText = (document, id) => document.getElementById(id).querySelector('[data-enspell-top-ranking-count]')?.textContent;

test('総合・3ジャンルの上位と下位をNG判定し、外枠を削除して通常作品と操作部品を維持する', (t) => {
  const genres = ['マンガCG', 'ゲーム動画', 'ボイスASMR音楽'];
  const document = setup(t, root(
    category('総合', card('circle') + card('dlsite', 'slide', 'RG22222', 'c-mediaBlock__filter') + card('normal', 'slide', 'RG33333')) +
    genres.map(id => category(id,
      card(`${id}-main`, 'main') + `<div class="ranking-top3__sub">${card(`${id}-sub`, 'sub', 'RG22222', 'c-mediaBlock__filter')}${card(`${id}-normal`, 'sub', 'RG33333')}</div>`, true)).join('')));
  assert.equal(document.getElementById('circle'), null);
  assert.equal(document.getElementById('dlsite'), null);
  assert.ok(document.getElementById('normal'));
  assert.equal(document.querySelectorAll('.keen-slider__slide').length, 1);
  assert.equal(document.querySelectorAll('button').length, 2);
  for (const id of genres) {
    assert.equal(document.getElementById(`${id}-main`), null);
    assert.equal(document.getElementById(`${id}-sub`), null);
    assert.ok(document.getElementById(`${id}-normal`));
  }
  for (const id of ['総合', ...genres]) {
    assert.equal(countText(document, id), ' -2本');
    assert.equal(document.getElementById(id).querySelector('h3 a').textContent, id);
  }
  assert.equal(document.querySelectorAll('.rank-badge').length, 4);
});

test('ルートの遅延描画、追加作品、後付けNGマーカー、再描画に対応する', async (t) => {
  const document = setup(t, '<main></main>');
  const main = document.querySelector('main');
  main.innerHTML = root(category('総合', ''));
  await flush();
  document.querySelector('.keen-slider').innerHTML = card('late') + card('normal', 'slide', 'RG33333');
  await flush();
  assert.equal(document.getElementById('late'), null);
  const normal = document.getElementById('normal');
  normal.querySelector('.c-mediaBlock__thumb div').className = 'c-mediaBlock__filter';
  await flush();
  assert.equal(normal.isConnected, false);
  assert.equal(countText(document, '総合'), ' -2本');
  document.querySelector('.keen-slider').classList.add('updated');
  await flush();
  assert.equal(countText(document, '総合'), ' -2本');
  assert.equal(document.querySelectorAll('[data-enspell-top-ranking-count]').length, 1);
  main.innerHTML = root(category('総合', card('redrawn')));
  await flush();
  assert.equal(document.getElementById('redrawn'), null);
  assert.equal(countText(document, '総合'), ' -1本');
});

test('サークル情報が後から入ったカードも削除する', async (t) => {
  const document = setup(t, root(category('総合', card('changed', 'slide', 'RG33333'))));
  const cell = document.getElementById('changed');
  cell.querySelector('.c-mediaBlock__author a').href = '/maniax/circle/profile/=/maker_id/RG12345.html';
  await flush();
  assert.equal(cell.isConnected, false);
});

test('トップページ設定と表示NG設定を尊重し、他の欄を削除しない', (t) => {
  const html = root(category('総合', card('circle') + card('ng', 'slide', 'RG22222', 'c-mediaBlock__filter')));
  const disabled = setup(t, html, { ...settings, enable_top: false, enable_ranking: true });
  assert.ok(disabled.getElementById('circle'));
  assert.ok(disabled.getElementById('ng'));
  const enabled = setup(t, html + `<section class="recommended-products-content-pc">${card('outside')}</section>`, {
    enable_top: true, enable_ranking: false, hide_ng_by_dlsite: true,
  });
  assert.ok(enabled.getElementById('circle'));
  assert.equal(enabled.getElementById('ng'), null);
  assert.ok(enabled.getElementById('outside'));
  assert.equal(enabled.querySelector('[data-enspell-top-ranking-count]'), null);
  const noDlsite = setup(t, html, { ...settings, hide_ng_by_dlsite: false });
  assert.equal(noDlsite.getElementById('circle'), null);
  assert.ok(noDlsite.getElementById('ng'));
});

test('トップページの起動処理が現行ランキングを削除し、旧総合ランキングも維持する', async (t) => {
  const dom = new JSDOM(root(category('総合', card('entry'))) +
    '<ul class="_top_total_ranking"><li id="legacy"><div class="maker_name"><a href="/maker_id/RG12345.html">旧サークル</a></div></li></ul>',
    { url: 'https://www.dlsite.com/maniax/' });
  t.after(() => dom.window.close());
  const source = await readFile(new URL('../src/content/toppage.js', import.meta.url), 'utf8');
  const chrome = {
    runtime: { getURL: path => new URL(`../src/public/${path}`, import.meta.url).href },
    storage: { local: { get: (key, callback) => callback({ [key]: settings }) } },
  };
  const run = new Function('chrome', 'document', 'location', 'MutationObserver', 'Element', 'loadModule',
    `return ${source.replaceAll('import(', 'loadModule(')}`);
  const { document, location, MutationObserver, Element } = dom.window;
  await run(chrome, document, location, MutationObserver, Element, url => import(url));
  assert.equal(document.getElementById('entry'), null);
  assert.equal(document.getElementById('legacy'), null);
});
