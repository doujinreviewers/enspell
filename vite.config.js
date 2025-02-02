import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { copyFileSync, mkdirSync } from 'fs';

export default defineConfig({
  root: './src',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        'content/circle_filter': path.resolve(__dirname, 'src/content/circle_filter.js'),
        'content/search': path.resolve(__dirname, 'src/content/search.js'),
        'content/announcepage': path.resolve(__dirname, 'src/content/announcepage.js'),
        'content/newpage': path.resolve(__dirname, 'src/content/newpage.js'),
        'content/rankingpage': path.resolve(__dirname, 'src/content/rankingpage.js'),
        'content/toppage': path.resolve(__dirname, 'src/content/toppage.js'),
        'content/estimate': path.resolve(__dirname, 'src/content/estimate.js'),
        'options/options': path.resolve(__dirname, 'src/options/options.html'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.names[0].endsWith('.css')) {
            return 'options/[name].[ext]';
          }
          return '[name].[ext]';
        }
      }
    }
  },

  plugins: [react()]

});
