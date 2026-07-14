import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Home from './screens/Home';
import Chats from './screens/Chats';
import ChatRoom from './screens/ChatRoom';
import Posts from './screens/Posts';
import Services from './screens/Services';
import Profile from './screens/Profile';
import ArticleView from './screens/ArticleView';
import DMChat from './screens/DMChat';
import Splash from './components/Splash';
import './App.css';

// Сколько держим сплэш, прежде чем он уедет вниз (см. Splash.css) и контент
// «главной» проявится — не медленно, но подчёркнуто плавно.
const SPLASH_HOLD_MS = 1400;
const SPLASH_EXIT_MS = 1120;

// Статья/чат открываются поверх текущего экрана (см. slide-in анимации в их
// CSS), поэтому рендерим их как отдельный слой над «фоновым» location —
// экран под ними остаётся смонтированным и не теряет состояние/скролл при
// открытии и последующем «назад».
function AppRoutes() {
  const location = useLocation();
  const background = location.state?.background;

  return (
    <>
      <Routes location={background || location}>
        <Route path="/" element={<Home />} />
        <Route path="/posts" element={<Posts />} />
        <Route path="/services" element={<Services />} />
        <Route path="/chats" element={<Chats />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
      <Routes>
        <Route path="/chats/prodev" element={<ChatRoom />} />
        <Route path="/chats/dm" element={<DMChat />} />
        <Route path="/article" element={<ArticleView />} />
      </Routes>
    </>
  );
}

export default function App() {
  const [exiting, setExiting] = useState(false);
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setExiting(true), SPLASH_HOLD_MS);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!exiting) return;
    const t = setTimeout(() => setSplashDone(true), SPLASH_EXIT_MS);
    return () => clearTimeout(t);
  }, [exiting]);

  return (
    <BrowserRouter>
      <div className="device">
        <div className={`app-reveal${exiting ? ' app-reveal--in' : ''}`}>
          {/* Роуты монтируем только в момент ухода сплэша — иначе таймер
              скелетона «Главной» успевает истечь ещё под непрозрачным
              сплэшем, и после его ухода скелетон просто не виден. */}
          {exiting && <AppRoutes />}
        </div>
        {!splashDone && <Splash exiting={exiting} />}
      </div>
    </BrowserRouter>
  );
}
