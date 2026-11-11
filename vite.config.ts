import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const apiBaseUrl = env.VITE_API_BASE_URL?.trim();
    const brand = env.VITE_BRAND?.trim();

    if (!apiBaseUrl) {
      throw new Error(`VITE_API_BASE_URL is missing from .env.${mode}.`);
    }

    if (brand !== 'taqa360' && brand !== 'huloolcom') {
      throw new Error(`VITE_BRAND in .env.${mode} must be taqa360 or huloolcom.`);
    }

    return {
      plugins: [
        {
          name: 'brand-page-title',
          transformIndexHtml(html) {
            const appName = brand === 'huloolcom' ? 'Huloolcom' : 'TAQA 360';
            return html.replace(/_{1,2}APP_NAME_{1,2}/g, appName);
          }
        }
      ],
      define: {
        __API_BASE_URL__: JSON.stringify(apiBaseUrl),
        __APP_BRAND__: JSON.stringify(brand),
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
