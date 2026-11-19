import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { JSDOM } from 'jsdom';
import { createGenreReplacer, observeGenreText } from '../src/public/content/genre_text.js';

const mapping=JSON.parse(await readFile(new URL('../src/public/genre_mapping.json',import.meta.url),'utf8'));
const flush=()=>new Promise(resolve=>setTimeout(resolve,0));
test('全マッピングを復元し、元の語を含む復元結果も再変換で増殖しない',()=>{
  const replace=createGenreReplacer(mapping);
  for(const {ng,ok} of mapping){
    assert.equal(replace(ng),ok);
    assert.equal(replace(replace(ng)),ok);
  }
  assert.equal(replace('逆レ (7)'), '逆レイプ (7)');
});
test('入れ子のジャンル表示・イベント・入力欄を維持し、遅延描画にも対応する',async(t)=>{
  const dom=new JSDOM('<a href="/genre/157/"><span id="label">トランス/暗示</span><i id="icon"></i></a><ul class="select_content"><li><input value="トランス/暗示"><textarea>トランス/暗示</textarea><span contenteditable="true">トランス/暗示</span></li></ul>');
  const d=dom.window.document,label=d.getElementById('label'),icon=d.getElementById('icon');
  let clicks=0;label.addEventListener('click',()=>clicks++);
  const observer=observeGenreText(d,mapping);
  t.after(()=>{observer.disconnect();dom.window.close();});
  assert.equal(label.textContent,'催眠');assert.equal(d.getElementById('icon'),icon);
  label.click();assert.equal(clicks,1);
  assert.equal(d.querySelector('input').value,'トランス/暗示');
  assert.equal(d.querySelector('textarea').value,'トランス/暗示');
  assert.equal(d.querySelector('[contenteditable]').textContent,'トランス/暗示');
  d.body.insertAdjacentHTML('beforeend','<a id="late" href="/genre/157/">トランス/暗示</a>');
  await flush();assert.equal(d.getElementById('late').textContent,'催眠');
  label.firstChild.data='トランス/暗示 (7)';
  await flush();assert.equal(label.textContent,'催眠 (7)');
});
test('復元済みの語を含む無関係なDOM更新で書き戻しを繰り返さない',async(t)=>{
  const dom=new JSDOM('<a href="/genre/115/">逆レ</a>');const d=dom.window.document;
  const observer=observeGenreText(d,mapping);t.after(()=>{observer.disconnect();dom.window.close();});
  let changes=0;
  const watch=new dom.window.MutationObserver(records=>changes+=records.length);
  watch.observe(d.querySelector('a'),{childList:true,subtree:true,characterData:true});t.after(()=>watch.disconnect());
  d.body.append(d.createElement('div'));await flush();await flush();
  assert.equal(changes,0);assert.equal(d.querySelector('a').textContent,'逆レイプ');
});
test('ジャンル機能を二重注入するmanifestエントリがない',async()=>{
  const m=JSON.parse(await readFile(new URL('../src/public/manifest.json',import.meta.url),'utf8'));
  assert.equal(m.content_scripts.filter(e=>e.js.includes('content/genre_revival.js')).length,1);
});
