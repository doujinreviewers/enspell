import React from 'react';
import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';

const RootLayout = ({ children }) => {
  return (
    <MantineProvider>
      {children}
    </MantineProvider>
  );
};

export default RootLayout;
