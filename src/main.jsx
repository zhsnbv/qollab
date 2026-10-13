// Inter подключаем локально: в стеке он был указан, но не загружался —
// и весь интерфейс рисовался системным шрифтом.
import '@fontsource-variable/inter';
import { StrictMode, Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/tokens.css';
import './styles/companies.css';
// Web review and state frames must not load the mobile app's global styles.
// Keeping separate entry graphs also preserves the standalone handoff's CSS order.
const path = window.location.pathname;
const App = path === '/handoff/publications-web'
  ? lazy(() => import('./gallery/publications-web/PublicationsWeb'))
  : path === '/handoff/publication-state'
    ? lazy(() => import('./gallery/publication-screens/PublicationStateFrame'))
    : lazy(() => import('./App.jsx'));

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Suspense fallback={null}><App /></Suspense>
  </StrictMode>,
);
