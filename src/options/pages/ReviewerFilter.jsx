import React, { useState } from 'react';
import { Checkbox, Stack, TextInput, Group, Button } from '@mantine/core';
import useSettings from '../hooks/useSettings';
import ReviewerTable from '../components/ReviewerTable';


const ReviewerFilter = () => {

  const { settings, handleChange, handleBlockListChange } = useSettings({
    ng_reviewers: [],
    show_ng_count: false,
    enable_top: false,
    enable_search: false,
    enable_ranking: false,
    enable_announce: false,
    enable_new: false,
  });

  const [reviewerId, setReviewerId] = useState('');
  const [reviewerName, setReviewerName] = useState('');

  const handleAddReviewer = () => {
    if (!reviewerId.trim() && !reviewerName.trim()) return;

    const newReviewer = { id: reviewerId, name: reviewerName };
    const updatedReviewers = [...settings.ng_reviewers, newReviewer];

    handleBlockListChange('ng_reviewers', updatedReviewers);
    setReviewerId('');
    setReviewerName('');
  };

  const handleUpdateReviewers = (updatedReviewers) => {
    handleBlockListChange('ng_reviewers', updatedReviewers);
  };

  return (
    <Stack>
      <h2>レビュアーフィルタリング設定</h2>
      <div>
        <Group align="flex-end">
          <TextInput
            label="レビュアーID"
            placeholder="REV123456"
            value={reviewerId}
            onChange={(e) => setReviewerId(e.target.value)}
          />
          <TextInput
            label="レビュアー名"
            placeholder="レビュアー1"
            value={reviewerName}
            onChange={(e) => setReviewerName(e.target.value)}
          />
          <Button onClick={handleAddReviewer}>追加</Button>
        </Group>
      </div>
      <div>
        <ReviewerTable reviewers={settings.ng_reviewers} handleUpdateReviewers={handleUpdateReviewers} />
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