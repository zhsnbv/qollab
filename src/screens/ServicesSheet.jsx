import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { serviceCategories } from '../data/services';
import './ServicesSheet.css';

// Боттом-шит «Все сервисы» (Figma node 23762-7978) — вызывается с Главной по
// тапу на плитку «Все сервисы». В отличие от Статьи/Чата (которые перекрывают
// всё, включая таб-бар), шит держится на z-index ниже плавающего BottomNav
// (см. .svcsheet-overlay) — бар остаётся виден и кликабелен поверх подложки,
// как в макете.
export default function ServicesSheet() {
  const navigate = useNavigate();
  const [view, setView] = useState('list');
  const [closing, setClosing] = useState(false);

  const close = () => {
    setClosing(true);
    setTimeout(() => navigate(-1), 260);
  };

  return (
    <div className={`svcsheet-overlay ${closing ? 'closing' : ''}`} onClick={close}>
      <div className={`svcsheet ${closing ? 'closing' : ''}`} onClick={(e) => e.stopPropagation()}>
        <span className="svcsheet-handle" />
        <div className="svcsheet-header">
          <h2 className="svcsheet-title">Все сервисы</h2>
          <div className="view-toggle">
            <button
              className={`view-toggle-btn ${view === 'grid' ? 'active' : ''}`}
              onClick={() => setView('grid')}
              aria-label="Сетка"
            >
              <span className="toggle-ico toggle-ico--grid" />
            </button>
            <button
              className={`view-toggle-btn ${view === 'list' ? 'active' : ''}`}
              onClick={() => setView('list')}
              aria-label="Список"
            >
              <span className="toggle-ico toggle-ico--list" />
            </button>
          </div>
        </div>

        <div className="svcsheet-body">
          {serviceCategories.map((cat) => (
            <section className="svcsheet-section" key={cat.title}>
              <h3 className="svcsheet-section-title">{cat.title}</h3>
              <div className={view === 'list' ? 'svcsheet-list' : 'svcsheet-grid'}>
                {cat.items.map((item) => (
                  <button className="svcsheet-item" key={item.id}>
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
