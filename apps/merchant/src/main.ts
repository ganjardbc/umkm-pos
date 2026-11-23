// register the shared API client before anything can call it
import './plugins/axios.ts';

// global components
import './core/global-components.ts';

// global styles
import './core/global-styles.ts';

// core vue
import './core/initiate.ts';

// PWA: app-shell cache only (production builds)
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((error) => console.error('SW registration failed:', error));
  });
}
