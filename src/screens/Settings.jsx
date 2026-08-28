import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  CaretLeft, CaretRight, BellSimple, DeviceMobile, Translate,
  ShieldCheck, Question, FileLock, Broom, SignOut, Moon,
} from '@phosphor-icons/react';
import {
  WeatherSunny24Regular, WeatherMoon24Regular, PhoneDesktop24Regular,
} from '@fluentui/react-icons';
import ActionSheet from '../components/ActionSheet';
import ConfirmDialog from '../components/ConfirmDialog';
import Toast from '../components/Toast';
import { languages } from '../data/settings';
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
  const location = useLocation();
  const { signOut } = useAuth();
  const [closing, setClosing] = useState(false);
  const [themeMode, setMode] = useState(getThemeMode);
  const [themeSheet, setThemeSheet] = useState(false);
  const [langSheet, setLangSheet] = useState(false);
  const [lang, setLang] = useState('ru');
  const [confirm, setConfirm] = useState(null);
  const [toast, setToast] = useState('');

  const open = (path) => navigate(path, { state: { background: location } });

  // Каждая строка знает, что делает: подэкран открывается оверлеем, выбор —
  // листом снизу, разрушающее действие — подтверждением.
  const ROW_ACTIONS = {
    notif: () => open('/settings/notifications'),
    devices: () => open('/settings/devices'),
    lang: () => setLangSheet(true),
    theme: () => setThemeSheet(true),
    perms: () => open('/settings/permissions'),
    help: () => open('/settings/help'),
    privacy: () => open('/settings/privacy'),
    cache: () => setConfirm('cache'),
  };

  const LANG_LABEL = Object.fromEntries(languages.map((l) => [l.id, l.label]));

  const pickTheme = (mode) => {
    setThemeMode(mode);
    setMode(mode);
    setThemeSheet(false);
  };

  const close = () => {
    setClosing(true);
    setTimeout(() => navigate(-1), 260);
  };

  const value = (it) => {
    if (it.id === 'theme') return THEME_LABEL[themeMode];
    if (it.id === 'lang') return LANG_LABEL[lang];
    return it.value;
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
                  <button className="st-row" key={it.id} onClick={ROW_ACTIONS[it.id]}>
                    <span className="st-ico">{Icon && <Icon size={20} />}</span>
                    <span className="st-label">{it.label}</span>
                    {/* У оформления и языка значение живое — берём из выбранного */}
                    {value(it) && <span className="st-value">{value(it)}</span>}
                    <CaretRight size={16} color="var(--color-light)" />
                  </button>
                );
              })}
            </div>
          </section>
        ))}

        <div className="st-card st-card--logout">
          <button className="st-row st-row--logout" onClick={() => setConfirm('logout')}>
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

      {langSheet && (
        <ActionSheet
          title="Язык"
          items={languages.map((l) => ({ id: l.id, label: `${l.flag}  ${l.label}` }))}
          selected={lang}
          onClose={() => setLangSheet(false)}
          onPick={(id) => {
            setLangSheet(false);
            // Казахской локализации в прототипе нет, поэтому и значение
            // не подменяем: строка, показывающая язык, которого нет,
            // врёт сильнее, чем честный тост.
            if (id === 'ru') { setLang(id); return; }
            setToast('Казахская локализация появится позже');
          }}
        />
      )}

      {confirm && (
        <ConfirmDialog
          title={confirm === 'logout' ? 'Выйти из аккаунта?' : 'Очистить кэш приложения?'}
          text={confirm === 'logout'
            ? 'Переписка останется на сервере, но войти придётся заново.'
            : 'Загруженные файлы и превью удалятся с устройства. Приложение перезапустится.'}
          confirmLabel={confirm === 'logout' ? 'Выйти' : 'Очистить'}
          danger={confirm === 'logout'}
          onConfirm={() => {
            if (confirm === 'logout') { setConfirm(null); signOut(); return; }
            setConfirm(null);
            setToast('Кэш очищен');
          }}
          onCancel={() => setConfirm(null)}
        />
      )}

      <Toast text={toast} onDone={() => setToast('')} />
    </div>
  );
}
