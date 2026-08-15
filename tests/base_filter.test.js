import test from 'node:test';
import assert from 'node:assert/strict';

import {
  filterCells,
  filterSingleCell,
  isDlsiteNgCell,
  judge,
} from '../src/public/content/base_filter.js';

const createCell = ({ makerId = 'RG12345', makerName = 'テストサークル', dlsiteNg = false } = {}) => {
  let removed = false;
  const makerLink = {
    href: `https://www.dlsite.com/maniax/circle/profile/=/maker_id/${makerId}.html`,
    textContent: makerName,
  };

  return {
    querySelector(selector) {
      if (selector === '._filter, ._censored') {
        return dlsiteNg ? {} : null;
      }
      if (selector === '.maker_name a') {
        return makerLink;
      }
      return null;
    },
    remove() {
      removed = true;
    },
    get removed() {
      return removed;
    },
  };
};

test('NGリストが未設定でも判定時に例外にならない', () => {
  assert.equal(judge(undefined, 'RG12345'), false);
  assert.equal(judge(null, 'テストサークル'), false);
});

test('DLsite表示NGだけを有効にした場合に通常作品を処理できる', () => {
  const normalCell = createCell();
  const dlsiteNgCell = createCell({ dlsiteNg: true });

  const count = filterCells([normalCell, dlsiteNgCell], undefined, false, true);

  assert.equal(count, 1);
  assert.equal(normalCell.removed, false);
  assert.equal(dlsiteNgCell.removed, true);
});

test('現行DLsiteのフィルター用クラスを表示NGとして判定する', () => {
  const dlsiteNgCell = createCell({ dlsiteNg: true });

  assert.equal(isDlsiteNgCell(dlsiteNgCell), true);
  assert.equal(filterSingleCell(dlsiteNgCell, [], false, true), 1);
  assert.equal(dlsiteNgCell.removed, true);
});

test('サークルIDまたは名前に一致する作品を除外する', () => {
  const idMatch = createCell({ makerId: 'RG11111', makerName: 'サークルA' });
  const nameMatch = createCell({ makerId: 'RG22222', makerName: 'サークルB' });
  const noMatch = createCell({ makerId: 'RG33333', makerName: 'サークルC' });

  const count = filterCells(
    [idMatch, nameMatch, noMatch],
    [{ id: 'RG11111', name: '' }, { id: '', name: 'サークルB' }],
  );

  assert.equal(count, 2);
  assert.equal(idMatch.removed, true);
  assert.equal(nameMatch.removed, true);
  assert.equal(noMatch.removed, false);
});
