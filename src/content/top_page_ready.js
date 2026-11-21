// MAIN worldで描画完了と公開作品メタデータを通知する。拡張機能の設定やAPIにはアクセスしない。
(() => {
  let metadataObserver;
  const exposeGarumaniMakers = () => {
    if (!/^\/garumani\/voice\/?$/.test(location.pathname) || metadataObserver) return;
    const ownerDocument = document;
    // このフロアはサークルを画面に表示しない。既に取得済みの公開作品データから
    // 商品IDとメーカー/著者だけをカードに付記し、設定・削除処理はisolated worldに保つ。
    const update = () => {
      if (!ownerDocument.defaultView?.document) return;
      const products = new Map(), seen = new WeakSet();
      let data;
      try { data = window.useNuxtApp?.()?.payload?.data; } catch { return; }
      const pending = [data];
      for (let visited = 0; pending.length && visited < 50000; visited++) {
        const value = pending.pop();
        if (!value || typeof value !== 'object' || seen.has(value)) continue;
        seen.add(value);
        if (/^(?:RJ|BJ|VJ)\d+$/.test(value.id || '') && value.maker) {
          const makers = [value.maker, ...(Array.isArray(value.authors) ? value.authors : [])]
            .filter(maker => maker && /^(?:RG|VG|BG|AJ)\d+$/.test(maker.id || '') && typeof maker.name === 'string')
            .map(({ id, name }) => ({ id, name }));
          if (makers.length) products.set(value.id, { id: value.id, makers });
        }
        pending.push(...Object.values(value));
      }
      for (const card of ownerDocument.querySelectorAll('.product-contents .productCard')) {
        const id = card.querySelector('a[href*="/product_id/"]')?.href.match(/\/product_id\/((?:RJ|BJ|VJ)\d+)/)?.[1];
        const product = products.get(id);
        if (!product) {
          if (card.hasAttribute('data-enspell-product')) card.removeAttribute('data-enspell-product');
          continue;
        }
        const text = JSON.stringify(product);
        if (card.getAttribute('data-enspell-product') !== text) card.setAttribute('data-enspell-product', text);
      }
    };
    metadataObserver = new MutationObserver(update);
    metadataObserver.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['href'] });
    update();
  };
  const markReady = () => {
    exposeGarumaniMakers();
    document.documentElement.setAttribute('data-enspell-top-ready', '');
  };
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
