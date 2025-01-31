import { defineConfig } from 'vite';
import path from 'path';
import { copyFileSync, mkdirSync } from 'fs';

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        circle_filter: path.resolve(__dirname, 'src/content/circle_filter.js'),
        options: path.resolve(__dirname, 'src/options/options.js'),
      },
      output: {
        entryFileNames: (chunk) => {
          return path.relative(path.resolve(__dirname, 'src'), chunk.facadeModuleId)
            .replace(/\\/g, '/');
        },
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]'
      }
    }
  },

  
  plugins: [
    // ビルドしないHTMLファイルをコピーするプラグイン
    {
      name: 'copy-options-html',
      closeBundle() {
        const optionsDir = path.resolve(__dirname, 'dist/options');
        mkdirSync(optionsDir, { recursive: true });

        copyFileSync(
          path.resolve(__dirname, 'src/options/options.html'),
          path.resolve(optionsDir, 'options.html')
        );

        console.log('✅ options.html has been copied to dist/options/');
      }
    }
  ]

});
