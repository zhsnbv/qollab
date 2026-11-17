import { Navigate } from 'react-router-dom';
import { Check, Play } from '@phosphor-icons/react';
import SettingsPage from '../components/SettingsPage';
import ChatPreview from '../components/SettingsChatPreview';
import ChatWallpaper from '../components/ChatWallpaper';
import { useChatAppearance, appearanceClass, appearanceStyle, CHAT_PRESETS } from '../utils/chatAppearance';
import './SettingsChatThemes.css';

const GROUPS = [
  { id: 'gradient', title: 'Градиенты' },
  { id: 'pattern', title: 'Узоры' },
  { id: 'art', title: 'Иллюстрации' },
  { id: 'live', title: 'Живые фоны' },
];
function ThemeTile({ preset, active, onPick }) {
  return <button className={`sc-preset ${active ? 'is-selected' : ''}`} onClick={onPick} aria-pressed={active} aria-label={preset.name}>
    <span className={`sc-preset-art ${appearanceClass(preset)}`} style={appearanceStyle(preset)}>
      <ChatWallpaper appearance={preset} miniature /><i className="sc-mini-in" /><i className="sc-mini-out" />
      {preset.video && <span className="sc-live-badge"><Play size={9} weight="fill" />10 с</span>}
      {active && <span className="sc-selection"><Check size={13} weight="bold" /></span>}
    </span><span className="sc-preset-name">{preset.name}</span>
  </button>;
}
export function ChatThemeSettings() {
  const { appearance, update } = useChatAppearance();
  const standard = CHAT_PRESETS[0];
  return <SettingsPage title="Темы чатов">
    <div className="sc-theme-preview"><div className="sx-preview-card"><ChatPreview compact /></div></div>
    <button className="sc-standard-theme st-card" onClick={() => update({ preset: standard.id })} aria-pressed={appearance.preset === standard.id}>
      <span className={`sc-standard-art ${appearanceClass(standard)}`} style={appearanceStyle(standard)}><i className="sc-mini-in" /><i className="sc-mini-out" /></span>
      <span>Стандартная</span><span className={`sc-choice ${appearance.preset === standard.id ? 'is-selected' : ''}`}>{appearance.preset === standard.id && <Check size={13} weight="bold" />}</span>
    </button>
    <div className="sc-theme-collections">{GROUPS.map(group => <section className="st-card sc-collection" key={group.id}>
      <div className="sc-collection-heading"><h2>{group.title}</h2>{group.id === 'live' && !CHAT_PRESETS.some(preset => preset.group === 'live' && preset.video) && <span>Пока фото</span>}</div>
      <div className="sc-preset-strip" role="group" aria-label={group.title} tabIndex={0}>{CHAT_PRESETS.filter(preset => preset.group === group.id).map(preset => <ThemeTile key={preset.id} preset={preset} active={appearance.preset === preset.id} onPick={() => update({ preset: preset.id })} />)}</div>
    </section>)}</div>
  </SettingsPage>;
}
// Existing deep links now lead to the same curated catalog.
export function BubbleColorSettings() { return <Navigate to="/settings/chat-theme" replace />; }
export function WallpaperSettings() { return <Navigate to="/settings/chat-theme" replace />; }
