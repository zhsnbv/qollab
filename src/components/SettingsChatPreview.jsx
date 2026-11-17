import { useEffect, useId, useState } from 'react';
import Message from './Message';
import { useSettingsPreferences } from '../utils/settingsPreferences';
import { useChatAppearance, appearanceClass, appearanceStyle } from '../utils/chatAppearance';
import ChatWallpaper from './ChatWallpaper';
import { useCompany } from '../context/CompanyContext';
import '../screens/ChatRoom.css';
import '../screens/ChatAppearance.css';

const PREVIEW_ME = { id: 'me', avatar: '/img/profile/avatar-photo.png', initials: 'АМ' };

// Render the production prototype's Message and MessageReactions components.
// No preview-specific bubble, timestamp or reaction geometry.
export default function SettingsChatPreview({ reaction = false, compact = false }) {
  const prefs = useSettingsPreferences();
  const { appearance } = useChatAppearance();
  const [reacted, setReacted] = useState(true);
  useEffect(() => { setReacted(true); }, [prefs.reaction]);
  const incoming = { id: 'settings-preview-in', kind: 'text', text: reaction ? 'Отличная работа! Спасибо 🙌' : 'Привет! Посмотрела макеты — всё отлично 🙌', time: '14:32' };
  const outgoing = { id: 'settings-preview-out', kind: 'text', text: 'Супер, спасибо! Отправлю команде.', time: '14:33', status: 'read' };
  const toggle = () => setReacted(value => !value);
  return <div className={`sx-chat ${appearanceClass(appearance)} ${reaction ? 'sx-chat--reaction' : ''} ${compact ? 'sx-chat--compact' : ''}`} style={appearanceStyle(appearance)} role="group" aria-label="Предпросмотр чата">
    <ChatWallpaper appearance={appearance} />
    <div className="cr-messages">
      <div className="cr-day">Сегодня</div>
      <div className="sx-preview-message" tabIndex={reaction ? 0 : undefined} aria-label={reaction ? 'Сообщение для быстрой реакции. Нажмите дважды или Enter.' : undefined} onKeyDown={event => { if (reaction && event.key === 'Enter' && event.target === event.currentTarget) toggle(); }}>
        <Message msg={incoming} firstOfGroup lastOfGroup mine={false} withAvatarSlot={false} reactions={reaction && reacted ? { [prefs.reaction]: [PREVIEW_ME] } : undefined} onToggleReaction={reaction ? toggle : undefined} />
      </div>
      {!reaction && <Message msg={outgoing} firstOfGroup lastOfGroup mine withAvatarSlot={false} />}
    </div>
  </div>;
}

export function ThemeThumbnail({ mode }) {
  const clip = useId();
  const { companyId } = useCompany();
  const colors = { erg: ['#FBE0C8', '#63422E'], integra: ['#DCDAEB', '#625A9F'], bts: ['#D3E8E1', '#286957'] }[companyId] || ['#FBE0C8', '#63422E'];
  const paint = dark => <g><rect width="68" height="84" rx="10" fill={dark ? '#29292d' : '#eeefef'} /><rect x="23" y="10" width="22" height="4" rx="2" fill={dark ? '#727279' : '#b0b0b7'} /><rect x="9" y="28" width="35" height="12" rx="5" fill={dark ? '#4b4b53' : '#fff'} /><rect x="23" y="47" width="36" height="12" rx="5" fill={colors[dark ? 1 : 0]} /><rect x="10" y="70" width="48" height="5" rx="2.5" fill={dark ? '#4b4b53' : '#fff'} /></g>;
  return <span className={`sx-mini sx-mini--${mode}`}><svg viewBox="0 0 68 84" fill="none" aria-hidden="true"><defs><clipPath id={clip}><path d="M34 0h34v84H34z" /></clipPath></defs>{paint(mode === 'dark')}{mode === 'auto' && <g clipPath={`url(#${clip})`}>{paint(true)}</g>}</svg></span>;
}
