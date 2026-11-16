import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CaretLeft, CaretRight, BellSimple, Devices, Globe, ShieldCheck, Info, LockSimple, HardDrives, SignOut, CircleHalf } from '@phosphor-icons/react';
import LanguageSheet from '../components/LanguageSheet';
import { useScrolled } from '../utils/useScrolled';
import ConfirmDialog from '../components/ConfirmDialog';
import { useSettingsPreferences, CACHE_CATEGORIES, formatStorage } from '../utils/settingsPreferences';
import { getThemeMode } from '../utils/theme';
import { getLang } from '../i18n/runtime';
import { useAuth } from '../context/AuthContext';
import './Settings.css';

export default function Settings({ initialLanguageOpen = false }) {
  const [langSheet, setLangSheet] = useState(initialLanguageOpen);
  const [scrolled, onScroll] = useScrolled();
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();
  const [confirm, setConfirm] = useState(false);
  const open = path => navigate(path, { state: { background: location } });
  const prefs = useSettingsPreferences();
  const cacheSize = CACHE_CATEGORIES.reduce((sum, c) => sum + ((prefs.clearedCache || []).includes(c.id) ? 0 : c.mb), 0);
  const [themeMode, setMode] = useState(getThemeMode);
  useEffect(() => { const sync = () => setMode(getThemeMode()); window.addEventListener('qollab-theme-change', sync); return () => window.removeEventListener('qollab-theme-change', sync); }, []);
  const themeLabel = { light: 'Светлая', dark: 'Тёмная', auto: 'Системная' }[themeMode];
  const groups = [
    { title: 'Приложение', rows: [
      ['Уведомления', BellSimple, 'coral', 'notifications'],
      ['Оформление', CircleHalf, 'orange', 'appearance', themeLabel],
      ['Язык', Globe, 'purple', 'language', getLang() === 'kk' ? 'Қазақша' : 'Русский'],
      ['Данные и память', HardDrives, 'green', 'storage', formatStorage(cacheSize)],
    ] },
    { title: 'Устройство и доступ', rows: [
      ['Устройства', Devices, 'blue', 'devices', '2'],
      ['Разрешения', ShieldCheck, 'indigo', 'permissions'],
      ['Данные устройства', Info, 'cyan', 'device'],
      ['Конфиденциальность', LockSimple, 'slate', 'privacy'],
    ] },
  ];
  return <div className="settings settings-home">
    <header className={`st-top ${scrolled ? 'hdr-shadow' : ''}`}><button className="st-back" aria-label="Назад" onClick={() => location.state?.background ? navigate(-1) : navigate('/profile')}><CaretLeft size={24} /></button><h1 className="st-title">Настройки</h1><span className="st-back hdr-spacer" aria-hidden="true" /></header>
    <div className="st-scroll" onScroll={onScroll}>
      {groups.map(group => <section className="st-group" key={group.title}>
        <h2 className="st-group-title">{group.title}</h2><div className="st-card">
          {group.rows.map(([label, Icon, tone, route, value]) => <button className="st-row" key={route} onClick={() => route === 'language' ? setLangSheet(true) : open(`/settings/${route}`)}>
            <span className={`st-ico st-ico--${tone}`}><Icon size={21} weight="fill" /></span>
            <span className="st-label">{label}</span>{value && <span className="st-value">{value}</span>}<CaretRight className="st-chevron" size={15} weight="bold" />
          </button>)}
        </div>
      </section>)}
      <div className="st-card"><button className="st-row st-row--logout" onClick={() => setConfirm(true)}><span className="st-ico"><SignOut size={21} /></span><span className="st-label">Выйти из аккаунта</span></button></div>
      <p className="st-version">qollab <span>·</span> 3.1.7.2</p>
    </div>
    {langSheet && <LanguageSheet onClose={() => setLangSheet(false)} />}
    {confirm && <ConfirmDialog title="Выйти из аккаунта?" text="Переписка сохранится. Чтобы вернуться, потребуется войти заново." confirmLabel="Выйти" danger onConfirm={() => { setConfirm(false); signOut(); }} onCancel={() => setConfirm(false)} />}
  </div>;
}
