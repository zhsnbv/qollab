import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, DownloadSimple, Camera, Trash } from '@phosphor-icons/react';
import { me } from '../data/profile';
import './ProfilePhoto.css';

// Фото профиля (Figma node 24313:1951): крупный круглый портрет и три
// действия под ним.
const ACTIONS = [
  { id: 'save', label: 'Скачать', Icon: DownloadSimple },
  { id: 'update', label: 'Обновить', Icon: Camera },
  { id: 'delete', label: 'Удалить', Icon: Trash },
];

export default function ProfilePhoto() {
  const navigate = useNavigate();
  const [closing, setClosing] = useState(false);

  const close = () => {
    setClosing(true);
    setTimeout(() => navigate(-1), 240);
  };

  return (
    <div className={`photoview ${closing ? 'closing' : ''}`}>
      <header className="pv-top">
        <span className="pv-side" aria-hidden="true" />
        <h1 className="pv-title">Фото профиля</h1>
        <button className="pv-close" onClick={close} aria-label="Закрыть"><X size={24} /></button>
      </header>

      <div className="pv-body">
        <div className="pv-photo"><img src={me.avatar} alt={me.name} /></div>
      </div>

      <div className="pv-actions">
        {ACTIONS.map(({ id, label, Icon }) => (
          <button className="pv-action" key={id}>
            <Icon size={24} weight={id === 'save' ? 'regular' : 'fill'} />
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
