import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { JSDOM } from 'jsdom';
import { observeEstimate, readEstimate, formatYen } from '../src/public/content/sales_estimate.js';

const flush=()=>new Promise(resolve=>setTimeout(resolve,0));
const price=(n,strike=false)=>`<span class="app-price${strike?' app-price_strike':''}"><span class="app-price_base">${n}</span><span class="app-price_suffix">円</span></span>`;
const stats=`<div class="c-productStatsPc"><div class="c-productStatsItemPc"><dt>販売数：</dt><dd><span class="c-productStatsPc__strong">1,000</span></dd></div><div class="c-productStatsItemPc"><dt>評価：</dt><dd><span class="c-productStatsPc__strong">4.9</span></dd></div></div>`;
test('現行推定売上は販売数と通常/セール価格を使い、評価・クーポン・関連作品価格を使わない',async(t)=>{
  const dom=new JSDOM(`${stats}<div class="c-purchaseBox__priceInfo">${price('2,200',true)}${price('1,980')}</div><div class="c-couponAvailable">${price('1,680')}</div>`);
  const d=dom.window.document,observer=observeEstimate(d,{show_estimate:true});
  t.after(()=>{observer.disconnect();dom.window.close();});
  assert.equal(d.querySelector('[data-enspell-estimate]').textContent,'推定売上額：1,980,000円 ～ 2,200,000円');
  d.querySelector('.c-productStatsPc__strong').textContent='2,000';
  await flush();
  assert.equal(d.querySelectorAll('[data-enspell-estimate]').length,1);
  assert.match(d.querySelector('[data-enspell-estimate]').textContent,/3,960,000円/);
  d.querySelector('.c-productStatsPc__strong').textContent='-';
  await flush();
  assert.equal(d.querySelector('[data-enspell-estimate]'),null);
});
test('推定売上の未設定OFF、遅延描画、通常価格のみ、0円、日本語単位に対応',async(t)=>{
  const dom=new JSDOM('<main></main>'),d=dom.window.document;
  assert.equal(observeEstimate(d,{}),undefined);
  const observer=observeEstimate(d,{show_estimate:true,estimate_format:'12万3456円'});
  t.after(()=>{observer.disconnect();dom.window.close();});
  d.body.innerHTML=`${stats}<div class="c-purchaseBox__priceInfo">${price('1,234')}</div>`;
  await flush();
  assert.equal(d.querySelector('[data-enspell-estimate]').textContent,'推定売上額：123万4000円 ～ 123万4000円');
  d.querySelector('.app-price_base').textContent='0';
  await flush();
  assert.equal(d.querySelector('[data-enspell-estimate]').textContent,'推定売上額：0円 ～ 0円');
  d.querySelector('.app-price_suffix').textContent='USD';
  assert.equal(readEstimate(d),null);
  assert.equal(formatYen(999999,'12万3456円'),'99万9999円');
});
test('旧推定売上形式を維持し、不正な数値では表示しない',t=>{
  const dom=new JSDOM('<div id="work_right"><div class="work_right_info"></div></div><div class="work_right_info_title value"><span class="point">10</span></div><div id="work_price"><span class="work_buy_content">2,000円</span><div itemprop="offers"><span class="price">1,000円</span></div></div>');
  t.after(()=>dom.window.close());
  assert.equal(readEstimate(dom.window.document).min,10000);
  assert.equal(readEstimate(dom.window.document).max,20000);
  dom.window.document.querySelector('.point').textContent='不明';
  assert.equal(readEstimate(dom.window.document),null);
});
for(const[file,flag,html,container,review]of[
  ['reviewer_product','enable_product','<div id="work_review"><p class="c-productReview__totalCount">10件</p><ul class="c-productReview__main"></ul></div>','.c-productReview__main','<li id="ng"><div class="c-review"><p class="c-review__writer"><a href="/reviewer/REV1/">NG</a></p></div></li>'],
  ['reviewer_product_reviewlist','enable_review_list','<main id="main_inner"><p class="page_total">10件</p><div id="reviews"></div></main>','#reviews','<div class="review_contents" id="ng"><span class="reveiw_author_item"><a href="/reviewer/REV1/">NG</a></span></div>'],
])test(`${file}: 新旧レビューの遅延・再描画・匿名・設定OFF`,async(t)=>{
  const source=await readFile(new URL(`../src/content/${file}.js`,import.meta.url),'utf8');
  for(const enabled of [false,true]){
    const dom=new JSDOM(html),d=dom.window.document;t.after(()=>dom.window.close());
    const chrome={runtime:{getURL:p=>new URL(`../src/public/${p}`,import.meta.url).href},storage:{local:{get:(key,cb)=>cb({[key]:{[flag]:enabled,ng_reviewers:[{id:'REV1'}],show_reviewer_ng_count:true}})}}};
    const run=new Function('chrome','document','loadModule',`return ${source.replaceAll('import(','loadModule(')}`);
    await run(chrome,d,url=>import(url));
    d.querySelector(container).innerHTML=review;
    await flush();assert.equal(d.getElementById('ng')===null,enabled);
    d.querySelector(container).innerHTML=review.replace('id="ng"','id="again"')+'<div class="review_contents" id="anonymous"></div>';
    await flush();assert.equal(d.getElementById('again')===null,enabled);assert.ok(d.getElementById('anonymous'));
  }
});
test('レビュー一覧の.html・末尾スラッシュ・レビュアー指定URLがmanifestに一致する',async()=>{
  const manifest=JSON.parse(await readFile(new URL('../src/public/manifest.json',import.meta.url),'utf8'));
  const entry=manifest.content_scripts.find(e=>e.js.includes('content/reviewer_product_reviewlist.js'));
  const match=(pattern,url)=>new RegExp('^'+pattern.split('*').map(s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('.*')+'$').test(url);
  for(const path of ['product_id/RJ1.html','product_id/RJ1.html/','reviewer/REV1/product_id/RJ1/'])assert.ok(entry.matches.some(p=>match(p,`https://www.dlsite.com/maniax/work/reviewlist/=/${path}`)));
});
