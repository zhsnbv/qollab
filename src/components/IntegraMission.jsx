import { useEffect, useRef, useState } from 'react';
import './IntegraMission.css';

const LOGO = '/img/integra/logo_integra_blue.svg';
const particles = Array.from({ length: 48 }, (_, i) => ({
  left: `${4 + ((i * 61.8034) % 92)}%`,
  top: `${7 + ((i * 37.7) % 84)}%`,
  size: `${i % 17 === 0 ? 3.2 : i % 7 === 0 ? 3 : i % 3 === 0 ? 1.8 : 1}px`,
  duration: `${8 + (i % 8)}s`,
  delay: `${-(i * 1.73)}s`,
  drift: `${i % 2 === 0 ? 4 : -4}px`,
  brightness: 0.45 + (i % 5) * 0.1,
  className: i % 17 === 0 ? 'is-sparkle' : i % 7 === 0 ? 'is-soft' : undefined,
}));

export default function IntegraMission() {
  const heroRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    let visible = false;
    const update = () => setPlaying(visible && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      update();
    }, { threshold: 0.2 });
    observer.observe(heroRef.current);
    document.addEventListener('visibilitychange', update);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', update);
    };
  }, []);

  return (
    <div className="integra-mission">
      <div className="integra-mission-glow" aria-hidden="true" />
      <div ref={heroRef} className={`integra-mission-hero${playing ? ' is-playing' : ''}`}>
        <div className="integra-mission-particles" aria-hidden="true">
          {particles.map((p, i) => <span key={i} className={p.className} style={{
            left: p.left, top: p.top, width: p.size, height: p.size,
            animationDuration: p.duration, animationDelay: p.delay,
            '--drift': p.drift, '--brightness': p.brightness,
          }} />)}
        </div>
        <div className="integra-mission-logo">
          <img src={LOGO} width="243" height="84" alt="Integra Construction" />
          <span className="integra-mission-shine" aria-hidden="true" />
        </div>
      </div>
      <div className="integra-mission-content">
        <p className="integra-mission-statement">Мы строим<br />во благо общества.</p>
        <ul className="integra-mission-values" aria-label="Ценности бренда">
          <li>Профессионализм</li>
          <li>Командная работа</li>
          <li>Надёжность</li>
        </ul>
      </div>
    </div>
  );
}
