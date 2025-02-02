const DLSITE_ENSPELL_STORAGE_KEY = 'dlsite_enspell_options';

export const updateSettings = (newSettings) => {
  chrome.storage.sync.get(DLSITE_ENSPELL_STORAGE_KEY, (data) => {
    let currentSettings = data[DLSITE_ENSPELL_STORAGE_KEY] || {};

    let updatedSettings = { 
      ...currentSettings,
      ...newSettings
    };

    chrome.storage.sync.set({ [DLSITE_ENSPELL_STORAGE_KEY]: updatedSettings }, () => {
      // console.log("設定が更新されました:", updatedSettings);
    });
  });
};

export const getSettings = (callback) => {
  chrome.storage.sync.get(DLSITE_ENSPELL_STORAGE_KEY, (data) => {
    callback(data[DLSITE_ENSPELL_STORAGE_KEY] || {});
  });
};