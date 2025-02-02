import React from 'react';
import { Checkbox, Stack, Textarea } from '@mantine/core';
import useSettings from '../hooks/useSettings';


const CircleFilter = () => {

  const { settings, handleChange, handleTextChange } = useSettings({
    ng_circles: '',
    show_ng_count: false,
    enable_top: false,
    enable_search: false,
    enable_ranking: false,
    enable_announce: false,
    enable_new: false,
  });

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
          onChange={handleTextChange('ng_circles')}
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