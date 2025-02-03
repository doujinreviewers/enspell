import React from 'react';
import { List, ThemeIcon, Text, Anchor, Stack, Title, Divider } from '@mantine/core';
import { IconCircleCheck, IconBrandGithub, IconBrandX, IconLink, IconInfoOctagon } from '@tabler/icons-react';

const Home = () => {
  return (
    <Stack gap="xs">
      <p>左メニューから各種設定が可能です（保存ボタンなし、即時反映）</p>

      <Divider my="md" />

      <Title order={3}>サークルフィルタリング設定</Title>
      <p>DLsiteの画面上で非表示にするサークルを指定できます</p>
      <Title order={3}>レビュアーフィルタリング設定</Title>
      <p>DLsiteの画面上で非表示にするレビュアーを指定できます</p>
      <Title order={3}>売上推計表示設定</Title>
      <p>DLsiteの作品ページにその作品の推定売上額が表示されるようになります</p>

      <Divider my="md" />

      <p>
        Developed by <Text
          size="md"
          fw={900}
          variant="gradient"
          gradient={{ from: 'orange', to: 'red', deg: 90 }}
          span={true}
        >
          同人Reviewers
        </Text>
      </p>
      <List
        spacing="xs"
        size="sm"
        center
      >
        <List.Item
          icon={
            <ThemeIcon color="blue" size={24} radius="xl">
              <IconLink size={16} />
            </ThemeIcon>
          }
        >
          <Anchor href="https://ci-en.dlsite.com/creator/4091" target="_blank">
            https://ci-en.dlsite.com/creator/4091
          </Anchor>
        </List.Item>
        <List.Item
          icon={
            <ThemeIcon color="blue" size={24} radius="xl">
              <IconBrandGithub size={16} />
            </ThemeIcon>
          }
        >
          <Anchor href="https://github.com/doujinreviewers" target="_blank">
            https://github.com/doujinreviewers
          </Anchor>
        </List.Item>
        <List.Item
          icon={
            <ThemeIcon color="blue" size={24} radius="xl">
              <IconBrandX size={16} />
            </ThemeIcon>
          }
        >
          <Anchor href="https://x.com/doujinreviewers" target="_blank">
            https://x.com/doujinreviewers
          </Anchor>
        </List.Item>
      </List>
    </Stack>
  );
};

export default Home;