import './Splash.css';

// Экран загрузки — вид из Figma (node 19572:9581). Держится на экране
// SPLASH_HOLD мс (см. App.jsx), затем уезжает вниз по классу .splash--exit.
export default function Splash({ exiting }) {
  return (
    <div className={`splash${exiting ? ' splash--exit' : ''}`}>
      <img className="splash-wordmark" src="/img/splash/qollab-wordmark-white.svg" alt="qollab" />
      <img className="splash-mark" src="/img/splash/erg-mark-white.svg" alt="" />
    </div>
  );
}
