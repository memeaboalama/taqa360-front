import React from 'react';
import '@fontsource/cairo/400.css';
import '@fontsource/cairo/600.css';
import '@fontsource/cairo/700.css';
import './src/index.css';
import ReactDOM from 'react-dom/client';
import App from './src/app/App';
import { APP_BRAND } from './src/core/config/brand';

document.documentElement.dataset.brand = APP_BRAND;
document.title = APP_BRAND === 'huloolcom' ? 'Huloolcom' : 'TAQA';
document.querySelector('meta[name="theme-color"]')?.setAttribute(
  'content',
  APP_BRAND === 'huloolcom' ? '#F8C421' : '#306FAA'
);
document.querySelector('link[rel="icon"]')?.setAttribute(
  'href',
  APP_BRAND === 'huloolcom' ? '/assets/logo-huloolcom.png' : '/assets/logo.png'
);
document.querySelector('link[rel="apple-touch-icon"]')?.setAttribute(
  'href',
  APP_BRAND === 'huloolcom' ? '/assets/logo-huloolcom.png' : '/assets/logo.png'
);

// Service worker registration disabled to avoid caching/stale data issues during active development
// if ('serviceWorker' in navigator) {
//   window.addEventListener('load', () => {
//     navigator.serviceWorker.register('/service-worker.js')
//       .then(registration => {
//         console.log('ServiceWorker registration successful with scope: ', registration.scope);
//       })
//       .catch(error => {
//         console.log('ServiceWorker registration failed: ', error);
//       });
//   });
//}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
