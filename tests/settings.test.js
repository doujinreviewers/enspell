import test from 'node:test';
import assert from 'node:assert/strict';
import { createSettingsStore, DLSITE_ENSPELL_STORAGE_KEY as key } from '../src/options/storage.js';

const memoryStorage = initial => {
  let data = structuredClone(initial), active = 0, maxActive = 0;
  return {
    get(_,callback) {
      active++;maxActive=Math.max(maxActive,active);
      const snapshot=structuredClone(data);
      setTimeout(()=>{active--;callback({[key]:snapshot});},2);
    },
    set(value,callback) {
      active++;maxActive=Math.max(maxActive,active);
      setTimeout(()=>{data=structuredClone(value[key]);active--;callback();},2);
    },
    get data(){return data;},get maxActive(){return maxActive;},
  };
};

test('複数の設定を連続保存しても古い読み取り値で上書きせず、読み込みも保存完了を待つ',async()=>{
  const storage=memoryStorage({unknown:'keep',ng_reviewers:[{id:'REV1'}]});
  const store=createSettingsStore(storage);
  const writes=[store.updateSettings({enable_top:true}),store.updateSettings({enable_search:true}),store.updateSettings({show_estimate:true})];
  let loaded;
  await store.getSettings(value=>{loaded=value;});
  await Promise.all(writes);
  assert.deepEqual(loaded,{unknown:'keep',ng_reviewers:[{id:'REV1'}],enable_top:true,enable_search:true,show_estimate:true});
  assert.equal(storage.maxActive,1);
});
test('リストの保存待ち中の編集は先行保存の値を書き換えず、最後の変更が残る',async()=>{
  const storage=memoryStorage({}),store=createSettingsStore(storage);
  const list=[{id:'RG1',name:'最初'}];
  const first=store.updateSettings({ng_circles:list});
  list[0].name='変更後';
  await first;
  assert.equal(storage.data.ng_circles[0].name,'最初');
  await store.updateSettings({ng_circles:list});
  assert.equal(storage.data.ng_circles[0].name,'変更後');
});
