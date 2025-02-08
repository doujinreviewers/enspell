(function () {
  console.log("Vue.js のロードを監視中...");

  function initializeVue() {
      if (!window.Vue) {
          console.error("❌ Vue.js が見つかりません。");
          return;
      }
      if (!window.__DLSITE_ENSPELL__ || !window.__DLSITE_ENSPELL__.MyComponent) {
          console.error("❌ MyComponent が見つかりません。components.js のロードを確認してください。");
          return;
      }

      console.log("✅ Vue.js & MyComponent がロード済み！");

      // Vue 用のルート要素を作成
      const vueContainer = createVueContainer();

      const product_id = window.location.href.match(/\/product_id\/([A-Z0-9]+)/)[1];

      // Vue インスタンスを作成し、コンポーネントを登録
      new window.Vue({
          el: document.querySelector('#review_list > div'),
          components: { "my-component": window.__DLSITE_ENSPELL__.MyComponent },
          data() {
            return {
              product_id: product_id,
              order: "top"
            };
          },
          // template: `<my-component :product_id="product_id" :order="order"></my-component>`
          template: `<my-component></my-component>`
      });
  }

  function createVueContainer() {
      let existingContainer = document.getElementById("vue-extension-widget");
      if (existingContainer) {
          existingContainer.remove();
      }

      const appContainer = document.createElement("div");
      appContainer.id = "vue-extension-widget";
      Object.assign(appContainer.style, {
          // position: "fixed",
          // bottom: "10px",
          // right: "10px",
          // background: "white",
          // padding: "10px",
          // border: "1px solid black",
          // borderRadius: "5px",
          // boxShadow: "2px 2px 10px rgba(0,0,0,0.2)",
          // zIndex: "9999"
      });
      document.body.appendChild(appContainer);

      const vueContainer = document.createElement("div");
      vueContainer.id = "enspell-container";
      appContainer.appendChild(vueContainer);

      return vueContainer;
  }

  const checkComponentInterval = setInterval(() => {
      if (window.Vue && window.__DLSITE_ENSPELL__ && window.__DLSITE_ENSPELL__.MyComponent) {
          clearInterval(checkComponentInterval);
          initializeVue();
      }
  }, 500);
})();
