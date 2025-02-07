import React from 'react';
import { Checkbox, Stack } from '@mantine/core';
import useSettings from '../hooks/useSettings';


const GenreRevival = () => {

  const { settings, handleChange } = useSettings({
    enable_genre_revival: false,
  });

  return (
    <Stack>
      <h2>規制ワード変換設定</h2>
      <p>規制ワードを表記だけ元に戻します（検索時の入力に未対応です）</p>
      <Checkbox
        label="規制ワードを変換する"
        checked={settings.enable_genre_revival}
        onChange={handleChange('enable_genre_revival')}
      />

    </Stack>
  );
};

export default GenreRevival;