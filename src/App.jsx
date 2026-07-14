import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Home from './screens/Home';
import Chats from './screens/Chats';
import ChatRoom from './screens/ChatRoom';
import Posts from './screens/Posts';
import Services from './screens/Services';
import Profile from './screens/Profile';
import ArticleView from './screens/ArticleView';
import DMChat from './screens/DMChat';

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
  return (
    <BrowserRouter>
      <div className="device">
        <AppRoutes />
      </div>
    </BrowserRouter>
  );
}
