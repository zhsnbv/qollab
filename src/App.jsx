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
import ServicesSheet from './screens/ServicesSheet';
import Search from './screens/Search';
import BannerDetail from './screens/BannerDetail';
import Favorites from './screens/Favorites';
import MiniApp from './screens/MiniApp';
import Notifications from './screens/Notifications';
import NotificationGroup from './screens/NotificationGroup';
import ChannelView from './screens/ChannelView';
import EventView from './screens/EventView';
import ChatProfile from './screens/ChatProfile';
import PersonProfile from './screens/PersonProfile';
import GroupProfile from './screens/GroupProfile';
import NewChat from './screens/NewChat';
import ChatSearch from './screens/ChatSearch';
import Settings from './screens/Settings';
import ProfilePhoto from './screens/ProfilePhoto';
import Auth from './screens/Auth';
import Splash from './components/Splash';
import BottomNav from './components/BottomNav';
import { FavoritesProvider } from './context/FavoritesContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CompanyProvider } from './context/CompanyContext';
import { useViewportFit } from './utils/useKeyboardInset';
import { applyTheme, getThemeMode, watchSystemTheme } from './utils/theme';
import './App.css';

// Роуты с таб-баром. Оверлеи (чат, статья, шит сервисов, поиск...) своего бара
// не показывают напрямую, но и не размонтируют его: они открываются поверх
// текущего экрана через background-трюк (см. AppRoutes) и либо полностью
// перекрывают бар по z-index (Статья, Чат, Избранное), либо оставляют его
// плавать поверх дна (Сервисы, Поиск, Баннер) — см. их CSS.
const TAB_ROUTES = ['/', '/posts', '/services', '/chats', '/profile'];

// Сколько держим сплэш, прежде чем он уедет вниз (см. Splash.css) и контент
// «главной» проявится — не медленно, но подчёркнуто плавно.
const SPLASH_HOLD_MS = 1400;
const SPLASH_EXIT_MS = 747;

// Статья/чат открываются поверх текущего экрана (см. slide-in анимации в их
// CSS), поэтому рендерим их как отдельный слой над «фоновым» location —
// экран под ними остаётся смонтированным и не теряет состояние/скролл при
// открытии и последующем «назад».
// Пока не вошли — вместо приложения показываем флоу авторизации целиком.
function Shell() {
  const { authed } = useAuth();
  return authed ? <AppRoutes /> : <Auth />;
}

// Роуты оверлеев вынесены отдельно: их рендерим дважды — текущий экран и,
// если он открыт поверх другого оверлея, его подложку.
function OverlayRoutes({ location }) {
  return (
    <Routes location={location}>
        <Route path="/chats/prodev" element={<ChatRoom />} />
        <Route path="/chats/dm" element={<DMChat />} />
        <Route path="/article" element={<ArticleView />} />
        {/* Шит с Главной — быстрый доступ, не уходя с экрана. Путь отдельный от
            вкладки /services: каталог тот же, но это разные способы открыть его. */}
        <Route path="/services/sheet" element={<ServicesSheet />} />
        <Route path="/search" element={<Search />} />
        <Route path="/banner" element={<BannerDetail />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/notifications/:groupId" element={<NotificationGroup />} />
        <Route path="/channel/:channelId" element={<ChannelView />} />
        <Route path="/event" element={<EventView />} />
        <Route path="/chat-profile" element={<ChatProfile />} />
        <Route path="/person" element={<PersonProfile />} />
        <Route path="/group" element={<GroupProfile />} />
        <Route path="/new-chat" element={<NewChat />} />
        <Route path="/chat-search" element={<ChatSearch />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/profile/photo" element={<ProfilePhoto />} />
        {/* Мини-аппы: уровень навигации зашит в путь (/app/mytasks/it/closed),
            поэтому «назад» и история браузера работают без своего стека. */}
        <Route path="/app/*" element={<MiniApp />} />
      </Routes>
  );
}

function AppRoutes() {
  const location = useLocation();
  const background = location.state?.background;
  // Таб-бар рендерим здесь, а не внутри TabLayout: так он переживает смену
  // роута и плашка успевает доехать до нового таба, а не создаётся заново.
  const showNav = TAB_ROUTES.includes((background || location).pathname);

  // Под оверлеем может лежать не вкладка, а другой оверлей: из чата
  // открывается профиль, и чат должен остаться под ним. Иначе на время
  // профиля под ним рендерится список чатов и мелькает при возврате.
  const underOverlay = background && !TAB_ROUTES.includes(background.pathname) ? background : null;
  const tabLocation = underOverlay?.state?.background || background || location;

  return (
    <>
      <Routes location={tabLocation}>
        <Route path="/" element={<Home />} />
        <Route path="/posts" element={<Posts />} />
        <Route path="/services" element={<Services />} />
        <Route path="/chats" element={<Chats />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
      {underOverlay && <OverlayRoutes location={underOverlay} />}
      <OverlayRoutes />
      {showNav && <BottomNav />}
    </>
  );
}

export default function App() {
  useViewportFit();
  // Режим оформления уже применён инлайн-скриптом; здесь только подписка на
  // системную тему — она нужна, пока выбран режим «автоматически».
  useEffect(() => {
    applyTheme(getThemeMode());
    return watchSystemTheme(getThemeMode);
  }, []);
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
      <CompanyProvider><AuthProvider><FavoritesProvider>
        <div className="device">
          <div className={`app-reveal${exiting ? ' app-reveal--in' : ''}`}>
            {/* Роуты монтируем только в момент ухода сплэша — иначе таймер
                скелетона «Главной» успевает истечь ещё под непрозрачным
                сплэшем, и после его ухода скелетон просто не виден. */}
            {exiting && <Shell />}
          </div>
          {!splashDone && <Splash exiting={exiting} />}
        </div>
      </FavoritesProvider></AuthProvider></CompanyProvider>
    </BrowserRouter>
  );
}
