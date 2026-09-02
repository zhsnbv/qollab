import { Sparkle } from '@phosphor-icons/react';
import './ErgizAvatar.css';

// Аватар ERGiz: градиентное кольцо и звёздочка (признак ИИ) — вёрсткой поверх
// обычного фото, а не запечены в картинку. Так рамка масштабируется под любой
// размер плейсхолдера (список чатов — 56px, шапка/сообщения чата — 40px,
// профиль — 128px) и не обрезается контейнером.
//
// Значок сделан по тому же паттерну, что кружок статуса в списке чатов: тот же
// угол, та же доля от аватарки, тот же кант цветом поверхности и белый глиф
// внутри. Отличается только заливка — у статуса сплошной тон, у ассистента
// градиент кольца: он и говорит, что это не присутствие, а признак ИИ.
export default function ErgizAvatar({ size = 40 }) {
  // 56 → 22 и 3, как у кружка статуса; на меньших аватарках всё ужимается
  const badge = Math.round(size * 0.393);
  const ring = Math.max(2, Math.round(size * 0.054));
  const icon = Math.round(badge * 0.55);
  return (
    <span className="ergiz-avatar" style={{ width: size, height: size }}>
      <span className="ergiz-avatar-ring">
        <img src="/img/chats/ergiz-photo.png" alt="" />
      </span>
      <span
        className="ergiz-avatar-badge"
        style={{ width: badge, height: badge, borderWidth: ring }}
      >
        <Sparkle size={icon} weight="fill" />
      </span>
    </span>
  );
}
