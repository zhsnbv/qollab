import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CaretLeft } from '@phosphor-icons/react';
import QrCode from '../components/QrCode';
import { me, corpData } from '../data/profile';
import './ProfileQr.css';

const tabNumber = corpData.find((d) => d.label === 'Табельный номер')?.value || '';

const two = (n) => String(n).padStart(2, '0');
const clock = (d) => `${two(d.getHours())}:${two(d.getMinutes())}:${two(d.getSeconds())}`;
const day = (d) => `${two(d.getDate())}.${two(d.getMonth() + 1)}.${d.getFullYear()}`;

// Пропуск по табельному номеру. Часы идут с секундами и не останавливаются:
// по ним охрана отличает живой экран от скриншота — на снимке время застынет.
export default function ProfileQr() {
  const navigate = useNavigate();
  const [closing, setClosing] = useState(false);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const close = () => {
    setClosing(true);
    setTimeout(() => navigate(-1), 260);
  };

  // Код обновляется вместе с секундой — статичную картинку не переслать
  const payload = `qollab:pass:${tabNumber}:${Math.floor(now.getTime() / 1000)}`;

  return (
    <div className={`pqr ${closing ? 'closing' : ''}`}>
      <header className="pqr-top">
        <button className="pqr-back" onClick={close} aria-label="Назад"><CaretLeft size={24} /></button>
        <h1 className="pqr-title">Показать QR</h1>
        <span className="pqr-back pqr-spacer" aria-hidden />
      </header>

      <div className="pqr-body">
        <div className="pqr-card"><QrCode value={payload} size={220} /></div>
        <div className="pqr-clock">{clock(now)}</div>
        <div className="pqr-date">{day(now)}</div>
        <div className="pqr-person">
          <div className="pqr-name">{me.name}</div>
          <div className="pqr-role">{me.role}</div>
        </div>
      </div>
    </div>
  );
}
