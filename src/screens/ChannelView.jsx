import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CaretLeft, ShareNetwork } from '@phosphor-icons/react';
import { PostCard } from '../components/Feed';
import { channelList } from '../data/channels';
import { basePosts } from '../data/feed';
import './ChannelView.css';

// Аватарки подписчиков в строке «N подписчиков» — просто цветные кружки,
// отдельных изображений под них в макете нет.
const FACE_TONES = ['#4a4a4a', '#ef7f1a', '#22c55e'];

// Просмотр канала (Figma node 24627-79597): обложка, шапка канала, описание,
// кнопка подписки и лента публикаций этого канала.
export default function ChannelView() {
  const navigate = useNavigate();
  const { channelId } = useParams();
  const channel = channelList.find((c) => c.id === channelId);
  const [subscribed, setSubscribed] = useState(channel?.subscribed ?? false);
  const [closing, setClosing] = useState(false);

  const close = () => {
    setClosing(true);
    setTimeout(() => navigate(-1), 260);
  };

  if (!channel) {
    return (
      <div className="chanview">
        <header className="cv-top">
          <button className="cv-back" onClick={close} aria-label="Назад"><CaretLeft size={24} /></button>
          <h1 className="cv-title">Канал</h1>
          <span className="cv-back hdr-spacer" aria-hidden="true" />
        </header>
        <p className="cv-empty">Канал не найден.</p>
      </div>
    );
  }

  // В прототипе у постов нет привязки к каналу по id — показываем публикации
  // с совпадающим названием канала, иначе всю базовую ленту.
  const posts = basePosts.filter((p) => p.channel === channel.name);
  const list = posts.length ? posts : basePosts;

  return (
    <div className={`chanview ${closing ? 'closing' : ''}`}>
      <header className="cv-top">
        <button className="cv-back" onClick={close} aria-label="Назад"><CaretLeft size={24} /></button>
        <h1 className="cv-title">Канал</h1>
        <span className="cv-back hdr-spacer" aria-hidden="true" />
      </header>

      <div className="cv-scroll">
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
            onClick={() => setSubscribed((v) => !v)}
          >
            {subscribed ? 'Отписаться от канала' : 'Подписаться на канал'}
          </button>
          <button className="cv-share" aria-label="Поделиться каналом"><ShareNetwork size={20} /></button>
        </div>

        <div className="cv-posts">
          {list.map((p, i) => <PostCard key={i} p={p} />)}
        </div>

        <div className="cv-bottom-spacer" />
      </div>
    </div>
  );
}
