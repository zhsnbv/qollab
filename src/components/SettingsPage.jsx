import { useLocation, useNavigate } from 'react-router-dom';
import { CaretLeft } from '@phosphor-icons/react';
import { useScrolled } from '../utils/useScrolled';
import { settingsParentPath } from '../utils/settingsNavigation';
import '../screens/Settings.css';

// Shared settings header and scroll region. Route transitions belong to
// SettingsRouteStack so Back changes history immediately without a timer.
export default function SettingsPage({ title, children, contentClassName = '' }) {
  const [scrolled, onScroll] = useScrolled();
  const navigate = useNavigate();
  const location = useLocation();

  const close = () => {
    if (location.state?.background || window.history.state?.idx > 0) navigate(-1);
    else navigate(settingsParentPath(location.pathname), { replace: true, state: { settingsTransition: 'pop' } });
  };

  return (
    <div className="settings">
      <header className={`st-top ${scrolled ? 'hdr-shadow' : ''}`}>
        <button className="st-back" onClick={close} aria-label="Назад"><CaretLeft size={24} /></button>
        <h1 className="st-title">{title}</h1>
        <span className="st-back hdr-spacer" aria-hidden="true" />
      </header>
      <div className={`st-scroll ${contentClassName}`.trim()} onScroll={onScroll}>
        {children}
        <div className="st-bottom-spacer" />
      </div>
    </div>
  );
}
