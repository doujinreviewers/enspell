import React, { useState, useEffect } from 'react';
import { Checkbox, Stack, Textarea } from '@mantine/core';
import { updateSettings, getSettings } from '../storage';


const CircleFilter = () => {

  const [settings, setSettings] = useState({
    ng_circles: '',
    show_ng_count: false,
    enable_top: false,
    enable_search: false,
    enable_ranking: false,
    enable_announce: false,
    enable_new: false,
  });

  // 初回ロード時に設定を取得
  useEffect(() => {
    getSettings(setSettings);
  }, []);

  const handleChange = (key) => (event) => {
    const newSettings = { ...settings, [key]: event.target.checked };
    setSettings(newSettings);
    updateSettings({ [key]: event.target.checked });
  };

  return (
    <Stack>
      <h2>サークルフィルタリング設定</h2>
      <div>
        <Textarea
          label="非表示にするサークルの名前またはRGを含むサークルのID"
          description="1行に1サークルを記入してください"
          placeholder={`サークル1\nRG123456`}
          autosize
          minRows={4}
          value={settings.ng_circles}
          onChange={
            (event) => {
              const newText = event.target.value;
              const newSettings = { ...settings, ng_circles: newText };
              setSettings(newSettings);
              updateSettings({ ng_circles: newText });
            }
          }
        />
      </div>

      <h2>非表示件数の表示設定</h2>
      <Checkbox
        label="非表示にした件数を表示する"
        checked={settings.show_ng_count}
        onChange={handleChange('show_ng_count')}
      />

      <h2>非表示を行うページの設定</h2>
      <Checkbox
        label="トップページ"
        checked={settings.enable_top}
        onChange={handleChange('enable_top')}
      />
      <Checkbox
        label="検索結果ページ"
        checked={settings.enable_search}
        onChange={handleChange('enable_search')}
      />
      <Checkbox
        label="ランキングページ"
        checked={settings.enable_ranking}
        onChange={handleChange('enable_ranking')}
      />
      <Checkbox
        label="発売予告ページ"
        checked={settings.enable_announce}
        onChange={handleChange('enable_announce')}
      />
      <Checkbox
        label="発売カレンダーページ"
        checked={settings.enable_new}
        onChange={handleChange('enable_new')}
      />
    </Stack>
  );
};

export default CircleFilter;