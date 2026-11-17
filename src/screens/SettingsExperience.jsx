import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CaretRight, Check, CircleHalf, Sun, Moon, Smiley, Copy, DeviceMobile, MagnifyingGlass, X, ChatsCircle } from '@phosphor-icons/react';
import Settings from './Settings';
import ChatPreview, { ThemeThumbnail } from '../components/SettingsChatPreview';
import { StorageRing, DeviceStorageBar, CacheCleaning } from '../components/SettingsStorageVisuals';
import SettingsPage from '../components/SettingsPage';
import ActionSheet from '../components/ActionSheet';
import ConfirmDialog from '../components/ConfirmDialog';
import Toast from '../components/Toast';
import { getThemeMode, setThemeMode, watchSystemTheme } from '../utils/theme';
import { useSettingsPreferences, updateSettingsPreferences, CACHE_CATEGORIES, formatStorage } from '../utils/settingsPreferences';
import { useChatAppearance, CHAT_PRESETS } from '../utils/chatAppearance';
export { ChatThemeSettings, BubbleColorSettings, WallpaperSettings } from './SettingsChatThemes';
import './SettingsExperience.css';

const THEMES = [{ id: 'light', name: 'Светлая', Icon: Sun }, { id: 'dark', name: 'Тёмная', Icon: Moon }, { id: 'auto', name: 'Системная', Icon: CircleHalf }];
const REACTIONS = [
  ['❤️', 'Сердце любовь'], ['👍', 'Палец вверх нравится'], ['🔥', 'Огонь'], ['👏', 'Аплодисменты'],
  ['😁', 'Улыбка'], ['🎉', 'Праздник'], ['🤝', 'Рукопожатие'], ['💯', 'Сто'],
  ['😍', 'Влюблённость'], ['😂', 'Смех'], ['🥰', 'Любовь'], ['😎', 'Круто'],
  ['🙏', 'Спасибо'], ['💪', 'Сила'], ['🚀', 'Ракета'], ['✨', 'Искры'],
  ['👌', 'Окей'], ['🤔', 'Думаю'], ['😮', 'Удивление'], ['😢', 'Грусть'],
  ['🙌', 'Ура'], ['💡', 'Идея'], ['✅', 'Готово'], ['👀', 'Глаза'],
];
function SettingRow({ label, value, onClick, Icon }) {
  return <button className="st-row sx-row" onClick={onClick}>{Icon && <Icon size={21} className="sx-row-icon" />}<span className="st-label">{label}</span><span className="st-value">{value}</span><CaretRight size={15} className="st-chevron" weight="bold" /></button>;
}
export function AppearanceSettings() {
  const [theme, setTheme] = useState(getThemeMode);
  const prefs = useSettingsPreferences();
  const { appearance } = useChatAppearance();
  const navigate = useNavigate(), location = useLocation();
  const open = path => navigate(path, { state: { background: location } });
  useEffect(() => watchSystemTheme(getThemeMode), []);
  return <SettingsPage title="Оформление">
    <section className="sx-section sx-section--first"><h2 className="st-group-title">Тема приложения</h2><div className="sx-themes st-card">
      {THEMES.map(({ id, name, Icon }) => <button key={id} className={`sx-theme ${theme === id ? 'is-selected' : ''}`} onClick={() => { setTheme(id); setThemeMode(id); }} aria-pressed={theme === id}>
        <ThemeThumbnail mode={id} /><span className="sx-theme-name"><Icon size={14} />{name}</span><span className="sx-radio">{theme === id && <Check size={12} weight="bold" />}</span>
      </button>)}
    </div></section>
    <section className="sx-section"><h2 className="st-group-title">Ваши чаты</h2><div className="st-card sx-appearance-chat">
      <div className="sx-preview-card"><ChatPreview compact /></div>
      <SettingRow label="Темы чатов" Icon={ChatsCircle} value={CHAT_PRESETS.find(p => p.id === appearance.preset)?.name || 'Своя тема'} onClick={() => open('/settings/chat-theme')} />
      <SettingRow label="Быстрая реакция" Icon={Smiley} value={<span className="sx-row-emoji">{prefs.reaction}</span>} onClick={() => open('/settings/reaction')} />
    </div></section>
  </SettingsPage>;
}
export function QuickReactionSettings() {
  const prefs = useSettingsPreferences();
  const [expanded, setExpanded] = useState(false), [query, setQuery] = useState('');
  const reactions = (expanded ? REACTIONS : REACTIONS.slice(0, 8)).filter(([emoji, name]) => `${emoji} ${name}`.toLocaleLowerCase().includes(query.toLocaleLowerCase().trim()));
  return <SettingsPage title="Быстрая реакция">
    <div className="sx-preview-card"><ChatPreview reaction /></div>
    <p className="sx-description">Нажмите на сообщение дважды,<br />чтобы отправить выбранную реакцию.</p>
    <section className="sx-section"><h2 className="st-group-title">Ваша реакция</h2><div className="st-card sx-reaction-card">
      {expanded && <label className="sx-search"><MagnifyingGlass size={19} /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Поиск эмодзи" aria-label="Поиск эмодзи" />{query && <button aria-label="Очистить поиск" onClick={() => setQuery('')}><X size={16} /></button>}</label>}
      <div className="sx-emojis">{reactions.map(([emoji, name]) => <button aria-label={name} aria-pressed={prefs.reaction === emoji} className={prefs.reaction === emoji ? 'is-selected' : ''} key={emoji} onClick={() => updateSettingsPreferences({ reaction: emoji })}>{emoji}</button>)}</div>
      {!reactions.length && <p className="sx-hint">Ничего не найдено</p>}
      <button className="sx-text-button" onClick={() => { setExpanded(v => !v); setQuery(''); }}>{expanded ? 'Свернуть' : 'Больше эмодзи'}<CaretRight size={15} /></button>
    </div></section>
  </SettingsPage>;
}
export function LanguageSettings() {
  return <Settings initialLanguageOpen />;
}
const RETENTION = [{ id: 'week', label: '1 неделю' }, { id: 'month', label: '1 месяц' }, { id: 'forever', label: 'Всегда' }];
const LIMITS = [{ id: '2', label: '2 ГБ' }, { id: '5', label: '5 ГБ' }, { id: '10', label: '10 ГБ' }, { id: 'none', label: 'Без ограничений' }];
export function StorageSettings() {
  const prefs = useSettingsPreferences();
  const cleared = prefs.clearedCache || [];
  const categories = CACHE_CATEGORIES.map(c => ({ ...c, mb: cleared.includes(c.id) ? 0 : c.mb }));
  const [selected, setSelected] = useState(CACHE_CATEGORIES.map(c => c.id));
  const [cleaningJob, setCleaningJob] = useState(null);
  const [cleaningProgress, setCleaningProgress] = useState(0);
  const cleaning = cleaningJob && { ...cleaningJob, progress: cleaningProgress, phase: cleaningProgress === 1 ? 'done' : 'running' };
  const [sheet, setSheet] = useState(null), [confirm, setConfirm] = useState(false);
  const total = categories.reduce((sum, c) => sum + c.mb, 0);
  const selectedSize = categories.reduce((sum, c) => sum + (selected.includes(c.id) ? c.mb : 0), 0);
  const toggleCategory = id => setSelected(ids => ids.includes(id) ? ids.filter(value => value !== id) : [...ids, id]);
  const clear = () => {
    if (!selectedSize || cleaningJob) return;
    setConfirm(false);
    setCleaningProgress(0);
    setCleaningJob({ start: performance.now(), total: selectedSize, ids: [...selected], cleared: [...cleared], categories: categories.filter(c => selected.includes(c.id) && c.mb > 0) });
  };
  useEffect(() => {
    if (!cleaningJob) return;
    const job = cleaningJob;
    const timer = setInterval(() => {
      const progress = Math.min(1, (performance.now() - job.start) / 3000);
      if (progress === 1) {
        clearInterval(timer);
        updateSettingsPreferences({ clearedCache: [...new Set([...job.cleared, ...job.ids])] });
      }
      setCleaningProgress(progress);
    }, 40);
    return () => clearInterval(timer);
  }, [cleaningJob]);
  return <SettingsPage title="Данные и память">
    <section className="sx-storage-summary"><StorageRing categories={categories} selected={selected} onToggle={toggleCategory} /><p>{total ? 'Больше места для важного' : 'На устройстве стало свободнее'}</p></section>
    <DeviceStorageBar cache={total} />
    <section className="sx-section"><div className="st-card sx-cache-card">
      {categories.map(c => <button key={c.id} role="checkbox" aria-checked={selected.includes(c.id) && c.mb > 0} disabled={!c.mb} className="sx-cache-row" onClick={() => toggleCategory(c.id)}><span className={`sx-cache-check ${selected.includes(c.id) && c.mb ? 'is-checked' : ''}`} style={{ '--category-color': c.color }}>{selected.includes(c.id) && c.mb > 0 && <Check size={13} weight="bold" />}</span><span>{c.name}</span><small>{formatStorage(c.mb)}</small></button>)}
      <div className="sx-clear-wrap"><button className="sx-primary" disabled={!selectedSize} onClick={() => setConfirm(true)}>{total === 0 ? 'Кэш очищен' : !selectedSize ? 'Выберите данные для очистки' : `Очистить ${formatStorage(selectedSize)}`}</button></div>
    </div><p className="sx-hint">Удалятся только копии на этом устройстве. Файлы в чатах останутся доступны для повторной загрузки.</p></section>
    <section className="sx-section"><h2 className="st-group-title">Управление кэшем</h2><div className="st-card"><SettingRow label="Хранить медиа" value={RETENTION.find(v => v.id === prefs.retention)?.label} onClick={() => setSheet('retention')} /><SettingRow label="Максимум кэша" value={LIMITS.find(v => v.id === prefs.limit)?.label} onClick={() => setSheet('limit')} /></div><p className="sx-hint">Давно не открывавшиеся файлы будут удаляться с устройства автоматически.</p></section>
    {sheet && <ActionSheet title={sheet === 'retention' ? 'Хранить медиа' : 'Максимум кэша'} items={sheet === 'retention' ? RETENTION : LIMITS} selected={prefs[sheet]} onClose={() => setSheet(null)} onPick={id => { updateSettingsPreferences({ [sheet]: id }); setSheet(null); }} />}
    {cleaning && <CacheCleaning job={cleaning} onClose={() => setCleaningJob(null)} />}
    {confirm && <ConfirmDialog title={`Очистить ${formatStorage(selectedSize)} кэша?`} text="Сообщения и файлы в чатах сохранятся. При необходимости файлы можно загрузить снова." confirmLabel="Очистить кэш" onConfirm={clear} onCancel={() => setConfirm(false)} />}
  </SettingsPage>;
}
const DEVICE_GROUPS = [
  ['Приложение', [['Версия qollab', '3.1.7.2']]],
  ['Устройство', [['Название', 'iPhone'], ['Модель', 'iPhone 15 Pro'], ['Система', 'iOS 27.0']]],
  ['Подключение и память', [['Сеть', 'Wi-Fi'], ['Оператор', '—'], ['Свободно', '18,58 ГБ']]],
];
export function DeviceDetailsSettings() {
  const [toast, setToast] = useState('');
  const prefs = useSettingsPreferences();
  const cacheSize = CACHE_CATEGORIES.reduce((sum, c) => sum + ((prefs.clearedCache || []).includes(c.id) ? 0 : c.mb), 0);
  const deviceGroups = DEVICE_GROUPS.map(([title, rows]) => [title, rows.map(([label, value]) => [label, label === 'Свободно' ? formatStorage(128000 - 107020 - cacheSize) : value])]);
  const copiedTime = useRef(new Date());
  const copy = async () => { try { await navigator.clipboard.writeText(deviceGroups.flatMap(([, rows]) => rows.map(([k, v]) => `${k}: ${v}`)).concat(`Время: ${copiedTime.current.toLocaleString('ru-RU')}`).join('\n')); setToast('Данные скопированы'); } catch { setToast('Не удалось скопировать данные'); } };
  return <SettingsPage title="Данные устройства"><div className="sx-device-hero"><span><DeviceMobile size={38} weight="light" /></span><h2>iPhone 15 Pro</h2><p>Это устройство</p></div>{deviceGroups.map(([title, rows]) => <section className="sx-section" key={title}><h2 className="st-group-title">{title}</h2><dl className="st-card sx-details">{rows.map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}</dl></section>)}<button className="sx-primary sx-copy" onClick={copy}><Copy size={18} />Скопировать данные</button><p className="sx-hint">Эти данные помогут поддержке разобраться в проблеме.</p><Toast text={toast} onDone={() => setToast('')} /></SettingsPage>;
}
