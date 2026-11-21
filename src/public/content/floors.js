// index.htmlの入口を基準にしたPC版DLsite内の対象フロア。comicはcomipoへ移転済み。
export const FLOOR_NAMES = {
  home: '同人（全年齢）', maniax: '同人（成人向け）',
  girls: 'がるまに・乙女向け', bl: 'がるまに・ボーイズラブ',
  garumani: 'がるまに・ボイス／ASMR',
  soft: 'PCソフト', pro: '美少女ゲーム', books: '成年コミック',
  app: 'スマホゲーム（全年齢）', appx: 'スマホゲーム（成人向け）',
};

export const isFloorTop = pathname => {
  const match = pathname.match(/^\/([^/]+)(?:\/(.*))?$/);
  if (!match || !Object.hasOwn(FLOOR_NAMES, match[1])) return false;
  const rest = (match[2] || '').replace(/\/$/, '');
  return rest === '' || rest === 'index.html' || (match[1] === 'garumani' && rest === 'voice');
};
