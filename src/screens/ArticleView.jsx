import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  CaretLeft, Heart, ChatCircle, BookmarkSimple, Eye, ShareNetwork, X, PaperPlaneRight,
} from '@phosphor-icons/react';
import { basePosts } from '../data/feed';
import { Sk } from '../components/Skeleton';
import { useKeyboardInset } from '../utils/useKeyboardInset';
import './ArticleView.css';

// Мок-комментарии для боттом-шита — как в Medium: аватар, имя, текст, лайк.
const commentAuthors = [
  { name: 'Айгерим Оспанова', avatar: 'https://randomuser.me/api/portraits/women/68.jpg' },
  { name: 'Нурлан Бейсенов', avatar: 'https://randomuser.me/api/portraits/men/45.jpg' },
  { name: 'Динара Токтарова', avatar: 'https://randomuser.me/api/portraits/women/21.jpg' },
  { name: 'Арман Ахметов', avatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
  { name: 'Салтанат Ералиева', avatar: 'https://randomuser.me/api/portraits/women/54.jpg' },
  { name: 'Ербол Ержанов', avatar: 'https://randomuser.me/api/portraits/men/17.jpg' },
];
const commentTexts = [
  'Отличная новость, давно этого ждали!',
  'А где можно посмотреть подробности по срокам реализации?',
  'Спасибо за материал, было интересно почитать 👍',
  'У нас на площадке уже внедрили похожее — результаты хорошие.',
  'Подскажите, а на другие цеха это тоже распространят?',
  'Круто, что делитесь такими новостями открыто.',
  'Хотелось бы больше деталей про экономический эффект.',
  'Поддерживаю инициативу, давно пора было.',
];
const commentTimes = ['2 ч', '5 ч', '8 ч', 'вчера', '2 дня', '3 дня'];

function buildComments(count) {
  const n = Math.max(3, Math.min(count || 5, 8));
  return Array.from({ length: n }, (_, i) => ({
    id: i,
    author: commentAuthors[i % commentAuthors.length],
    text: commentTexts[i % commentTexts.length],
    time: commentTimes[i % commentTimes.length],
    likes: (i * 7) % 24,
  }));
}

const myAvatar = '/img/profile/avatar-photo.png';

// Боттом-шит с комментариями — открывается по тапу на счётчик комментов.
function CommentsSheet({ open, onClose, count }) {
  const initial = useMemo(() => buildComments(Number(String(count ?? 0).replace(/\s/g, ''))), [count]);
  const [comments, setComments] = useState(initial);
  const [input, setInput] = useState('');

  useEffect(() => { setComments(initial); }, [initial]);

  useKeyboardInset();

  const send = () => {
    const text = input.trim();
    if (!text) return;
    setComments((c) => [
      { id: `mine-${c.length}`, author: { name: 'Вы', avatar: myAvatar }, text, time: 'сейчас', likes: 0 },
      ...c,
    ]);
    setInput('');
  };
  const onKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } };

  return (
    <div className={`comments-overlay ${open ? 'open' : ''}`} onClick={onClose} aria-hidden={!open}>
      <div className="comments-sheet" onClick={(e) => e.stopPropagation()}>
        <span className="comments-handle" />
        <div className="comments-header">
          <h2 className="comments-title">Комментарии <span>{comments.length}</span></h2>
          <button className="comments-close" onClick={onClose} aria-label="Закрыть"><X size={20} /></button>
        </div>
        <div className="comments-list">
          {comments.map((c) => (
            <div className="comment-row" key={c.id}>
              <span className="comment-avatar"><img src={c.author.avatar} alt="" loading="lazy" /></span>
              <div className="comment-body">
                <div className="comment-meta"><span className="comment-author">{c.author.name}</span><span className="comment-time">{c.time}</span></div>
                <p className="comment-text">{c.text}</p>
                <button className="comment-like"><Heart size={14} />{c.likes}</button>
              </div>
            </div>
          ))}
        </div>
        <div className="comments-input-row">
          <span className="comment-avatar comment-avatar--me"><img src={myAvatar} alt="" /></span>
          <div className="comments-input">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKey}
              placeholder="Написать комментарий…"
            />
          </div>
          <button
            className="comments-send"
            onClick={send}
            disabled={!input.trim()}
            aria-label="Отправить"
          >
            <PaperPlaneRight size={20} weight="fill" color="#fff" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Скелетон тела статьи — один раз при каждом открытии, пока «грузится» контент.
function ArticleSkeleton() {
  return (
    <>
      <div className="ar-cover"><span className="sk" style={{ width: '100%', height: '100%', display: 'block' }} /></div>
      <div className="ar-content">
        <Sk w={130} h={13} style={{ marginBottom: 14 }} />
        <Sk w="90%" h={22} style={{ marginBottom: 8 }} />
        <Sk w="55%" h={22} style={{ marginBottom: 20 }} />
        <Sk w="100%" h={14} style={{ marginBottom: 8 }} />
        <Sk w="97%" h={14} style={{ marginBottom: 8 }} />
        <Sk w="80%" h={14} style={{ marginBottom: 24 }} />
        <Sk w="100%" h={14} style={{ marginBottom: 8 }} />
        <Sk w="90%" h={14} style={{ marginBottom: 8 }} />
        <Sk w="65%" h={14} />
      </div>
    </>
  );
}

// Общий шаблон «тела» статьи — один текст на все публикации (экономим токены),
// но с подстановкой канала/заголовка для минимальной релевантности.
function buildBody(p) {
  const readMin = Math.max(2, Math.round(((p.title?.length || 0) + (p.excerpt?.length || 0)) / 90));
  return {
    readMin,
    quote: '«Главное — что каждый сотрудник видит результат своими глазами», — отмечают в пресс-службе.',
    bullets: [
      'Повышение эффективности процессов',
      'Снижение издержек на местах',
      'Вовлечённость сотрудников в изменения',
    ],
    closing: `Следите за обновлениями в разделе «${p.channel}» — qollab расскажет о результатах в одном из следующих выпусков.`,
  };
}

export default function ArticleView() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const p = state?.post || basePosts[0];
  const [closing, setClosing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const body = buildBody(p);
  const hero = p.thumb || '/img/posts/thumb-1.png';

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(t);
  }, []);

  const close = () => {
    setClosing(true);
    setTimeout(() => navigate(-1), 260);
  };

  return (
    <div className={`article ${closing ? 'closing' : ''}`}>
      <header className="ar-header">
        <button className="ar-back" onClick={close} aria-label="Назад"><CaretLeft size={24} /></button>
        <div className="ar-header-chan">
          <span className="ar-header-avatar"><img src={p.avatar} alt="" /></span>
          <span className="ar-header-name">{p.channel}</span>
        </div>
        <button
          className={`ar-header-save ${saved ? 'active' : ''}`}
          onClick={() => setSaved((v) => !v)}
          aria-label="В избранное"
        >
          <BookmarkSimple size={20} weight={saved ? 'fill' : 'regular'} />
        </button>
      </header>

      <div className="ar-body">
        {loading ? <ArticleSkeleton /> : (
          <>
            <div className="ar-cover"><img src={hero} alt="" /></div>
            <div className="ar-content">
              <div className="ar-meta">{p.channel} · {p.date} · {body.readMin} мин чтения</div>
              <h1 className="ar-title">{p.title}</h1>
              {p.excerpt && <p className="ar-lead">{p.excerpt}</p>}

              <p>Команда «{p.channel}» рассказывает: инициатива уже проходит обкатку на нескольких площадках, а первые результаты превысили ожидания менеджмента. По словам участников проекта, изменения затронут ежедневные процессы и заметны уже в первые недели.</p>

              <h2>Что дальше</h2>
              <p>В ближайшие месяцы практику планируют распространить на другие предприятия группы. Полученный опыт ляжет в основу внутренних стандартов и будет представлен на ближайшей стратегической сессии.</p>

              <blockquote className="ar-quote">{body.quote}</blockquote>

              <div className="ar-inline-img"><img src={hero} alt="" /></div>

              <ul className="ar-list">
                {body.bullets.map((b) => <li key={b}>{b}</li>)}
              </ul>

              <p>{body.closing}</p>
            </div>
          </>
        )}
      </div>

      {/* Те же метрики, что в превью (лайки, комментарии, просмотры), плюс
          «поделиться» — оно есть только здесь, на самой публикации. */}
      <div className="ar-actions">
        <button className={`ar-act ${liked ? 'liked' : ''}`} onClick={() => setLiked((v) => !v)}>
          <Heart size={20} weight={liked ? 'fill' : 'regular'} />
          {Number(String(p.likes ?? 0).replace(/\s/g, '')) + (liked ? 1 : 0)}
        </button>
        <button className="ar-act" onClick={() => setCommentsOpen(true)}>
          <ChatCircle size={20} />{p.comments ?? 0}
        </button>
        <span className="ar-act ar-act--stat"><Eye size={20} />{p.views ?? '502'}</span>
        <span className="ar-actions-gap" />
        <button className="ar-act ar-act--icon" aria-label="Поделиться"><ShareNetwork size={20} /></button>
      </div>

      <CommentsSheet open={commentsOpen} onClose={() => setCommentsOpen(false)} count={p.comments} />
    </div>
  );
}
