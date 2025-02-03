import React from 'react';
import { Checkbox, Stack, Textarea } from '@mantine/core';
import useSettings from '../hooks/useSettings';


const ReviewerFilter = () => {

  const { settings, handleChange, handleTextChange } = useSettings({
    ng_reviewers: '',
    show_reviewer_ng_count: false,
    enable_product: false,
    enable_review_list: false,
  });

  return (
    <Stack>
      <h2>レビュアーフィルタリング設定</h2>
      <div>
        <Textarea
          label="非表示にするレビュアーの名前またはREVを含むレビュアーのID"
          description="1行に1レビュアーを記入してください"
          placeholder={`レビュアー1\nREV123456`}
          autosize
          minRows={4}
          maxRows={18}
          value={settings.ng_reviewers}
          onChange={handleTextChange('ng_reviewers')}
        />
      </div>

      <h2>非表示件数の表示設定</h2>
      <Checkbox
        label="非表示にした件数を表示する"
        checked={settings.show_reviewer_ng_count}
        onChange={handleChange('show_reviewer_ng_count')}
      />

      <h2>非表示設定を適用するページ</h2>
      <Checkbox
        label="作品ページ"
        checked={settings.enable_product}
        onChange={handleChange('enable_product')}
      />
      <Checkbox
        label="作品レビュー一覧ページ"
        checked={settings.enable_review_list}
        onChange={handleChange('enable_review_list')}
      />
    </Stack>
  );
};

export default ReviewerFilter;