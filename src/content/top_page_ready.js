// MAIN worldで初期描画完了だけを通知する。拡張機能の設定やAPIにはアクセスしない。
(() => {
  if (!/^\/[^/]+\/?$/.test(location.pathname) &&
      !/^\/[^/]+\/work\/(?:=|reviewlist\/)/.test(location.pathname)) return;

  const markReady = () => document.documentElement.setAttribute('data-enspell-top-ready', '');
  const check = () => {
    if (!document.getElementById('__nuxt')) {
      markReady();
      return;
    }

    let app;
    try {
      app = window.useNuxtApp?.();
    } catch {
      // Nuxtの初期化前は取得できない場合がある。
    }
    if (app?.isHydrating === false) {
      markReady();
    } else if (app?.hooks?.hookOnce) {
      app.hooks.hookOnce('app:suspense:resolve', markReady);
    } else {
      window.setTimeout(check, 100);
    }
  };
  check();
})();
