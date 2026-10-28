import React from 'react';
import '@fontsource/cairo/400.css';
import '@fontsource/cairo/600.css';
import '@fontsource/cairo/700.css';
import './src/index.css';
import ReactDOM from 'react-dom/client';
import App from './src/app/App';

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
