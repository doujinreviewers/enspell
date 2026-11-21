import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { JSDOM } from 'jsdom';
import { filterCells, getVoiceActorNames } from '../src/public/content/base_filter.js';

const topSource = await readFile(new URL('../src/content/toppage.js', import.meta.url), 'utf8');
const readySource = await readFile(new URL('../src/content/top_page_ready.js', import.meta.url), 'utf8');
const flush = () => new Promise(resolve => setTimeout(resolve, 0));
const actors = names => `<span class="voiceActors">${names.map(name => `<span class="voiceActor"><a href="/garumani/fsr/=/keyword_creater/${encodeURIComponent(name)}/">${name}</a></span>`).join('')}<span class="more">他</span></span>`;
const card = (id, names) => `<div class="keen-slider__slide" id="${id}"><div class="productCard"><a href="/garumani/work/=/product_id/${id}.html">作品</a>${actors(names)}</div></div>`;
const setup = (t, html, path = '/garumani/voice/') => {
  const dom = new JSDOM(html, { url: `https://www.dlsite.com${path}`, runScripts: 'outside-only' });
  t.after(() => dom.window.close());
  return dom;
};
const runTop = async (dom, settings) => {
  const chrome = { runtime: { getURL: p => new URL(`../src/public/${p}`, import.meta.url).href },
    storage: { local: { get: (key, cb) => cb({ [key]: settings }) } } };
  const run = new Function('chrome', 'document', 'location', 'loadModule', `return ${topSource.replaceAll('import(', 'loadModule(')}`);
  await run(chrome, dom.window.document, dom.window.location, url => import(url));
};

test('乙女/TL・BLランキングと新着・おすすめで表示中の声優名から作品を削除する', async t => {
  const kinds = ['tl-ranking', 'bl-ranking', 'new', 'recommend'];
  const dom = setup(t, `<div class="product-contents">${kinds.map((kind,i) => `<section><h2 class="c-heading"><a>${kind}</a></h2><div class="ranking-list">${card(`RJ${i+1}`, ['声優A', '声優B'])}${card(`RJ${i+11}`, ['声優B別名'])}</div></section>`).join('')}</div>`);
  const d = dom.window.document;
  await runTop(dom, { enable_top: true, show_ng_count: true, ng_circles: [{ name: '声優B' }] });
  for (let i=0;i<kinds.length;i++) {
    assert.equal(d.getElementById(`RJ${i+1}`), null);
    assert.ok(d.getElementById(`RJ${i+11}`));
  }
  assert.equal(d.querySelectorAll('h2 a').length, 4);
  assert.deepEqual([...d.querySelectorAll('[data-enspell-filter-count]')].map(e => e.textContent), [' -1件',' -1件',' -1件',' -1件']);
});

test('省略された3人目の声優も公開データから照合し、余分な情報を公開属性に渡さない', async t => {
  const dom = setup(t, '<div id="__nuxt"><div class="product-contents"><section><h2 class="c-heading">ランキング</h2><div id="list"></div></section></div></div>');
  const d = dom.window.document;
  const product = { id: 'BJ1', maker: { id: 'BG1', name: 'メーカー' },
    voiceBys: [{ name: '声優A', url: 'secret-test' }, { name: '声優B' }, { name: '声優C', private: '渡さない' }, { name: '声優C' }, null, {}], private: '渡さない' };
  dom.window.useNuxtApp = () => ({ isHydrating: false, payload: { data: [product] } });
  dom.window.eval(readySource);
  d.querySelector('#list').innerHTML = card('BJ1', ['声優A', '声優B']);
  await flush();
  const info = JSON.parse(d.querySelector('.productCard').getAttribute('data-enspell-product'));
  assert.deepEqual(info, { id: 'BJ1', makers: [{ id: 'BG1', name: 'メーカー' }], voiceActors: ['声優A', '声優B', '声優C'] });
  await runTop(dom, { enable_top: true, ng_circles: [{ name: '声優C' }] });
  assert.equal(d.getElementById('BJ1'), null);
  // 遅延して再追加された同じ作品にも適用する。
  d.querySelector('#list').innerHTML = card('BJ1', ['声優A', '声優B']);
  await flush(); await flush();
  assert.equal(d.getElementById('BJ1'), null);
});

test('カード再利用時は旧商品や旧表示の声優名を使わない', async t => {
  const dom = setup(t, `<div id="__nuxt"><div class="product-contents">${card('RJ1',['声優A'])}</div></div>`);
  const d = dom.window.document;
  const data = [{ id: 'RJ1', maker: { id: 'RG1', name: 'サークル' }, voiceBys: [{ name: '声優A' }] },
    { id: 'RJ2', maker: { id: 'RG1', name: 'サークル' }, voiceBys: [] }];
  dom.window.useNuxtApp = () => ({ isHydrating: false, payload: { data } });
  dom.window.eval(readySource);
  const element = d.querySelector('.productCard');
  element.querySelector('a').href = '/garumani/work/=/product_id/RJ2.html';
  assert.deepEqual(getVoiceActorNames(element), []);
  await flush();
  assert.deepEqual(getVoiceActorNames(element), []);
  assert.equal(filterCells([element], [{ name: '声優A' }]), 0);
});

test('声優名は名前欄で完全一致させ、ID欄・他フロア・レビューには適用しない', t => {
  const dom = setup(t, card('RJ1',['声優A']));
  const element = dom.window.document.querySelector('.productCard');
  assert.equal(filterCells([element], [{ id: '声優A' }]), 0);
  assert.equal(filterCells([element], [{ name: '声優' }]), 0);
  assert.equal(filterCells([element], [{ name: '他' }]), 0);
  assert.equal(filterCells([element], [{ name: '声優A' }], true), 0);
  const other = setup(t, card('RJ1',['声優A']), '/maniax/');
  assert.equal(filterCells(other.window.document.querySelectorAll('.productCard'), [{ name: '声優A' }]), 0);
  assert.equal(filterCells([element], [{ name: ' 声優A ' }]), 1);
});

test('トップ設定OFFでは声優名が一致しても削除しない', async t => {
  const dom = setup(t, `<div class="product-contents"><section><h2 class="c-heading">ランキング</h2>${card('RJ1',['声優A'])}</section></div>`);
  await runTop(dom, { enable_top: false, ng_circles: [{ name: '声優A' }] });
  assert.ok(dom.window.document.getElementById('RJ1'));
});

test('メーカー情報がなくても取得済みの声優情報だけで照合できる', async t => {
  const dom = setup(t, `<div id="__nuxt"><div class="product-contents"><section>${card('RJ1',[])}</section></div></div>`);
  dom.window.useNuxtApp = () => ({ isHydrating: false, payload: { data: [{ id: 'RJ1', voiceBys: [{ name: '声優A' }] }] } });
  dom.window.eval(readySource);
  await runTop(dom, { enable_top: true, ng_circles: [{ name: '声優A' }] });
  assert.equal(dom.window.document.getElementById('RJ1'), null);
});
