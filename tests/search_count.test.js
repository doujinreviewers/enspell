import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { JSDOM } from 'jsdom';

const source = await readFile(new URL('../src/content/search.js', import.meta.url), 'utf8');
const flush = () => new Promise(resolve => setTimeout(resolve, 0));
const settings = { enable_search: true, show_ng_count: true, ng_circles: [{ id: 'RG1' }], hide_ng_by_dlsite: true };
const item = (id, ng = false, mode = 'image') => {
  const body = `<div data-workno="${id}"><span class="maker_name"><a href="/maker_id/${ng ? 'RG1' : 'RG2'}.html">サークル</a></span></div>`;
  return mode === 'image' ? `<li id="${id}">${body}</li>` : `<tr id="${id}"><td>${body}</td></tr>`;
};
const list = (items, mode = 'image') => mode === 'image'
  ? `<ul id="search_result_img_box">${items}</ul>`
  : `<table class="work_1col_table n_worklist"><tbody>${items}</tbody></table>`;
const setup = async (t, items, mode = 'image', options = {}) => {
  const dom = new JSDOM(`<main id="main_inner"><ul class="search_tag_items"><li>条件A</li></ul>
    <div class="base_title_br"><h1><span class="original_name"><a href="#">検索結果</a></span></h1></div>
    <div id="search_result_list">${list(items, mode)}</div></main>`, { url: 'https://www.dlsite.com/maniax/fsr/=/genre/1/' });
  t.after(() => dom.window.close());
  const chrome = {
    runtime: { getURL: path => new URL(`../src/public/${path}`, import.meta.url).href },
    storage: { local: { get: (key, callback) => callback({ [key]: { ...settings, ...options } }) } },
  };
  const run = new Function('chrome', 'document', 'loadModule', `return ${source.replaceAll('import(', 'loadModule(')}`);
  await run(chrome, dom.window.document, url => import(url));
  return dom.window.document;
};
const counter = d => d.querySelector('.original_name [data-enspell-filter-count]')?.textContent ?? null;

for (const mode of ['image', 'table']) {
  test(`${mode}: 同じ検索画面の条件変更で2件→1件→0件へ再集計する`, async t => {
    const d = await setup(t, item('ng1', true, mode) + item('ng2', true, mode) + item('normal', false, mode), mode);
    const main = d.querySelector('#main_inner');
    const results = d.querySelector('#search_result_list');
    const link = d.querySelector('.original_name a');
    let clicks = 0;
    link.addEventListener('click', () => clicks++);
    assert.equal(counter(d), ' -2件');
    assert.equal(d.querySelector('[data-workno="ng1"]'), null);

    // 実サイト同様にタグが先に更新され、後から一覧が差し替わる。
    d.querySelector('.search_tag_items li').textContent = '条件B';
    await flush();
    assert.equal(counter(d), ' -2件');
    results.innerHTML = list(item('newNg', true, mode) + item('newNormal', false, mode), mode);
    await flush();
    assert.equal(d.querySelector('#main_inner'), main);
    assert.equal(counter(d), ' -1件');
    assert.equal(d.getElementById('newNg'), null);
    assert.ok(d.getElementById('newNormal'));

    // 一覧が先、URL/タグが後でも、古い集計へ戻らない。
    results.innerHTML = list(item('onlyNormal', false, mode), mode);
    await flush();
    d.defaultView.history.pushState({}, '', '/maniax/fsr/=/genre/3/');
    d.querySelector('.search_tag_items li').textContent = '条件C';
    await flush();
    assert.equal(counter(d), null);
    assert.ok(d.getElementById('onlyNormal'));
    assert.equal(d.querySelector('.original_name a'), link);
    link.click();
    assert.equal(clicks, 1);
  });

  test(`${mode}: 全作品削除後も同じ一覧要素の中身交換で再集計し、空の結果で表示を消す`, async t => {
    const d = await setup(t, item('allNg', true, mode), mode);
    const container = d.querySelector(mode === 'image' ? '#search_result_img_box' : 'tbody');
    assert.equal(container.children.length, 0);
    assert.equal(counter(d), ' -1件');
    container.innerHTML = item('a', true, mode) + item('b', true, mode);
    await flush();
    assert.equal(container.children.length, 0);
    assert.equal(counter(d), ' -2件');
    container.replaceChildren();
    await flush();
    assert.equal(counter(d), null);
    d.querySelector('#search_result_list').innerHTML = '<p>該当する作品はありません</p>';
    await flush();
    assert.equal(counter(d), null);
  });
}

test('同じ一覧の追加作品・後付けNGを加算し、無関係な変更では二重計上しない', async t => {
  const d = await setup(t, item('first', true) + item('lateNg'));
  d.querySelector('#search_result_img_box').insertAdjacentHTML('beforeend', item('added', true));
  await flush();
  assert.equal(counter(d), ' -2件');
  d.getElementById('lateNg').classList.add('shouldFilter');
  await flush();
  assert.equal(counter(d), ' -3件');
  d.body.append(d.createElement('aside'));
  await flush();
  assert.equal(counter(d), ' -3件');
  d.querySelector('.original_name').innerHTML = '<a>検索結果更新</a>';
  await flush();
  assert.equal(counter(d), ' -3件');
  assert.equal(d.querySelectorAll('.original_name [data-enspell-filter-count]').length, 1);
});

test('表示形式・画面全体の交換で再集計し、補助ランキングの集計は独立する', async t => {
  const d = await setup(t, item('first', true));
  d.querySelector('#main_inner').insertAdjacentHTML('beforeend', `<section id="_works_type_ranking"><h3>補助</h3><ul>
    <li class="swiper-slide"><div class="maker_name"><a href="/maker_id/RG1.html">NG</a></div></li></ul></section>`);
  await flush();
  const extra = () => d.querySelector('#_works_type_ranking [data-enspell-filter-count]')?.textContent;
  assert.equal(counter(d), ' -1件');
  assert.equal(extra(), ' -1件');
  d.querySelector('#search_result_list').innerHTML = list(item('tableNg', true, 'table') + item('normal', false, 'table'), 'table');
  await flush();
  assert.equal(counter(d), ' -1件');
  assert.equal(extra(), ' -1件');
  d.querySelector('#search_result_list').innerHTML = list(item('normal2'));
  await flush();
  assert.equal(counter(d), null);
  assert.equal(extra(), ' -1件');
  d.querySelector('#main_inner').outerHTML = `<main id="main_inner"><div class="base_title_br"><span class="original_name">検索結果</span></div>${list(item('newRootNg', true))}</main>`;
  await flush();
  assert.equal(counter(d), ' -1件');
});

test('件数OFFでも作品を削除し、内部集計用のノードや表示を追加しない', async t => {
  const d = await setup(t, item('ng', true), 'image', { show_ng_count: false });
  assert.equal(d.getElementById('ng'), null);
  assert.equal(d.querySelector('#search_result_img_box').childNodes.length, 0);
  assert.equal(counter(d), null);
});

test('結果の一部を差し替えた場合は、その範囲の削除件数だけを引き直す', async t => {
  const d = await setup(t, '', 'table');
  const table = d.querySelector('table');
  table.innerHTML = `<tbody id="groupA">${item('a1', true, 'table')}${item('a2', true, 'table')}</tbody>
    <tbody id="groupB">${item('b1', true, 'table')}</tbody>`;
  await flush();
  assert.equal(counter(d), ' -3件');
  d.getElementById('groupA').innerHTML = item('aNormal', false, 'table');
  await flush();
  assert.equal(counter(d), ' -1件');
  assert.ok(d.getElementById('aNormal'));
  d.getElementById('groupB').insertAdjacentHTML('beforeend', item('b2', true, 'table'));
  await flush();
  assert.equal(counter(d), ' -2件');
});
