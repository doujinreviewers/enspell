(async () => {

  const baseFilterModule = await import(chrome.runtime.getURL('content/base_filter.js'));
  const { DLSITE_ENSPELL_STORAGE_KEY } = baseFilterModule;

  const response = await fetch(chrome.runtime.getURL('genre_mapping.json'));
  const genre_mapping = await response.json();
  genre_mapping.sort((a, b) => b.ng.length - a.ng.length);

  const replaceText = (text) => {
    let newText = text;
    let changed = false;

    genre_mapping.forEach(({ ng, ok }) => {
      if (newText.includes(ng)) {
        if (ng === "逆レ") {
          // 2回目以降の変換がどうにもならないので特殊対応
          const parts = newText.split(" ");
          newText = parts.map(word => word === "逆レ" ? ok : word).join(" ");
          changed = true;
        } else {
          newText = newText.replace(new RegExp(ng, "g"), ok);
          changed = true;
        }
      }
    });

    return changed ? newText : null;
  };

  const revival = () => {
    const elements = document.querySelectorAll("a.btn_default, a[href='#'], a[href*='genre/'], #modal_area_genre li > a, ul.select_content > li");

    elements.forEach(element => {
      element.childNodes.forEach(node => {
        const newText = replaceText(node.textContent);
        if (newText !== null) {
          node.textContent = newText;
        }
      });
    });
  };

  revival();

  const observer = new MutationObserver(() => {
    revival();
  });

  // 検索タグ
  const search_tag_items = document.querySelector(".search_tag_items");
  if (search_tag_items) {
    observer.observe(search_tag_items, { childList: true, subtree: true });
  }

  // 左メニュー
  const left_module = document.querySelector('#left .left_module_content');
  if (left_module) {
    observer.observe(left_module, { childList: true, subtree: true });
  }

  // オーバーレイ
  const search_menu_overlay = document.querySelector('#container > div:not([id]):not([class]):not([name]):not([style])');
  if (search_menu_overlay) {
    observer.observe(search_menu_overlay, { childList: true, subtree: true });
  }

  // こだわり検索
  const modal_area_genre = document.querySelector('#modal_area_genre');
  if (modal_area_genre) {
    observer.observe(modal_area_genre, { childList: true, subtree: true });
  }

  // 条件選択時
  const waitForSelectContent = () => {
    const openModalGenre = document.querySelector("#open_modal_genre");

    if (!openModalGenre) {
      console.warn("`#open_modal_genre` がまだ存在しません。");
      return;
    }

    const parentElement = openModalGenre.parentNode;

    const checkAndObserve = () => {
      const selectContent = parentElement.querySelector("ul.select_content");

      if (selectContent) {
        revival();
        observer.observe(selectContent, { childList: true, subtree: true, characterData: true });
        modalObserver.disconnect();
      }
    };

    const modalObserver = new MutationObserver(() => {
      checkAndObserve();
    });

    modalObserver.observe(parentElement, { childList: true, subtree: true });

    checkAndObserve();
  };

  if (document.querySelector("#open_modal_genre")) {
    waitForSelectContent();
  }

})();
