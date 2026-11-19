const DLSITE_ENSPELL_STORAGE_KEY = 'dlsite_enspell_options';
export { DLSITE_ENSPELL_STORAGE_KEY };

export const createSettingsStore = (storage, runtime = {}) => {
  let queue = Promise.resolve();
  const read = () => new Promise((resolve, reject) => {
    storage.get(DLSITE_ENSPELL_STORAGE_KEY, data => {
      const error = runtime.lastError;
      if (error) reject(new Error(error.message));
      else resolve(data[DLSITE_ENSPELL_STORAGE_KEY] || {});
    });
  });
  return {
    updateSettings(newSettings) {
      // 入力の後続編集から切り離し、read-modify-writeをこの画面内で直列化する。
      const patch = structuredClone(newSettings);
      const pending = queue.then(async () => {
        const current = await read();
        await new Promise((resolve, reject) => {
          storage.set({ [DLSITE_ENSPELL_STORAGE_KEY]: { ...current, ...patch } }, () => {
            const error = runtime.lastError;
            if (error) reject(new Error(error.message));
            else resolve();
          });
        });
      });
      // 1回の保存失敗で以降の変更を止めない。
      queue = pending.catch(error => console.error('設定の保存に失敗しました', error));
      return pending;
    },
    getSettings(callback) {
      return queue.then(read).then(callback);
    },
  };
};

let store;
const getStore = () => store ||= createSettingsStore(chrome.storage.local, chrome.runtime);
export const updateSettings = newSettings => getStore().updateSettings(newSettings);
export const getSettings = callback => getStore().getSettings(callback);
