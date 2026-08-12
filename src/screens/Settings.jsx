import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CaretLeft, CaretRight, BellSimple, DeviceMobile, Translate,
  ShieldCheck, Question, FileLock, Broom, SignOut,
} from '@phosphor-icons/react';
import { settingsGroups } from '../data/profile';
import './Settings.css';

const ICONS = { BellSimple, DeviceMobile, Translate, ShieldCheck, Question, FileLock, Broom };

// Настройки (Figma node 24313:85954): две группы строк и «Выйти» отдельной
// красной строкой внизу.
export default function Settings() {
  const navigate = useNavigate();
  const [closing, setClosing] = useState(false);

  const close = () => {
    setClosing(true);
    setTimeout(() => navigate(-1), 260);
  };

  return (
    <div className={`settings ${closing ? 'closing' : ''}`}>
      <header className="st-top">
        <button className="st-back" onClick={close} aria-label="Назад"><CaretLeft size={24} /></button>
        <h1 className="st-title">Настройки</h1>
        <span className="st-back" aria-hidden="true" />
      </header>

      <div className="st-scroll">
        {settingsGroups.map((g) => (
          <section className="st-group" key={g.title}>
            <h2 className="st-group-title">{g.title}</h2>
            <div className="st-card">
              {g.items.map((it) => {
                const Icon = ICONS[it.icon];
                return (
                  <button className="st-row" key={it.id}>
                    <span className="st-ico">{Icon && <Icon size={20} />}</span>
                    <span className="st-label">{it.label}</span>
                    {it.value && <span className="st-value">{it.value}</span>}
                    <CaretRight size={16} color="var(--color-light)" />
                  </button>
                );
              })}
            </div>
          </section>
        ))}

        <div className="st-card st-card--logout">
          <button className="st-row st-row--logout">
            <span className="st-ico"><SignOut size={20} /></span>
            <span className="st-label">Выйти</span>
          </button>
        </div>

        <div className="st-bottom-spacer" />
      </div>
    </div>
  );
}
