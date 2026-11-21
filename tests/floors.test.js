import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { JSDOM } from 'jsdom';
import { FLOOR_NAMES, isFloorTop } from '../src/public/content/floors.js';
import { filterCells, getMakerCandidates } from '../src/public/content/base_filter.js';

const topSource = await readFile(new URL('../src/content/toppage.js', import.meta.url), 'utf8');
const readySource = await readFile(new URL('../src/content/top_page_ready.js', import.meta.url), 'utf8');
const flush = () => new Promise(resolve => setTimeout(resolve, 0));
const settings = { enable_top: true, ng_circles: [{ id: 'RG1' }], hide_ng_by_dlsite: true, show_ng_count: true };
const maker = (id = 'RG1', name = 'サークル') => `<div class="maker_name"><a href="/maker_id/${id}.html">${name}</a></div>`;
const setup = (t, html, floor = 'girls') => {
  const dom = new JSDOM(html, { url: `https://www.dlsite.com/${floor}/`, runScripts: 'outside-only' });
  t.after(() => dom.window.close());
  return dom;
};
const runTop = (dom, options = settings) => {
  const chrome = {
    runtime: { getURL: p => new URL(`../src/public/${p}`, import.meta.url).href },
    storage: { local: { get: (key, callback) => callback({ [key]: options }) } },
  };
  const run = new Function('chrome', 'document', 'location', 'loadModule', `return ${topSource.replaceAll('import(', 'loadModule(')}`);
  return run(chrome, dom.window.document, dom.window.location, url => import(url));
};

test('DLsite内10フロアとgarumani/voiceをトップと判定し、一覧・外部移転入口を除外する', () => {
  assert.equal(Object.keys(FLOOR_NAMES).length, 10);
  for (const floor of Object.keys(FLOOR_NAMES)) {
    assert.equal(isFloorTop(`/${floor}/`), true);
    assert.equal(isFloorTop(`/${floor}/index.html`), true);
    assert.equal(isFloorTop(`/${floor}/fsr/=/genre/1/`), false);
    assert.equal(isFloorTop(`/${floor}/ranking/day`), false);
  }
  assert.equal(isFloorTop('/garumani/voice/'), true);
  for (const path of ['/comic/', '/index.html', '/maniax-touch/', '/garumani/voice/anything', '/mypage/']) assert.equal(isFloorTop(path), false);
});

test('RG/VG/BG/AJと複数著者・表示されない出版社IDを照合し、声優名は混同しない', t => {
  const dom = setup(t, '<main></main>'), d = dom.window.document;
  for (const id of ['RG1', 'VG1', 'BG1', 'AJ1']) {
    d.querySelector('main').innerHTML = `<article>${maker(id)}</article>`;
    assert.equal(filterCells(d.querySelectorAll('article'), [{ id }]), 1);
  }
  d.querySelector('main').innerHTML = `<article><div data-maker_id="BG2"></div><div class="maker_name"><a href="/author/=/author_id/AJ2">著者A</a><a href="/author/=/author_id/AJ3">著者B</a><span class="author"><a href="/fsr/=/keyword_creater/voice/">声優</a></span></div></article>`;
  const card = d.querySelector('article');
  assert.equal(filterCells([card], [{ name: '声優' }]), 0);
  assert.ok(getMakerCandidates(card).some(m => m.id === 'BG2'));
  assert.equal(filterCells([card], [{ id: 'AJ3' }]), 1);
  d.querySelector('main').innerHTML = '<article><input class="__product_attributes" value="BG4,adl,MNG"><div class="maker_name"><a href="/author/=/author_id/AJ4">著者</a></div></article>';
  assert.equal(filterCells(d.querySelectorAll('article'), [{ id: 'BG4' }]), 1);
});

for (const floor of ['girls', 'bl']) test(`${floor}: 遅延生成される新着の日付グループと追加表示を削除する`, async t => {
  const dom = setup(t, '<main id="main_inner"><div data-vue-component="new-product-section"></div></main>', floor), d = dom.window.document;
  await runTop(dom);
  d.querySelector('main').innerHTML = `<div id="new_worklist" data-section_name="new_product"><div class="display_filter"><span class="active">すべて</span></div>
    <div class="n_work_list_container"><h3 class="work_subheading">新着<span class="work_update_count">2本</span></h3>
    <div class="n_worklist type_2col"><div class="n_worklist_item" id="ng">${maker()}</div><div class="n_worklist_item" id="normal">${maker('RG2')}</div></div></div></div>`;
  await flush();
  assert.equal(d.getElementById('ng'), null);
  assert.ok(d.getElementById('normal'));
  assert.equal(d.querySelector('[data-enspell-new-work-count]').textContent, ' -1本');
  d.querySelector('.n_worklist').insertAdjacentHTML('beforeend', `<div class="n_worklist_item" id="late">${maker()}</div>`);
  await flush();
  assert.equal(d.getElementById('late'), null);
  assert.equal(d.querySelector('[data-enspell-new-work-count]').textContent, ' -2本');
  d.getElementById('normal').classList.add('shouldFilter');
  await flush();
  assert.equal(d.getElementById('normal'), null);
});

for (const floor of ['soft', 'pro', 'app', 'appx', 'books', 'home', 'maniax']) test(`${floor}: 各トップ形式で設定ON/OFFとメーカーNGを適用する`, async t => {
  const id = ['soft', 'pro'].includes(floor) ? 'VG1' : floor === 'books' ? 'BG1' : 'RG1';
  const modern = ['home', 'maniax'].includes(floor);
  const cards = floor === 'books' ? `<ul class="push_list"><li id="ng"><div data-maker_id="BG1"></div>${maker('AJ1')}</li><li id="normal">${maker('AJ2')}</li></ul>`
    : `<div class="${modern ? 'new-product-section__item' : 'n_worklist_item'}" id="ng">${maker(id)}</div><div class="${modern ? 'new-product-section__item' : 'n_worklist_item'}" id="normal">${maker('RG2')}</div>`;
  const html = modern ? `<section data-section_name="new_product"><section class="new-product-section"><h3 class="headline__title">新着</h3>${cards}</section></section>`
    : `<div id="new_worklist"><div class="work_block"><h3 class="work_subheading">新着</h3><div class="n_work_list_container">${cards}</div></div></div>`;
  for (const enabled of [true, false]) {
    const dom = setup(t, html, floor), d = dom.window.document;
    await runTop(dom, { ...settings, enable_top: enabled, ng_circles: [{ id }] });
    assert.equal(d.getElementById('ng') === null, enabled);
    assert.ok(d.getElementById('normal'));
    if (enabled) assert.equal(d.querySelector('[data-enspell-new-work-count]').textContent, ' -1本');
  }
});

test('旧ジャンルランキングの下位作品は個別に削除し、同じ列の通常作品と順位を残す', async t => {
  const dom = setup(t, `<h3 class="work_subheading"><a>ジャンルランキング</a></h3><div class="work_push type_genre_ranking"><ul class="genre_ranking">
    <li class="genre_ranking_item" id="top">${maker()}</li><li class="genre_ranking_item"><ul class="genre_ranking_sub">
    <li class="genre_ranking_sub_item" id="sub">${maker()}</li><li class="genre_ranking_sub_item" id="keep"><b>5位</b>${maker('RG2')}</li></ul></li></ul></div>`);
  const d = dom.window.document;
  await runTop(dom);
  assert.equal(d.getElementById('top'), null);
  assert.equal(d.getElementById('sub'), null);
  assert.ok(d.getElementById('keep'));
  assert.equal(d.querySelector('#keep b').textContent, '5位');
  assert.equal(d.querySelector('[data-enspell-filter-count]').textContent, ' -2件');
});

test('がるまにボイスの非表示サークル情報を公開payloadから付記し、描画後にカードを削除する', async t => {
  const dom = setup(t, '<div id="__nuxt"><div class="product-contents"><section data-ga4-ref="new_arrivals"><h2 class="c-heading new-products-heading">新着</h2><div class="new-product-list"></div></section></div></div>', 'garumani/voice');
  const d = dom.window.document;
  const product = { id: 'RJ1', maker: { id: 'RG1', name: 'サークル', extra: '渡さない' }, userPrivate: '渡さない' };
  const data = { newProducts: [product] };
  data.circular = data;
  dom.window.useNuxtApp = () => ({ isHydrating: false, payload: { data } });
  dom.window.eval(readySource);
  await runTop(dom);
  d.querySelector('.new-product-list').innerHTML = '<div class="card keen-slider__slide" id="ng"><div class="productCard"><a href="/garumani/work/=/product_id/RJ1.html">作品</a></div></div><div class="card keen-slider__slide" id="normal"><div class="productCard"><a href="/garumani/work/=/product_id/RJ2.html">作品2</a></div></div>';
  await flush(); await flush();
  assert.equal(d.getElementById('ng'), null);
  assert.ok(d.getElementById('normal'));
  assert.equal(d.querySelector('[data-enspell-filter-count]').textContent, ' -1件');
  d.querySelector('#normal .productCard').insertAdjacentHTML('beforeend', '<div class="thumbnail-filter"></div>');
  await flush();
  assert.equal(d.getElementById('normal'), null);
});

test('がるまにカードの再利用時は古い商品情報を使わず、声優だけの表示をNGサークルと誤認しない', async t => {
  const dom = setup(t, '<div id="__nuxt"><div class="product-contents"><div class="productCard"><a href="/garumani/work/=/product_id/BJ1.html">作品</a><span class="voiceActors">声優</span></div></div></div>', 'garumani/voice');
  const d = dom.window.document;
  dom.window.useNuxtApp = () => ({ isHydrating: false, payload: { data: [{ id: 'BJ1', maker: { id: 'BG1', name: 'メーカー' }, authors: [{ id: 'AJ1', name: '著者' }], private: '含めない' }] } });
  dom.window.eval(readySource);
  const card = d.querySelector('.productCard');
  assert.deepEqual(JSON.parse(card.getAttribute('data-enspell-product')), { id: 'BJ1', makers: [{ id: 'BG1', name: 'メーカー' }, { id: 'AJ1', name: '著者' }] });
  assert.equal(filterCells([card.cloneNode(true)], [{ id: 'BG1' }]), 1);
  assert.equal(filterCells([card.cloneNode(true)], [{ name: 'メーカー' }]), 1);
  assert.equal(filterCells([card], [{ name: '声優' }]), 0);
  card.querySelector('a').href = '/garumani/work/=/product_id/BJ2.html';
  assert.equal(filterCells([card], [{ id: 'BG1' }]), 0);
  await flush();
  assert.equal(card.getAttribute('data-enspell-product'), null);
});

test('がるまにボイスもトップ設定OFFでは削除しない', async t => {
  const dom = setup(t, '<div class="product-contents"><section><h2 class="c-heading">新着</h2><div class="keen-slider__slide" id="keep"><div class="productCard"><div class="thumbnail-filter"></div></div></div></section></div>', 'garumani/voice');
  await runTop(dom, { ...settings, enable_top: false });
  assert.ok(dom.window.document.getElementById('keep'));
});
