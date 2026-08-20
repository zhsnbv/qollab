import { servicesById } from '../context/FavoritesContext';
import { News24Regular, ChatMultiple24Regular, Person24Regular } from '@fluentui/react-icons';
import './OnboardingArt.css';

// Иллюстрация онбординга (Figma node 23861:7052) — вёрсткой, а не картинкой:
// орбиты, кружки с глифами и иконка приложения красятся акцентом рабочего
// пространства. Растровые здесь только иконки сервисов.
//
// Диаметры орбит взяты из макета (164.57 / 286.46 / 407.71), но круги сделаны
// концентрическими вокруг логотипа — в макете они смещены по вертикали, и при
// вращении такая композиция «болталась» бы. Холст с запасом: иконки сидят
// верхом на орбите и выступают за её радиус.
const CANVAS = 456;
const CENTER = CANVAS / 2;
const pc = (v) => `${(v / CANVAS) * 100}%`;

// Каждая орбита крутится со своей скоростью; знак — направление вращения.
const ORBITS = [
  {
    d: 164.57,
    duration: 48,
    dir: 1,
    size: 31.96,
    items: [
      { kind: 'glyph', Icon: News24Regular, angle: 205 },
      { kind: 'glyph', Icon: ChatMultiple24Regular, angle: 25 },
      { kind: 'glyph', Icon: Person24Regular, angle: 300 },
    ],
  },
  {
    d: 286.46,
    duration: 68,
    dir: -1,
    size: 41.55,
    items: [
      { kind: 'app', id: 'staff', angle: 160 },
      { kind: 'app', id: 'mtoro', angle: 20 },
      { kind: 'app', id: 'queue', angle: 90 },
    ],
  },
  {
    d: 407.71,
    duration: 92,
    dir: 1,
    size: 41.55,
    items: [
      { kind: 'app', id: 'medicine', angle: 272 },
      { kind: 'app', id: 'support', angle: 335 },
      { kind: 'app', id: 'transport', angle: 205 },
    ],
  },
];

export default function OnboardingArt() {
  return (
    <div className="onb-art" style={{ aspectRatio: '1' }}>
      {ORBITS.map((o, oi) => {
        const r = o.d / 2;
        return (
          <div
            className="onb-orbit-layer"
            key={oi}
            style={{
              left: pc(CENTER - r), top: pc(CENTER - r),
              width: pc(o.d), height: pc(o.d),
              animationDuration: `${o.duration}s`,
              animationDirection: o.dir > 0 ? 'normal' : 'reverse',
            }}
          >
            <span className="onb-orbit" />
            {o.items.map((item, ii) => {
              // Позиция на окружности: центр иконки лежит ровно на линии
              const rad = (item.angle * Math.PI) / 180;
              const x = 50 + Math.cos(rad) * 50;
              const y = 50 + Math.sin(rad) * 50;
              const style = {
                left: `${x}%`, top: `${y}%`,
                width: `${(item.kind === 'app' ? o.size : o.size) / o.d * 100}%`,
                // Контр-вращение: иконка не переворачивается вместе с орбитой
                animationDuration: `${o.duration}s`,
                animationDirection: o.dir > 0 ? 'reverse' : 'normal',
              };
              if (item.kind === 'app') {
                const svc = servicesById[item.id];
                return <img className="onb-app" key={ii} src={svc?.img} alt="" style={style} />;
              }
              const { Icon } = item;
              return (
                <span className="onb-glyph" key={ii} style={style}>
                  <Icon />
                </span>
              );
            })}
          </div>
        );
      })}

      <span
        className="onb-icon"
        style={{ left: pc(CENTER - 63.93 / 2), top: pc(CENTER - 63.93 / 2), width: pc(63.93) }}
      >
        <svg viewBox="0 0 63.9294 63.9294" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <g id="Union"> <path fill-rule="evenodd" clip-rule="evenodd" d="M21.2272 23.162C22.596 23.162 23.8512 23.4694 24.973 23.9112V23.2869H30.9664V49.0085H24.973V40.0184C23.8512 40.4447 22.596 40.6427 21.2272 40.6427C19.4291 40.6427 17.8808 40.2544 16.4824 39.519C15.0973 38.7702 13.9102 37.6945 13.1111 36.3974C12.3253 35.087 11.9874 33.5872 11.9874 31.9024C11.9874 30.2175 12.3253 28.7178 13.1111 27.4073C13.9102 26.0835 15.0973 25.048 16.4824 24.2858C17.8808 23.5236 19.4291 23.162 21.2272 23.162ZM21.2272 28.1565C20.5346 28.1565 19.9985 28.335 19.4791 28.656C18.973 28.9769 18.5235 29.4678 18.2305 30.0294C17.9508 30.591 17.8559 31.1803 17.8559 31.9024C17.8559 32.6111 17.9508 33.3386 18.2305 33.9002C18.5235 34.4618 18.973 34.8412 19.4791 35.1488C19.9985 35.4563 20.5346 35.6482 21.2272 35.6482C21.9197 35.6482 22.4691 35.4563 22.9752 35.1488C23.4813 34.8412 23.9442 34.4618 24.2238 33.9002C24.5035 33.3386 24.5984 32.6111 24.5984 31.9024C24.5984 31.1803 24.5035 30.591 24.2238 30.0294C23.9442 29.4678 23.4813 28.9769 22.9752 28.656C22.4691 28.335 21.9197 28.1565 21.2272 28.1565Z" fill="currentColor"/> <path fill-rule="evenodd" clip-rule="evenodd" d="M39.0824 23.9112C40.1669 23.5202 41.3924 23.2869 42.7034 23.2869C44.5014 23.2869 46.0497 23.6752 47.4482 24.4106C48.8332 25.1595 50.0204 26.2351 50.8195 27.5322C51.6052 28.8426 51.9432 30.3424 51.9432 32.0272C51.9432 33.7121 51.6052 35.2118 50.8195 36.5223C50.0204 37.8461 48.8332 38.8816 47.4482 39.6438C46.0497 40.406 44.5014 40.7676 42.7034 40.7676C41.3923 40.7676 40.1669 40.5485 39.0824 40.1433V40.7676H33.0891V14.9211H39.0824V23.9112ZM42.7034 28.2814C42.0108 28.2814 41.4614 28.4733 40.9554 28.7808C40.4494 29.0884 39.9864 29.5927 39.7067 30.1543C39.4271 30.7159 39.3322 31.3185 39.3322 32.0272C39.3322 32.7493 39.4271 33.3385 39.7067 33.9002C39.9864 34.4617 40.4494 34.9527 40.9554 35.2736C41.4614 35.5946 42.0108 35.7731 42.7034 35.7731C43.3961 35.7731 43.9321 35.5946 44.4515 35.2736C44.9575 34.9527 45.407 34.4618 45.7001 33.9002C45.9798 33.3385 46.0747 32.7493 46.0747 32.0272C46.0747 31.3185 45.9798 30.7159 45.7001 30.1543C45.407 29.5927 44.9575 29.0884 44.4515 28.7808C43.9321 28.4733 43.3961 28.2814 42.7034 28.2814Z" fill="currentColor"/> </g>
        </svg>
      </span>
    </div>
  );
}
