import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { JSDOM } from 'jsdom';
import { observeNewWorks } from '../src/public/content/new_work_filter.js';
import { filterCells, getMakerIdAndName } from '../src/public/content/base_filter.js';

// 2026-11-19の実ページから、作品名・画像・価格を除いた構造。
const card = (id, maker = 'RG12345', marker = '') => `
  <li class="new-product-section__item" id="${id}">
    <div class="c-mediaBlockHorizontal" data-workno="${id}">
      <a class="c-mediaBlockHorizontal__thumb"><div class="${marker}"></div></a>
      <div class="c-mediaBlock__author">
        <a href="https://www.dlsite.com/maniax/circle/profile/=/maker_id/${maker}.html">サークル${maker}</a>
        <span class="c-mediaBlock__voiceActor"><a href="/maniax/fsr/=/keyword_creater/声優/">声優</a></span>
      </div>
    </div>
  </li>`;
const section = (cards) => `<section data-section_name="new_product">
  <section class="new-product-section"><h3 class="headline__title"><a href="#">新着</a></h3>
    <ul class="new-product-section__list">${cards}</ul>
  </section></section>`;
const settings = { enable_top: true, ng_circles: [{ id: 'RG12345' }], hide_ng_by_dlsite: true, show_ng_count: true };
const removed = (document, id) => document.getElementById(id) === null;
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));
const setup = (t, html, options = settings) => {
  const dom = new JSDOM(html, { url: 'https://www.dlsite.com/maniax/' });
  const observer = observeNewWorks(dom.window.document, options);
  t.after(() => { observer?.disconnect(); dom.window.close(); });
  return dom.window.document;
};

test('現行新着欄の初期表示でサークルNGと表示NGを削除し、通常作品と見出しリンクを維持する', (t) => {
  const document = setup(t, section(card('circle') + card('dlsite', 'RG22222', 'c-mediaBlock__filter') + card('normal', 'RG33333')));
  assert.equal(removed(document, 'circle'), true);
  assert.equal(removed(document, 'dlsite'), true);
  assert.equal(removed(document, 'normal'), false);
  assert.equal(document.querySelector('[data-enspell-new-work-count]').textContent, ' -2本');
  assert.equal(document.querySelector('h3 a').textContent, '新着');
});

test('空欄からの遅延読み込み、作品追加、ルートごとの置換後にも適用する', async (t) => {
  const document = setup(t, '<main></main>');
  document.querySelector('main').innerHTML = section('');
  await flush();
  document.querySelector('ul').innerHTML = card('first');
  await flush();
  assert.equal(removed(document, 'first'), true);
  document.querySelector('ul').insertAdjacentHTML('beforeend', card('second', 'RG22222', 'c-mediaBlock__filter'));
  await flush();
  assert.equal(removed(document, 'second'), true);
  assert.equal(document.querySelector('[data-enspell-new-work-count]').textContent, ' -2本');
  document.querySelector('main').innerHTML = section(card('replacement') + card('normal', 'RG33333'));
  await flush();
  assert.equal(removed(document, 'replacement'), true);
  assert.equal(removed(document, 'normal'), false);
  assert.equal(document.querySelector('[data-enspell-new-work-count]').textContent, ' -1本');
});

test('遅れて付くNGマーカーと追加作品を削除し、無関係な更新で件数を重複させない', async (t) => {
  const document = setup(t, section(card('reuse', 'RG33333')));
  const marker = document.querySelector('.c-mediaBlockHorizontal__thumb div');
  marker.className = 'c-mediaBlock__filter';
  await flush();
  assert.equal(removed(document, 'reuse'), true);
  document.querySelector('ul').insertAdjacentHTML('beforeend', card('normal', 'RG33333'));
  await flush();
  assert.equal(removed(document, 'normal'), false);
  assert.equal(document.querySelector('[data-enspell-new-work-count]').textContent, ' -1本');
  document.querySelector('.c-mediaBlock__author > a').href = '/maniax/circle/profile/=/maker_id/RG12345.html';
  await flush();
  assert.equal(removed(document, 'normal'), true);
  document.querySelector('ul').classList.add('updated');
  await flush();
  assert.equal(document.querySelectorAll('[data-enspell-new-work-count]').length, 1);
  assert.equal(document.querySelector('[data-enspell-new-work-count]').textContent, ' -2本');
});

test('カテゴリ切替で同じブロックが再利用されても件数をリセットする', async (t) => {
  const document = setup(t, section(card('first') + card('second')));
  const root = document.querySelector('[data-section_name="new_product"]');
  root.insertAdjacentHTML('afterbegin', '<div class="new-product-filter"><button class="is-active">ゲーム</button></div>');
  document.querySelector('ul').innerHTML = card('replacement');
  await flush();
  assert.equal(removed(document, 'replacement'), true);
  assert.equal(document.querySelector('[data-enspell-new-work-count]').textContent, ' -1本');
});

test('設定OFF・NGリスト未設定・件数OFFを尊重する', (t) => {
  const disabled = setup(t, section(card('disabled')), { ...settings, enable_top: false });
  assert.equal(removed(disabled, 'disabled'), false);
  assert.equal(disabled.querySelector('style'), null);
  const document = setup(t, section(card('normal') + card('dlsite', 'RG22222', 'c-mediaBlock__filter')), {
    enable_top: true, hide_ng_by_dlsite: true,
  });
  assert.equal(removed(document, 'normal'), false);
  assert.equal(removed(document, 'dlsite'), true);
  assert.equal(document.querySelector('[data-enspell-new-work-count]'), null);
  const noDlsite = setup(t, section(card('dlsite', 'RG22222', 'c-mediaBlock__filter')), {
    enable_top: true, hide_ng_by_dlsite: false,
  });
  assert.equal(removed(noDlsite, 'dlsite'), false);
});

test('現行サークル名の照合で声優名を混同しない', (t) => {
  const document = setup(t, section(card('name')), { enable_top: true, ng_circles: [{ name: 'サークルRG12345' }] });
  assert.equal(removed(document, 'name'), true);
  const template = document.createElement('template');
  template.innerHTML = card('author');
  const cell = template.content.firstElementChild;
  assert.deepEqual(getMakerIdAndName(cell), { id: 'RG12345', name: 'サークルRG12345' });
  assert.equal(filterCells([cell], [{ name: '声優' }]), 0);
});

test('旧新着欄と検索形式のサークル・表示NG判定を維持する', (t) => {
  const document = setup(t, `<div id="new_worklist"><div class="work_block">
    <h3 class="work_subheading">旧新着</h3><ul>
    <li class="n_worklist_item" id="legacy"><span class="maker_name"><a href="/maker_id/RG12345.html">旧サークル</a></span></li>
    <li class="n_worklist_item" id="legacyNg"><img class="shouldFilter"></li>
    <li class="n_worklist_item" id="normal"></li></ul></div></div>`);
  assert.equal(removed(document, 'legacy'), true);
  assert.equal(removed(document, 'legacyNg'), true);
  assert.equal(removed(document, 'normal'), false);
  assert.equal(document.querySelector('[data-enspell-new-work-count]').textContent, ' -2本');
});

test('トップページの他の旧欄がなくてもエントリーポイントが新着欄を処理できる', async (t) => {
  const dom = new JSDOM(section(card('entry')), { url: 'https://www.dlsite.com/maniax/' });
  t.after(() => dom.window.close());
  const source = await readFile(new URL('../src/content/toppage.js', import.meta.url), 'utf8');
  const chrome = {
    runtime: { getURL: (path) => new URL(`../src/public/${path}`, import.meta.url).href },
    storage: { local: { get: (key, callback) => callback({ [key]: settings }) } },
  };
  const run = new Function('chrome', 'document', 'location', 'MutationObserver', 'Element', 'loadModule',
    `return ${source.replaceAll('import(', 'loadModule(')}`);
  const { document, location, MutationObserver, Element } = dom.window;
  await run(chrome, document, location, MutationObserver, Element, (url) => import(url));
  assert.equal(removed(document, 'entry'), true);
});
