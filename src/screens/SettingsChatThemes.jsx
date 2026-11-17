import { Navigate } from 'react-router-dom';
import { Check, Play } from '@phosphor-icons/react';
import SettingsPage from '../components/SettingsPage';
import ChatPreview from '../components/SettingsChatPreview';
import ChatWallpaper from '../components/ChatWallpaper';
import { useChatAppearance, appearanceClass, appearanceStyle, CHAT_PRESETS } from '../utils/chatAppearance';
import './SettingsChatThemes.css';

function ThemeTile({ preset, active, onPick }) {
  return <button className={`sc-preset ${active ? 'is-selected' : ''}`} onClick={onPick} aria-pressed={active} aria-label={preset.name} data-preset={preset.id}>
    <span className={`sc-preset-art ${appearanceClass(preset)}`} style={appearanceStyle(preset)}>
      <ChatWallpaper appearance={preset} miniature /><i className="sc-mini-in" /><i className="sc-mini-out" />
      {preset.group === 'live' && <span className="sc-live-badge" title={preset.video ? 'Живой фон' : 'Живой фон · пока фото'}>{preset.video && <Play size={8} weight="fill" />}<span>LIVE{!preset.video && ' · фото'}</span></span>}
      {active && <span className="sc-selection"><Check size={13} weight="bold" /></span>}
    </span><span className="sc-preset-name">{preset.name}</span>
  </button>;
}
export function ChatThemeSettings() {
  const { appearance, update } = useChatAppearance();
  return <SettingsPage title="Темы чатов" contentClassName="sc-theme-layout">
    <section className="sc-theme-card st-card">
      <div className="sc-theme-preview"><ChatPreview compact /></div>
      <div className="sc-theme-catalog">
        <div className="sc-catalog-heading"><h2>Выберите тему</h2><span>{CHAT_PRESETS.find(preset => preset.id === appearance.preset)?.name}</span></div>
        <div className="sc-theme-scroll" role="region" aria-label="Список тем" tabIndex={0}>
          <div className="sc-theme-grid" role="group" aria-label="Темы чатов">{CHAT_PRESETS.map(preset => <ThemeTile key={preset.id} preset={preset} active={appearance.preset === preset.id} onPick={() => update({ preset: preset.id })} />)}</div>
        </div>
      </div>
    </section>
  </SettingsPage>;
}
// Existing deep links now lead to the same curated catalog.
export function BubbleColorSettings() { return <Navigate to="/settings/chat-theme" replace />; }
export function WallpaperSettings() { return <Navigate to="/settings/chat-theme" replace />; }
