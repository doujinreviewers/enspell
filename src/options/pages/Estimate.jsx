import React from 'react';
import { Stack, Radio, Group, Text, Checkbox } from '@mantine/core';
import useSettings from '../hooks/useSettings';
import '../../public/style.css';

const format_list = [
  { format: '123,456円' },
  { format: '12万3456円' },
];

const text_design_list = [
  { format: '普通のテキスト' },
  { format: 'ゴールドのテキスト' },
];

const Estimate = () => {
  const { settings, handleChange, handleRadioChange } = useSettings({
    show_estimate: false,
    estimate_format: format_list[0].format,
    estimate_text_design: text_design_list[0].format,
  });

  const format_cards = format_list.map((item) => (
    <Radio.Card
      className={`root ${settings.estimate_format === item.format ? "selected" : ''}`}
      radius="md"
      value={item.format}
      key={item.format}
    >
      <Group wrap="nowrap" align="flex-start">
        <Radio.Indicator />
        <div>
          <Text className="label">{item.format}</Text>
        </div>
      </Group>
    </Radio.Card>
  ));

  const text_design_cards = text_design_list.map((item) => (
    <Radio.Card
      className={`root ${settings.estimate_text_design === item.format ? "selected" : ''}`}
      radius="md"
      value={item.format}
      key={item.format}
    >
      <Group wrap="nowrap" align="flex-start">
        <Radio.Indicator />
        <div>
          <Text className="label">{item.format}</Text>
        </div>
      </Group>
    </Radio.Card>
  ));

  return (
    <Stack>
      <h2>売上推計設定</h2>

      {settings.show_estimate && (
        <div
          className={`preview ${
            settings.estimate_text_design === 'ゴールドのテキスト' ? "gold" : ''
          }`}
        >
          {settings.estimate_format}
        </div>
      )}

      {!settings.show_estimate && <div>売上推計が非表示です</div>}

      <Checkbox
        label="売上推計を表示する"
        checked={settings.show_estimate}
        onChange={handleChange('show_estimate')}
      />

      <Radio.Group
        value={settings.estimate_format}
        onChange={handleRadioChange('estimate_format')}
        label="フォーマット"
      >
        <Stack pt="md" gap="xs">
          {format_cards}
        </Stack>
      </Radio.Group>

      <Radio.Group
        value={settings.estimate_text_design}
        onChange={handleRadioChange('estimate_text_design')}
        label="テキストデザイン"
      >
        <Stack pt="md" gap="xs">
          {text_design_cards}
        </Stack>
      </Radio.Group>
    </Stack>
  );
};

export default Estimate;
