import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ViewToggle from '../components/ViewToggle';
import { serviceCategories } from '../data/services';
import './ServicesSheet.css';
import SheetTop from '../components/SheetTop';
import useSheetSwipe from '../utils/useSheetSwipe';

// Боттом-шит «Все сервисы» (Figma node 23762-7978) — вызывается с Главной по
// тапу на плитку «Все сервисы». В отличие от Статьи/Чата (которые перекрывают
// всё, включая таб-бар), шит держится на z-index ниже плавающего BottomNav
// (см. .svcsheet-overlay) — бар остаётся виден и кликабелен поверх подложки,
// как в макете.
export default function ServicesSheet() {
  const navigate = useNavigate();
  const location = useLocation();
  const [view, setView] = useState('list');
  const [closing, setClosing] = useState(false);

  const close = () => {
    setClosing(true);
    setTimeout(() => navigate(-1), 260);
  };
  const swipe = useSheetSwipe(close);

  // Мини-апп открываем поверх Главной, а не поверх шита: пробрасываем тот же
  // background, с которым открыли сам шит, — иначе после «назад» из мини-аппа
  // экран под ним перестал бы матчиться и Главная пропала бы.
  const openApp = (app) => {
    const background = location.state?.background || { pathname: '/' };
    navigate(`/app/${app}`, { state: { background }, replace: true });
  };

  return (
    <div className={`svcsheet-overlay ${closing ? 'closing' : ''}`} onClick={close}>
      <div
        className={`svcsheet ${closing ? 'closing' : ''} ${swipe.className}`}
        style={swipe.style}
        onClick={(e) => e.stopPropagation()}
      >
        <SheetTop onClose={close} swipe={swipe}>
          <h2 className="svcsheet-title">Все сервисы</h2>
          <ViewToggle view={view} onChange={setView} />
        </SheetTop>

        <div className="svcsheet-body">
          {serviceCategories.map((cat) => (
            <section className="svcsheet-section" key={cat.title}>
              <h3 className="svcsheet-section-title">{cat.title}</h3>
              <div className={view === 'list' ? 'svcsheet-list' : 'svcsheet-grid'}>
                {cat.items.map((item) => (
                  <button className="svcsheet-item" key={item.id} onClick={() => openApp(item.app || item.id)}>
                    <img className="svcsheet-icon" src={item.img} alt="" />
                    <span className="svcsheet-texts">
                      <span className="svcsheet-name">{item.name}</span>
                      {view === 'list' && <span className="svcsheet-sub">{item.sub}</span>}
                    </span>
                  </button>
                ))}
              </div>
            </section>
          ))}
          <div className="svcsheet-bottom-spacer" />
        </div>
      </div>
    </div>
  );
}
