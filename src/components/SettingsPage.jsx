import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CaretLeft } from '@phosphor-icons/react';
import { useScrolled } from '../utils/useScrolled';
import '../screens/Settings.css';

// Каркас страницы настроек: шапка с «назад», заголовок и прокрутка. Все
// подэкраны настроек устроены одинаково, поэтому анимация выезда, тень при
// скролле и геометрия шапки живут здесь, а не в шести копиях.
export default function SettingsPage({ title, children }) {
  const [scrolled, onScroll] = useScrolled();
  const navigate = useNavigate();
  const location = useLocation();
  const [closing, setClosing] = useState(false);

  const close = () => {
    setClosing(true);
    setTimeout(() => location.state?.background || window.history.state?.idx > 0 ? navigate(-1) : navigate('/settings', { replace: true }), 180);
  };

  return (
    <div className={`settings ${closing ? 'closing' : ''}`}>
      <header className={`st-top ${scrolled ? 'hdr-shadow' : ''}`}>
        <button className="st-back" onClick={close} aria-label="Назад"><CaretLeft size={24} /></button>
        <h1 className="st-title">{title}</h1>
        <span className="st-back hdr-spacer" aria-hidden="true" />
      </header>
      <div className="st-scroll" onScroll={onScroll}>
        {children}
        <div className="st-bottom-spacer" />
      </div>
    </div>
  );
}
