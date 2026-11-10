import path from 'path';
import { readFileSync } from 'node:fs';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const apiUrlLine = readFileSync(path.resolve(__dirname, 'env'), 'utf8')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => !line.startsWith('#'))
      .filter((line) => /^VITE_API_BASE_URL\s*=/.test(line))
      .pop();

    if (!apiUrlLine) {
      throw new Error('VITE_API_BASE_URL is missing from the env file.');
    }

    const apiBaseUrl = apiUrlLine
      .replace(/^VITE_API_BASE_URL\s*=\s*/, '')
      .replace(/,$/, '')
      .replace(/^(['"])(.*)\1$/, '$2')
      .trim();

    if (!apiBaseUrl) {
      throw new Error('VITE_API_BASE_URL in the env file must not be empty.');
    }

    return {
      define: {
        __API_BASE_URL__: JSON.stringify(apiBaseUrl),
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
