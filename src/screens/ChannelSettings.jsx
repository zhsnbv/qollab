import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CaretLeft } from '@phosphor-icons/react';
import { useChannels } from '../context/ChannelsContext';
import { useScrolled } from '../utils/useScrolled';
import Toast from '../components/Toast';
import './Favorites.css';
import './ChannelSettings.css';

// Настройка каналов. Разделов два, потому что экран отвечает на два разных
// вопроса: что я читаю и что ещё есть. Одним списком второй вопрос теряется.
//
// Ключевое решение: строка НЕ перепрыгивает между разделами по нажатию.
// Отписались от трёх подряд — и список трижды перестроился бы под пальцем,
// а следующая кнопка оказалась бы уже не там, куда целились. Поэтому раскладка
// фиксируется на вход, строка меняет только кнопку и гаснет, а разделы
// пересобираются при следующем заходе.
export default function ChannelSettings() {
  const [scrolled, onScroll] = useScrolled();
  const navigate = useNavigate();
  const { channels, subscribedIds, toggle } = useChannels();
  const [closing, setClosing] = useState(false);
  const [toast, setToast] = useState('');

  // Раскладка снимается один раз, на вход: дальше она не меняется, что бы
  // человек ни нажимал.
  const layout = useRef(subscribedIds);
  const [wasSubscribed] = useState(() => new Set(layout.current));

  const byId = useMemo(() => Object.fromEntries(channels.map((c) => [c.id, c])), [channels]);
  const mine = channels.filter((c) => wasSubscribed.has(c.id));
  const rest = channels.filter((c) => !wasSubscribed.has(c.id));

  const close = () => {
    setClosing(true);
    setTimeout(() => navigate(-1), 260);
  };

  const onToggle = (id) => {
    const wasOn = byId[id].subscribed;
    toggle(id);
    setToast(wasOn ? `Вы отписались от «${byId[id].name}»` : `Вы подписались на «${byId[id].name}»`);
  };

  const Row = ({ c, section }) => {
    // Строка «не на своём месте»: она уже не соответствует разделу, в котором
    // стоит, и переедет при следующем заходе. Гасим её, чтобы это читалось.
    const moved = c.subscribed !== (section === 'mine');
    return (
      <div className={`chset-row ${moved ? 'moved' : ''}`}>
        {c.avatar
          ? <img className={`chset-ava ${c.fit === 'contain' ? 'chset-ava--contain' : ''}`} src={c.avatar} alt="" />
          : <span className={`chset-ava chset-ava--initials tint-${c.tint || 'orange'}`}>{c.initials}</span>}
        <span className="chset-texts">
          <span className="chset-name">{c.name}</span>
          <span className="chset-sub">{c.subscribers}</span>
        </span>
        <button
          className={`chset-btn ${c.subscribed ? 'chset-btn--on' : ''}`}
          onClick={() => onToggle(c.id)}
        >
          {c.subscribed ? 'Отписаться' : 'Подписаться'}
        </button>
      </div>
    );
  };

  return (
    <div className={`favscreen ${closing ? 'closing' : ''}`}>
      <header className={`fav-top ${scrolled ? 'hdr-shadow' : ''}`}>
        <button className="fav-back" onClick={close} aria-label="Назад"><CaretLeft size={24} /></button>
        <h1 className="fav-title">Каналы</h1>
        <span className="fav-back hdr-spacer" aria-hidden="true" />
      </header>

      <div className="fav-scroll" onScroll={onScroll}>
        <div className="fav-section-row">
          <h2 className="fav-section">Вы подписаны</h2>
          <span className="fav-count">{channels.filter((c) => c.subscribed).length}</span>
        </div>
        <div className="fav-list">
          {mine.map((c) => <Row c={c} section="mine" key={c.id} />)}
          {!mine.length && (
            <p className="fav-empty">Подписок пока нет — выберите каналы из списка ниже</p>
          )}
        </div>

        <h2 className="fav-section">Доступные мне</h2>
        <div className="fav-list">
          {rest.map((c) => <Row c={c} section="rest" key={c.id} />)}
          {!rest.length && (
            <p className="fav-empty">Вы подписаны на все доступные каналы</p>
          )}
        </div>

        {/* Кнопки «Сохранить» нет: подписка применяется в момент нажатия */}
        <div className="fav-bottom-spacer" />
      </div>

      <Toast text={toast} onDone={() => setToast('')} />
    </div>
  );
}
