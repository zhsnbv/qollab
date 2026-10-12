import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CaretLeft, ShareNetwork } from '@phosphor-icons/react';
import { PostCard } from '../components/Feed';
import { useChannels } from '../context/ChannelsContext';
import { usePublications } from '../components/publications/usePublications';
import './ChannelView.css';
import { useScrolled } from '../utils/useScrolled';

// Аватарки подписчиков в строке «N подписчиков» — просто цветные кружки,
// отдельных изображений под них в макете нет.
const FACE_TONES = ['#4a4a4a', '#ef7f1a', '#22c55e'];

// Просмотр канала (Figma node 24627-79597): обложка, шапка канала, описание,
// кнопка подписки и лента публикаций этого канала.
export default function ChannelView() {
  const [scrolled, onScroll] = useScrolled();
  const navigate = useNavigate();
  const { channelId } = useParams();
  const { channels, toggle } = useChannels();
  const { posts } = usePublications();
  const channel = channels.find(c => c.id === channelId);
  const subscribed = channel?.subscribed;
  const [closing, setClosing] = useState(false);

  const close = () => {
    setClosing(true);
    setTimeout(() => navigate(-1), 260);
  };

  if (!channel) {
    return (
      <div className="chanview">
        <header className={`cv-top ${scrolled ? 'hdr-shadow' : ''}`}>
          <button className="cv-back" onClick={close} aria-label="Назад"><CaretLeft size={24} /></button>
          <h1 className="cv-title">Канал</h1>
          <span className="cv-back hdr-spacer" aria-hidden="true" />
        </header>
        <p className="cv-empty">Канал не найден.</p>
      </div>
    );
  }

  const list = posts.filter(post => post.channelId === channelId);

  return (
    <div className={`chanview ${closing ? 'closing' : ''}`}>
      <header className="cv-top">
        <button className="cv-back" onClick={close} aria-label="Назад"><CaretLeft size={24} /></button>
        <h1 className="cv-title">Канал</h1>
        <span className="cv-back hdr-spacer" aria-hidden="true" />
      </header>

      <div className="cv-scroll" onScroll={onScroll}>
        <div className="cv-cover"><img src={channel.cover} alt="" /></div>

        <div className="cv-head">
          <span className="cv-avatar"><img src={channel.avatar} alt="" /></span>
          <span className="cv-head-texts">
            <span className="cv-name">{channel.name}</span>
            <span className="cv-subs">
              <span className="cv-faces">
                {FACE_TONES.map((t, i) => <span key={i} className="cv-face" style={{ background: t }} />)}
              </span>
              {channel.subscribers}
            </span>
          </span>
        </div>

        <p className="cv-about">{channel.about}</p>

        <div className="cv-actions">
          <button
            className={`cv-sub ${subscribed ? 'is-on' : ''}`}
            disabled={channel.required} onClick={() => toggle(channelId)}
          >
            {channel.required ? 'Вы подписаны' : subscribed ? 'Отписаться от канала' : 'Подписаться на канал'}
          </button>
          <button className="cv-share" aria-label="Поделиться каналом"><ShareNetwork size={20} /></button>
        </div>

        <div className="cv-posts cv-posts--publications">
          {list.map(p => <PostCard key={p.id} p={p} />)}
          {!list.length && <p className="cv-empty">Публикаций пока нет.</p>}
        </div>

        <div className="cv-bottom-spacer" />
      </div>
    </div>
  );
}
