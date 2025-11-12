import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        allowedHosts: [
          'nonmischievous-unseducibly-alisia.ngrok-free.dev',
          '.ngrok-free.dev', // Allow all ngrok free hosts
          '.ngrok.io', // Allow all ngrok paid hosts
        ],
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.NODE_ENV': JSON.stringify(mode)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src'),
          '@config': path.resolve(__dirname, './config'),
          '@components': path.resolve(__dirname, './src/components'),
          '@services': path.resolve(__dirname, './src/services'),
        }
      },
      build: {
        outDir: 'dist',
        sourcemap: mode === 'development',
        rollupOptions: {
          output: {
            manualChunks: {
              'react-vendor': ['react', 'react-dom'],
              'genai-vendor': ['@google/genai'],
            },
          },
        },
      },
    };
});
