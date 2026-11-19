import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { JSDOM } from 'jsdom';
import { observeRecommendations } from '../src/public/content/list_filter.js';

const settings = { enable_top: true, enable_search: true, enable_ranking: true, enable_new: true,
  enable_announce: true, ng_circles: [{ id: 'RG1' }], hide_ng_by_dlsite: true, show_ng_count: true };
const maker = '<div class="maker_name"><a href="/maker_id/RG1.html">NG</a></div>';
const flush = () => new Promise(resolve => setTimeout(resolve, 0));

test('現行・旧おすすめ欄で初期作品と遅延追加・表示NGを削除し見出しリンクを保つ', async (t) => {
  const dom = new JSDOM(`<section class="recommended-products-content-pc"><h2 class="headline__title"><a href="#">おすすめ</a></h2>
    <div class="keen-slider"><div class="keen-slider__slide" id="ng">${maker}</div><div class="keen-slider__slide" id="normal"></div></div></section>
    <h2 class="title_01 with_work_push">割引開始作品</h2><ul class="recommend_list type_top _discount"><li class="swiper-slide" id="old">${maker}</li></ul>`);
  const d=dom.window.document;
  const observer=observeRecommendations(d,settings);
  t.after(()=>{observer.disconnect();dom.window.close();});
  assert.equal(d.getElementById('ng'),null);
  assert.equal(d.getElementById('old'),null);
  assert.ok(d.querySelector('h2 a'));
  d.getElementById('normal').classList.add('shouldFilter');
  await flush();
  assert.equal(d.getElementById('normal'),null);
  d.querySelector('.keen-slider').innerHTML=`<div class="keen-slider__slide" id="late">${maker}</div>`;
  await flush();
  assert.equal(d.getElementById('late'),null);
  assert.equal(d.querySelector('.headline__title [data-enspell-filter-count]').textContent,' -3件');
});

for (const [file,flag,html,selector] of [
  ['search','enable_search','<h2 class="base_title_br"><span class="original_name"><a>検索結果</a></span></h2><ul id="search_result_img_box"><li id="ng">'+maker+'</li></ul>','#search_result_img_box'],
  ['search','enable_search','<table class="work_1col_table n_worklist"><tbody><tr id="ng"><td>'+maker+'</td></tr></tbody></table>','tbody'],
  ['rankingpage','enable_ranking','<h1>ランキング</h1><ul><li class="ranking_top_worklist_item" id="ng">'+maker+'</li></ul>','ul'],
  ['rankingpage','enable_ranking','<table class="n_worklist"><tbody><tr id="ng"><td>'+maker+'</td></tr></tbody></table>','tbody'],
  ['announcepage','enable_announce','<h3 class="work_update">予告</h3><ul><li class="n_worklist_item" id="ng">'+maker+'</li></ul>','ul'],
  ['newpage','enable_new','<h3 class="work_update">発売日</h3><ul><li class="n_worklist_item" id="ng">'+maker+'</li></ul>','ul'],
]) test(`${file} ${selector}: 初期・動的NGと設定OFF`, async (t) => {
  const source=await readFile(new URL(`../src/content/${file}.js`,import.meta.url),'utf8');
  const run=new Function('chrome','document','loadModule',`return ${source.replaceAll('import(','loadModule(')}`);
  for(const enabled of [false,true]) {
    const dom=new JSDOM(`<main id="main_inner">${html}</main>`);
    t.after(()=>dom.window.close());
    const d=dom.window.document;
    const sample=d.getElementById('ng').cloneNode(true);
    sample.id='late';sample.querySelector('.maker_name').remove();
    const chrome={runtime:{getURL:p=>new URL(`../src/public/${p}`,import.meta.url).href},storage:{local:{get:(key,cb)=>cb({[key]:{...settings,[flag]:enabled}})}}};
    await run(chrome,d,url=>import(url));
    assert.equal(d.getElementById('ng')===null,enabled);
    d.querySelector(selector).append(sample);
    await flush();
    assert.ok(d.getElementById('late'));
    sample.classList.add('shouldFilter');
    await flush();
    assert.equal(d.getElementById('late')===null,enabled);
  }
});

test('検索の補助ランキングは例外なく処理し、対象コンテナがなくても待機する',async(t)=>{
  const dom=new JSDOM('<div id="_works_type_ranking"><h3><a>人気ランキング</a></h3><ul><li class="swiper-slide" id="ng">'+maker+'</li></ul></div>');
  t.after(()=>dom.window.close());
  const source=await readFile(new URL('../src/content/search.js',import.meta.url),'utf8');
  const run=new Function('chrome','document','loadModule',`return ${source.replaceAll('import(','loadModule(')}`);
  const chrome={runtime:{getURL:p=>new URL(`../src/public/${p}`,import.meta.url).href},storage:{local:{get:(key,cb)=>cb({[key]:settings})}}};
  await run(chrome,dom.window.document,url=>import(url));
  assert.equal(dom.window.document.getElementById('ng'),null);
  assert.ok(dom.window.document.querySelector('h3 a'));
});
