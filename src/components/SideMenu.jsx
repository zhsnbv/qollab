import { useEffect, useState } from 'react';
import {
  X, CaretRight,
  FileText, Package, CalendarDots, GraduationCap, ClipboardText,
  CheckSquareOffset, AirplaneTilt, Umbrella, ClockCounterClockwise,
  FileArrowDown, IdentificationBadge, Wallet,
} from '@phosphor-icons/react';
import { workServices } from '../data/profile';
import './SideMenu.css';

const ICONS = {
  FileText, Package, CalendarDots, GraduationCap, ClipboardText,
  CheckSquareOffset, AirplaneTilt, Umbrella, ClockCounterClockwise,
  FileArrowDown, IdentificationBadge, Wallet,
};

// Боковое меню рабочих сервисов профиля. Открывается иконкой в шапке:
// сервисов до дюжины, и списком на самом экране они перевешивали всё
// остальное. Закрытие анимируем через состояние, а не размонтирование, —
// иначе панель исчезала бы мгновенно, без обратного хода.
export default function SideMenu({ open, onClose }) {
  const [visible, setVisible] = useState(open);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (open) {
      setVisible(true);
      setClosing(false);
      return undefined;
    }
    if (!visible) return undefined;
    setClosing(true);
    const t = setTimeout(() => { setVisible(false); setClosing(false); }, 240);
    return () => clearTimeout(t);
  }, [open, visible]);

  // Esc закрывает — на десктопе прототип часто смотрят с клавиатуры
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!visible) return null;

  return (
    <div className={`sidemenu ${closing ? 'closing' : ''}`}>
      <button className="sidemenu-scrim" onClick={onClose} aria-label="Закрыть меню" />
      <aside className="sidemenu-panel" role="dialog" aria-label="Рабочие сервисы">
        <header className="sidemenu-top">
          <h2 className="sidemenu-title">Рабочие сервисы</h2>
          <button className="sidemenu-close" onClick={onClose} aria-label="Закрыть"><X size={24} /></button>
        </header>
        <div className="sidemenu-scroll">
          {workServices.map(({ id, label, icon }) => {
            const Icon = ICONS[icon];
            return (
              <button className="sidemenu-row" key={id}>
                <span className="sidemenu-ico">{Icon && <Icon size={24} />}</span>
                <span className="sidemenu-label">{label}</span>
                <CaretRight size={16} color="var(--color-light)" />
              </button>
            );
          })}
        </div>
      </aside>
    </div>
  );
}
