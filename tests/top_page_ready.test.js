import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { JSDOM } from 'jsdom';
import { waitForTopPageReady } from '../src/public/content/top_ranking_filter.js';

const readySource = await readFile(new URL('../src/content/top_page_ready.js', import.meta.url), 'utf8');
const topSource = await readFile(new URL('../src/content/toppage.js', import.meta.url), 'utf8');
const signal = 'data-enspell-top-ready';
const flush = () => new Promise(resolve => setTimeout(resolve, 0));
const createDOM = (t, html = '<div id="__nuxt"></div>', url = 'https://www.dlsite.com/maniax/') => {
  const dom = new JSDOM(html, { url, runScripts: 'outside-only' });
  t.after(() => dom.window.close());
  return dom;
};
const runTop = (window) => {
  const chrome = {
    runtime: { getURL: path => new URL(`../src/public/${path}`, import.meta.url).href },
    storage: { local: { get: (key, callback) => callback({ [key]: {
      enable_top: true, ng_circles: [{ id: 'RG1' }], show_ng_count: true,
    } }) } },
  };
  const run = new Function('chrome', 'document', 'location', 'MutationObserver', 'Element', 'loadModule',
    `return ${topSource.replaceAll('import(', 'loadModule(')}`);
  return run(chrome, window.document, window.location, window.MutationObserver, window.Element, url => import(url));
};

test('hydrationが終わるまでランキングを削除せず、完了後も2位・3位の王冠と作品リンクを保つ', async (t) => {
  const cards = [1, 2, 3].map(rank => `<div class="ranking-card ranking-top3__main" id="rank${rank}">
    <span class="rank-badge rank-badge--${rank}"><span class="c-icon c-icon--ranking0${rank} rank-badge__crown" role="img" aria-label="${rank}位"></span></span>
    <div data-workno="RJ${rank}"><a class="product-link" href="/maniax/work/=/product_id/RJ${rank}.html">作品${rank}</a>
    <div class="c-mediaBlock__author"><a href="/maker_id/RG${rank}.html">サークル${rank}</a></div></div></div>`).join('');
  const dom = createDOM(t, `<div id="__nuxt"><section class="ranking-content-pc">
    <div class="ranking-content-pc__category"><h3 class="headline__title">ジャンル別ランキング</h3>
    <div class="ranking-top3">${cards}</div></div></section></div>`);
  const { document } = dom.window;
  let onHydrated;
  const app = { isHydrating: true, hooks: { hookOnce: (event, callback) => {
    assert.equal(event, 'app:suspense:resolve');
    onHydrated = callback;
  } } };
  dom.window.useNuxtApp = () => app;
  dom.window.eval(readySource);
  let completed = false;
  const running = runTop(dom.window).then(() => { completed = true; });
  dom.window.dispatchEvent(new dom.window.Event('load'));
  await flush();
  assert.equal(completed, false);
  assert.equal(document.querySelectorAll('.ranking-top3__main').length, 3);
  assert.equal(document.querySelector('[data-enspell-top-ranking-count]'), null);
  assert.equal(document.documentElement.hasAttribute(signal), false);

  const second = document.getElementById('rank2');
  const third = document.getElementById('rank3');
  app.isHydrating = false;
  onHydrated();
  await running;
  assert.equal(document.getElementById('rank1'), null);
  assert.equal(document.querySelectorAll('.ranking-top3__main').length, 2);
  for (const [rank, card] of [[2, second], [3, third]]) {
    assert.equal(document.getElementById(`rank${rank}`), card);
    assert.equal(card.querySelector('.rank-badge').className, `rank-badge rank-badge--${rank}`);
    const crown = card.querySelector('.rank-badge__crown');
    assert.ok(crown.classList.contains(`c-icon--ranking0${rank}`));
    assert.equal(crown.getAttribute('aria-label'), `${rank}位`);
    assert.equal(card.querySelector('[data-workno]').dataset.workno, `RJ${rank}`);
    assert.ok(card.querySelector('.product-link').href.endsWith(`/RJ${rank}.html`));
  }
});

test('完了通知が先に届いていても待ち続けず、描画完了済みのページでは即時通知する', async (t) => {
  const dom = createDOM(t);
  dom.window.useNuxtApp = () => ({ isHydrating: false });
  dom.window.eval(readySource);
  assert.equal(dom.window.document.documentElement.hasAttribute(signal), true);
  await waitForTopPageReady(dom.window.document);
});

test('Nuxtの初期化前は通知せず、取得可能になった後に完了を待つ', (t) => {
  const dom = createDOM(t);
  let retry;
  dom.window.setTimeout = callback => { retry = callback; };
  dom.window.useNuxtApp = () => { throw new Error('初期化前'); };
  dom.window.eval(readySource);
  assert.equal(dom.window.document.documentElement.hasAttribute(signal), false);
  assert.equal(typeof retry, 'function');
  dom.window.useNuxtApp = () => ({ isHydrating: false });
  retry();
  assert.equal(dom.window.document.documentElement.hasAttribute(signal), true);
});

test('Nuxtを使わない旧ページは待たず、トップ以外には通知しない', async (t) => {
  const legacy = createDOM(t, '<main></main>');
  await waitForTopPageReady(legacy.window.document);
  legacy.window.eval(readySource);
  assert.equal(legacy.window.document.documentElement.hasAttribute(signal), true);
  const search = createDOM(t, '<main></main>', 'https://www.dlsite.com/maniax/fsr/=/keyword/test/');
  search.window.eval(readySource);
  assert.equal(search.window.document.documentElement.hasAttribute(signal), false);
});

test('完了通知だけをMAIN worldで実行し、作品操作と設定取得はisolated worldに保つ', async () => {
  const manifest = JSON.parse(await readFile(new URL('../src/public/manifest.json', import.meta.url), 'utf8'));
  const bridge = manifest.content_scripts.find(script => script.js.includes('content/top_page_ready.js'));
  const filter = manifest.content_scripts.find(script => script.js.includes('content/toppage.js'));
  assert.equal(bridge.world, 'MAIN');
  assert.equal(bridge.run_at, 'document_end');
  assert.deepEqual(bridge.matches, filter.matches);
  assert.ok(filter.world === undefined || filter.world === 'ISOLATED');
});
