import { useId } from 'react';
import { Sparkle } from '@phosphor-icons/react';
import './ErgizAvatar.css';

// Аватар ERGiz: градиентное кольцо и звёздочка (признак ИИ) — вёрсткой поверх
// обычного фото, а не запечены в картинку. Так рамка масштабируется под любой
// размер плейсхолдера (список чатов — 56px, шапка/сообщения чата — 40px,
// профиль — 128px) и не обрезается контейнером.
//
// Значок стоит там же и того же размера, что кружок статуса у людей, но живёт
// по своему правилу: подложка у него цвета поверхности — то есть значок как бы
// вырезан из аватарки, — а цвет несёт сама звёздочка, тем же градиентом, что
// и кольцо. У статуса наоборот: сплошная заливка и белый глиф.
const STOPS = [
  ['0%', '#ff9a8b'],
  ['45%', '#f6a6c9'],
  ['100%', '#a78bdb'],
];

export default function ErgizAvatar({ size = 40 }) {
  // Градиент живёт внутри svg, поэтому id должен быть свой у каждой аватарки:
  // на экране их бывает несколько сразу (список чатов, лента сообщений).
  const gradId = useId();
  // 56 → 22 и 3, как у кружка статуса; на меньших аватарках всё ужимается
  const badge = Math.round(size * 0.393);
  const ring = Math.max(2, Math.round(size * 0.054));
  const icon = Math.round(badge * 0.62);
  // Центр значка лежит на окружности аватарки — по диагонали вниз вправо:
  // до точки касания от края бокса остаётся R·(1−cos45°), а центр нужно
  // сдвинуть ещё на половину значка наружу.
  const offset = (size / 2) * (1 - Math.SQRT1_2) - badge / 2;

  return (
    <span className="ergiz-avatar" style={{ width: size, height: size }}>
      <span className="ergiz-avatar-ring">
        <img src="/img/chats/ergiz-photo.png" alt="" />
      </span>
      <span
        className="ergiz-avatar-badge"
        style={{ width: badge, height: badge, borderWidth: ring, right: offset, bottom: offset }}
      >
        <Sparkle size={icon} weight="fill" color={`url(#${gradId})`}>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
              {STOPS.map(([offset2, color]) => (
                <stop key={offset2} offset={offset2} stopColor={color} />
              ))}
            </linearGradient>
          </defs>
        </Sparkle>
      </span>
    </span>
  );
}
