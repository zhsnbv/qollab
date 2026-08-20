import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { X, Link as LinkIcon } from '@phosphor-icons/react';
import TopBar, { DotsIcon } from '../components/TopBar';
import ScreenMenu from '../components/ScreenMenu';
import { banners } from '../data/banners';
import './BannerDetail.css';

// Полноэкранный шит баннера (Figma node 23765-10237) — вызывается с Главной
// по тапу на промо-карточку. Текст и картинка соответствуют конкретному
// тапнутому баннеру (см. src/data/banners.js), а не общему плейсхолдеру.
// Как и ServicesSheet/Search, держится ниже плавающего таб-бара по z-index —
// бар остаётся виден поверх (см. макет: там тоже показан активным «Главная»).
export default function BannerDetail() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const banner = banners.find((b) => b.id === state?.id) || banners[0];
  const [closing, setClosing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const close = () => {
    setClosing(true);
    setTimeout(() => navigate(-1), 260);
  };

  return (
    <div className={`bannerdetail ${closing ? 'closing' : ''}`}>
      {/* Тот же TopBar, что и на Главной, и рендерится статично (без анимации):
          он пиксель-в-пиксель совпадает с хедером под оверлеем, поэтому выглядит
          так, будто хедер остался на месте. Раньше свой хедер выезжал вместе с
          контентом и на секунду двоился с хедером Главной. */}
      <div className="topbar-slot">
        <TopBar logo actions={<button className="topbar-btn" aria-label="Меню" onClick={() => setMenuOpen(true)}><DotsIcon /></button>} />
      </div>

      <div className="bd-sheet">
        <div className="bd-scroll">
          <div className="bd-hero" style={{ background: banner.bg }}>
            <span className={`bd-badge bd-badge--${banner.badgeVariant}`}>{banner.badge}</span>
            <h1 className={`bd-hero-title ${banner.textOnDark ? 'on-dark' : ''}`}>{banner.title}</h1>
            <img className="bd-hero-img" src={banner.img} alt="" />
            <button className="bd-close" onClick={close} aria-label="Закрыть"><X size={20} weight="bold" color="#fff" /></button>
          </div>

          <div className="bd-content">
            <h2 className="bd-headline">{banner.title}</h2>
            {banner.body.map((p, i) => <p className="bd-text" key={i}>{p}</p>)}
            <div className="bd-link">
              <LinkIcon size={20} color="var(--color-weak)" />
              <span>{banner.link}</span>
            </div>
          </div>

          <div className="bd-cta-wrap">
            <button className="bd-cta">{banner.cta}</button>
          </div>
        </div>
      </div>

      <ScreenMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  );
}
