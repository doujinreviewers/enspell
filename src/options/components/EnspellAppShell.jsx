import { useState } from 'react';
import { AppShell, Burger, Group, Badge, NavLink } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconHome2, IconCancel, IconCoinYen, IconMessageX } from '@tabler/icons-react';
import Home from '../pages/Home';
import CircleFilter from '../pages/CircleFilter';
import Estimate from '../pages/Estimate';
import ReviewerFilter from '../pages/ReviewerFilter';

export function EnspellAppShell() {
  const [opened, { toggle }] = useDisclosure();
  const [activePage, setActivePage] = useState('home');

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 300, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          DLsite Enspell 設定画面
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="md">
        <NavLink
          label="ホーム"
          leftSection={<IconHome2 size={16} stroke={1.5} />}
          active={activePage === 'home'}
          onClick={() => setActivePage('home')}
        />
        <NavLink
          label="サークルフィルタリング設定"
          leftSection={<IconCancel size={16} stroke={1.5} />}
          active={activePage === 'circle_filter'}
          onClick={() => setActivePage('circle_filter')}
        />
        <NavLink
          label="レビュアーフィルタリング設定"
          leftSection={<IconMessageX size={16} stroke={1.5} />}
          active={activePage === 'reviewer_filter'}
          onClick={() => setActivePage('reviewer_filter')}
        />
        <NavLink
          label="売上推計表示設定"
          leftSection={<IconCoinYen size={16} stroke={1.5} />}
          active={activePage === 'estimate'}
          onClick={() => setActivePage('estimate')}
        />
      </AppShell.Navbar>
      <AppShell.Main>
        {activePage === 'home' && <Home />}
        {activePage === 'circle_filter' && <CircleFilter />}
        {activePage === 'estimate' && <Estimate />}
        {activePage === 'reviewer_filter' && <ReviewerFilter />}
      </AppShell.Main>
    </AppShell>
  );
}