import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CaretLeft, CaretRight, BellSimple, DeviceMobile, Translate,
  ShieldCheck, Question, FileLock, Broom, SignOut, Moon,
} from '@phosphor-icons/react';
import {
  WeatherSunny24Regular, WeatherMoon24Regular, PhoneDesktop24Regular,
} from '@fluentui/react-icons';
import ActionSheet from '../components/ActionSheet';
import { getThemeMode, setThemeMode } from '../utils/theme';
import { useAuth } from '../context/AuthContext';
import { settingsGroups } from '../data/profile';
import './Settings.css';
import { useScrolled } from '../utils/useScrolled';

const ICONS = { BellSimple, DeviceMobile, Translate, ShieldCheck, Question, FileLock, Broom, Moon };

// Режимы оформления: «автоматически» следует за системной темой устройства
const THEME_ITEMS = [
  { id: 'light', label: 'Светлое', Icon: WeatherSunny24Regular },
  { id: 'dark', label: 'Тёмное', Icon: WeatherMoon24Regular },
  { id: 'auto', label: 'Автоматически', Icon: PhoneDesktop24Regular },
];
const THEME_LABEL = Object.fromEntries(THEME_ITEMS.map((t) => [t.id, t.label]));

// Настройки (Figma node 24313:85954): две группы строк и «Выйти» отдельной
// красной строкой внизу.
export default function Settings() {
  const [scrolled, onScroll] = useScrolled();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [closing, setClosing] = useState(false);
  const [themeMode, setMode] = useState(getThemeMode);
  const [themeSheet, setThemeSheet] = useState(false);

  const pickTheme = (mode) => {
    setThemeMode(mode);
    setMode(mode);
    setThemeSheet(false);
  };

  const close = () => {
    setClosing(true);
    setTimeout(() => navigate(-1), 260);
  };

  return (
    <div className={`settings ${closing ? 'closing' : ''}`}>
      <header className={`st-top ${scrolled ? 'hdr-shadow' : ''}`}>
        <button className="st-back" onClick={close} aria-label="Назад"><CaretLeft size={24} /></button>
        <h1 className="st-title">Настройки</h1>
        <span className="st-back hdr-spacer" aria-hidden="true" />
      </header>

      <div className="st-scroll" onScroll={onScroll}>
        {settingsGroups.map((g) => (
          <section className="st-group" key={g.title}>
            <h2 className="st-group-title">{g.title}</h2>
            <div className="st-card">
              {g.items.map((it) => {
                const Icon = ICONS[it.icon];
                return (
                  <button
                    className="st-row"
                    key={it.id}
                    onClick={it.id === 'theme' ? () => setThemeSheet(true) : undefined}
                  >
                    <span className="st-ico">{Icon && <Icon size={20} />}</span>
                    <span className="st-label">{it.label}</span>
                    {/* У оформления значение живое — берём из выбранного режима */}
                    {(it.id === 'theme' ? THEME_LABEL[themeMode] : it.value) && (
                      <span className="st-value">{it.id === 'theme' ? THEME_LABEL[themeMode] : it.value}</span>
                    )}
                    <CaretRight size={16} color="var(--color-light)" />
                  </button>
                );
              })}
            </div>
          </section>
        ))}

        <div className="st-card st-card--logout">
          <button className="st-row st-row--logout" onClick={signOut}>
            <span className="st-ico"><SignOut size={20} /></span>
            <span className="st-label">Выйти</span>
          </button>
        </div>

        <div className="st-bottom-spacer" />
      </div>

      {themeSheet && (
        <ActionSheet
          title="Оформление"
          items={THEME_ITEMS}
          selected={themeMode}
          onClose={() => setThemeSheet(false)}
          onPick={pickTheme}
        />
      )}
    </div>
  );
}
