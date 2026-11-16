import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Check, Palette, ImageSquare, CaretRight, PencilSimpleLine, Play, Pause } from '@phosphor-icons/react';
import SettingsPage from '../components/SettingsPage';
import ChatPreview from '../components/SettingsChatPreview';
import ChatWallpaper from '../components/ChatWallpaper';
import { useChatAppearance, appearanceClass, appearanceStyle, BUBBLE_COLORS, CHAT_PRESETS } from '../utils/chatAppearance';
import { WALLPAPERS } from '../utils/settingsPreferences';
import './SettingsChatThemes.css';

export function BubbleColorDots() {
  const { appearance } = useChatAppearance();
  return <span className="sc-color-dots qa-bubbles" style={appearanceStyle(appearance)} aria-hidden="true"><i /><i /></span>;
}
export function ChatDecorSwitch({ label, checked, onChange, Icon, detail }) {
  return <button className="sc-switch-row" role="switch" aria-checked={checked} onClick={() => onChange(!checked)}>
    {Icon && <Icon size={21} className="sc-switch-icon" />}<span className="sc-switch-label">{label}{detail && <small>{detail}</small>}</span><span className="sc-switch"><i /></span>
  </button>;
}
function ThemeTile({ preset, active, onPick, motion = true }) {
  const appearance = { ...preset, motion };
  return <button className={`sc-preset ${active ? 'is-selected' : ''}`} onClick={onPick} aria-pressed={active} aria-label={preset.name}>
    <span className={`sc-preset-art ${appearanceClass(appearance)}`} style={appearanceStyle(appearance)}><ChatWallpaper appearance={appearance} miniature /><i className="sc-mini-in" /><i className="sc-mini-out" />
      {preset.group === 'live' && <span className="sc-live-badge"><Play size={9} weight="fill" />Живые</span>}
      {active && <span className="sc-selection"><Check size={13} weight="bold" /></span>}
    </span><span className="sc-preset-name">{preset.name}</span>
  </button>;
}
function ThemeCollection({ title, children }) {
  return <section className="st-card sc-collection">
    <h3>{title}</h3>
    <div className="sc-preset-strip" role="group" aria-label={title} tabIndex={0}>{children}</div>
  </section>;
}
export function ChatThemeSettings() {
  const { appearance, update } = useChatAppearance();
  const navigate = useNavigate(), location = useLocation();
  const open = path => navigate(path, { state: { background: location } });
  const groups = [{ id: 'classic', title: 'На каждый день' }, { id: 'live', title: 'Живые темы' }, { id: 'art', title: 'Иллюстрации' }];
  return <SettingsPage title="Тема и цвета">
    <div className="sx-preview-card"><ChatPreview compact /></div>
    <section className="sc-custom-section"><h2 className="st-group-title">Настроить отдельно</h2><div className="sc-customize st-card"><button onClick={() => open('/settings/bubbles')}><Palette size={21} /><span>Цвет сообщений</span><BubbleColorDots /><CaretRight size={14} /></button><button onClick={() => open('/settings/wallpaper')}><ImageSquare size={21} /><span>Фон и узор</span><span className="sc-row-value">{WALLPAPERS.find(item => item.id === appearance.wallpaper)?.name}</span><CaretRight size={14} /></button></div></section>
    <section className="sc-ready-themes"><h2 className="st-group-title">Готовые темы</h2>
      {groups.map(group => <ThemeCollection key={group.id} title={group.title}>{CHAT_PRESETS.filter(preset => preset.group === group.id).map(preset => <ThemeTile key={preset.id} preset={preset} active={appearance.preset === preset.id} motion={appearance.motion} onPick={() => update({ wallpaper: preset.wallpaper, incoming: preset.incoming, outgoing: preset.outgoing, pattern: preset.pattern, preset: preset.id })} />)}</ThemeCollection>)}
    </section>
  </SettingsPage>;
}
export function BubbleColorSettings() {
  const { appearance, update } = useChatAppearance();
  const [direction, setDirection] = useState('outgoing');
  return <SettingsPage title="Цвет сообщений">
    <div className="sx-preview-card"><ChatPreview compact /></div>
    <div className="sc-direction" role="group" aria-label="Цвет каких сообщений менять"><button aria-pressed={direction === 'outgoing'} onClick={() => setDirection('outgoing')}>Ваши</button><button aria-pressed={direction === 'incoming'} onClick={() => setDirection('incoming')}>Собеседника</button></div>
    <div className="sc-palette st-card">{BUBBLE_COLORS.map(color => <button key={color.id} className={`sc-color ${appearance[direction] === color.id ? 'is-selected' : ''}`} aria-label={color.name} aria-pressed={appearance[direction] === color.id} onClick={() => update({ [direction]: color.id })}>
      <span className={`qa-bubbles sc-color-chip sc-color-chip--${direction}`} style={appearanceStyle({ [direction]: color.id })}>{appearance[direction] === color.id && <Check size={21} weight="bold" />}</span><span>{color.name}</span>
    </button>)}</div>
  </SettingsPage>;
}
export function WallpaperSettings() {
  const { appearance, update } = useChatAppearance();
  const groups = [{ id: 'live', title: 'Живые фоны' }, { id: 'mesh', title: 'Мягкий цвет' }, { id: 'illustration', title: 'Иллюстрации' }];
  const choose = wallpaper => update({ wallpaper });
  return <SettingsPage title="Фон и узор">
    <div className="sx-preview-card"><ChatPreview compact /></div>
    <div className="st-card sc-wall-options"><ChatDecorSwitch label="Узор" Icon={PencilSimpleLine} checked={appearance.pattern} onChange={pattern => update({ pattern })} />
      {appearance.wallpaper.endsWith('-live') && <ChatDecorSwitch label="Анимация фона" Icon={appearance.motion ? Play : Pause} checked={appearance.motion} onChange={motion => update({ motion, preset: appearance.preset })} />}
    </div>
    <button className="sc-standard-wall st-card" onClick={() => choose('plain')} aria-pressed={appearance.wallpaper === 'plain'}><span className="sc-plain-swatch" /><span>Стандартный фон</span>{appearance.wallpaper === 'plain' && <Check size={18} />}</button>
    <div className="sc-wall-collections">{groups.map(group => <ThemeCollection key={group.id} title={group.title}>{WALLPAPERS.filter(wallpaper => wallpaper.kind === group.id).map(wallpaper => <ThemeTile key={wallpaper.id} preset={{ ...appearance, id: wallpaper.id, name: wallpaper.name, wallpaper: wallpaper.id, group: wallpaper.kind }} active={appearance.wallpaper === wallpaper.id} motion={appearance.motion} onPick={() => choose(wallpaper.id)} />)}</ThemeCollection>)}</div>
  </SettingsPage>;
}
