import { Sparkle } from '@phosphor-icons/react';
import './ErgizAvatar.css';

// Аватар ERGiz: градиентное кольцо и звёздочка (признак ИИ) — вёрсткой поверх
// обычного фото, а не запечены в картинку. Так рамка масштабируется под любой
// размер плейсхолдера (список чатов — 56px, шапка/сообщения чата — 40px) и не
// обрезается контейнером.
export default function ErgizAvatar({ size = 40 }) {
  const badge = Math.round(size * 0.34);
  const icon = Math.round(badge * 0.6);
  return (
    <span className="ergiz-avatar" style={{ width: size, height: size }}>
      <span className="ergiz-avatar-ring">
        <img src="/img/chats/ergiz-photo.png" alt="" />
      </span>
      <span className="ergiz-avatar-badge" style={{ width: badge, height: badge }}>
        <Sparkle size={icon} weight="fill" />
      </span>
    </span>
  );
}
