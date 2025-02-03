import React, { useState } from 'react';
import { Checkbox, Stack, TextInput, Group, Button } from '@mantine/core';
import useSettings from '../hooks/useSettings';
import CircleTable from '../components/CircleTable';


const CircleFilter = () => {

  const { settings, handleChange, handleBlockListChange } = useSettings({
    ng_circles: [],
    show_ng_count: false,
    enable_top: false,
    enable_search: false,
    enable_ranking: false,
    enable_announce: false,
    enable_new: false,
  });

  const [circleId, setCircleId] = useState('');
  const [circleName, setCircleName] = useState('');

  const handleAddCircle = () => {
    if (!circleId.trim() && !circleName.trim()) return;

    const newCircle = { id: circleId, name: circleName };
    const updatedCircles = [...settings.ng_circles, newCircle];

    handleBlockListChange('ng_circles', updatedCircles);
    setCircleId('');
    setCircleName('');
  };

  const handleUpdateCircles = (updatedCircles) => {
    handleBlockListChange('ng_circles', updatedCircles);
  };

  return (
    <Stack>
      <h2>サークルフィルタリング設定</h2>
      <p>サークルIDかサークル名のどちらかが設定されていれば動作します</p>
      <div>
        <Group align="flex-end">
          <TextInput
            label="サークルID"
            placeholder="RG123456"
            value={circleId}
            onChange={(e) => setCircleId(e.target.value)}
          />
          <TextInput
            label="サークル名"
            placeholder="サークル1"
            value={circleName}
            onChange={(e) => setCircleName(e.target.value)}
          />
          <Button onClick={handleAddCircle}>追加</Button>
        </Group>
      </div>
      <div>
        <CircleTable circles={settings.ng_circles} handleUpdateCircles={handleUpdateCircles} />
      </div>

      <h2>非表示件数の表示設定</h2>
      <Checkbox
        label="非表示にした件数を表示する"
        checked={settings.show_ng_count}
        onChange={handleChange('show_ng_count')}
      />

      <h2>非表示設定を適用するページ</h2>
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