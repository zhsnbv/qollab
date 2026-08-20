import { useEffect, useRef, useState } from 'react';
import { Play, Stop, FileText, Check, Checks, Clock } from '@phosphor-icons/react';
import MessageReactions from './MessageReactions';

// Псевдослучайная волна для войса (стабильная между рендерами)
const WAVE = [4, 12, 16, 6, 20, 4, 24, 12, 17, 16, 8, 7, 20, 6, 24, 5, 17, 4, 10, 14, 6, 18, 9];

function parseDuration(d) {
  const [m, s] = (d || '0:00').split(':').map(Number);
  return (m || 0) * 60 + (s || 0);
}
function formatDuration(total) {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

// Плеер голосового: по тапу — таймер идёт с 0:00, иконка меняется на «стоп»;
// повторный тап или конец записи возвращают исходную длительность и «плей».
function VoiceBubble({ duration, mine, time, status }) {
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const totalRef = useRef(parseDuration(duration));
  const timerRef = useRef(null);

  useEffect(() => () => clearInterval(timerRef.current), []);

  const toggle = () => {
    if (playing) {
      clearInterval(timerRef.current);
      setPlaying(false);
      setElapsed(0);
      return;
    }
    setPlaying(true);
    setElapsed(0);
    timerRef.current = setInterval(() => {
      setElapsed((e) => {
        if (e + 1 >= totalRef.current) {
          clearInterval(timerRef.current);
          setPlaying(false);
          return 0;
        }
        return e + 1;
      });
    }, 1000);
  };

  return (
    <div className="msg-bubble msg-bubble--voice">
      <button className="voice-play" onClick={toggle} aria-label={playing ? 'Стоп' : 'Слушать'}>
        {playing ? <Stop size={16} weight="fill" color="#fff" /> : <Play size={18} weight="fill" color="#fff" />}
      </button>
      <span className={`voice-wave ${playing ? 'playing' : ''}`}>
        {WAVE.map((h, i) => <i key={i} style={{ height: h, animationDelay: `${i * 0.06}s` }} />)}
      </span>
      <span className="voice-time">{playing ? formatDuration(elapsed) : duration}</span>
      <TimeRow time={time} mine={mine} status={status} />
    </div>
  );
}

// Подсветка @упоминаний вида «@Имя Ф.» оранжевым.
function renderText(text) {
  const parts = text.split(/(@[А-ЯЁ][а-яё]+\s[А-ЯЁ]\.)/g);
  return parts.map((p, i) => (/^@[А-ЯЁ]/.test(p) ? <span className="msg-mention" key={i}>{p}</span> : p));
}

// Галочки прочтения — аналог WhatsApp: часы (отправляется) → одна серая
// (отправлено) → две серые (доставлено) → две оранжевые (прочитано, только
// личные чаты — в групповых прочтение не отслеживаем, максимум серые).
function StatusTicks({ status }) {
  if (status === 'sending') return <Clock size={12} color="var(--color-weak)" />;
  if (status === 'sent') return <Check size={13} color="var(--color-weak)" />;
  if (status === 'read') return <Checks size={15} color="var(--color-primary)" />;
  return <Checks size={15} color="var(--color-weak)" />; // delivered — дефолт
}

function TimeRow({ time, mine, status, variant = 'overlay' }) {
  return (
    <span className={`msg-time-row msg-time-row--${variant}`}>
      <span className="msg-time">{time}</span>
      {mine && <StatusTicks status={status} />}
    </span>
  );
}

// Низ бабла: реакции и время в одной строке. Пока реакций нет, время
// остаётся на своём месте — в правом нижнем углу поверх паддинга, чтобы
// короткие сообщения не растягивались.
function BubbleFooter({ reactions, mine, msg, onToggleReaction }) {
  const hasReactions = Object.values(reactions || {}).some((u) => u.length > 0);
  if (!hasReactions) return <TimeRow time={msg.time} mine={mine} status={msg.status} />;
  return (
    <div className="msg-footer">
      <MessageReactions groups={reactions} mine={mine} onToggle={onToggleReaction} />
      <TimeRow time={msg.time} mine={mine} status={msg.status} variant="inline" />
    </div>
  );
}

// Одно сообщение в чате. Имя/аватар автора показываются только на первом
// (имя) и последнем (аватар) сообщении серии одного автора — время и статус
// прочтения теперь внутри самого бабла, на каждом сообщении (как в WhatsApp).
// Долгое нажатие открывает меню действий. Ловим руками, а не через
// contextmenu: на touch-устройствах он не срабатывает, а на десктопе даёт
// системное меню браузера.
function useLongPress(onLongPress, msg) {
  const timer = useRef(null);
  const moved = useRef(false);

  const start = (e) => {
    if (!onLongPress) return;
    moved.current = false;
    const el = e.currentTarget;
    timer.current = setTimeout(() => {
      if (!moved.current) onLongPress(msg, el.getBoundingClientRect());
    }, 420);
  };
  const cancel = () => clearTimeout(timer.current);
  const move = () => { moved.current = true; cancel(); };

  return {
    onPointerDown: start,
    onPointerUp: cancel,
    onPointerLeave: cancel,
    onPointerMove: move,
    onContextMenu: (e) => e.preventDefault(),
  };
}

export default function Message({
  msg, firstOfGroup, lastOfGroup, mine, avatar, authorLabel, authorColor,
  reactions, onToggleReaction, onLongPress, withAvatarSlot = true,
}) {
  const showAuthor = firstOfGroup && !mine && authorLabel;
  const press = useLongPress(onLongPress, msg);
  return (
    <div className={`msg ${mine ? 'msg--mine' : 'msg--their'} ${firstOfGroup ? 'msg--first' : ''} ${lastOfGroup ? 'msg--last' : ''}`}>
      {!mine && withAvatarSlot && <span className="msg-avatar-slot">{lastOfGroup && avatar}</span>}
      <div className="msg-col" {...press}>
        {msg.kind === 'photo' || msg.kind === 'video' ? (
          <div className="msg-bubble msg-bubble--media">
            {showAuthor && <div className="msg-author-inline" style={{ color: authorColor }}>{authorLabel}</div>}
            <div className="msg-media">
              <img src={msg.img} alt="" loading="lazy" />
              {msg.kind === 'video' && <span className="msg-video-play"><Play size={22} weight="fill" color="#fff" /></span>}
            </div>
            {msg.text && <div className="msg-text">{renderText(msg.text)}</div>}
            <BubbleFooter reactions={reactions} mine={mine} msg={msg} onToggleReaction={onToggleReaction} />
          </div>
        ) : msg.kind === 'voice' ? (
          <>
            <VoiceBubble duration={msg.duration} mine={mine} time={msg.time} status={msg.status} />
            <MessageReactions groups={reactions} mine={mine} onToggle={onToggleReaction} />
          </>
        ) : msg.kind === 'document' ? (
          <>
            <div className="msg-document">
              <span className="msg-document-icon"><FileText size={20} weight="fill" color="var(--color-primary)" /></span>
              <span className="msg-document-body">
                <span className="msg-document-name">{msg.name}</span>
                <span className="msg-document-size">{msg.size}</span>
              </span>
            </div>
            <TimeRow time={msg.time} mine={mine} status={msg.status} variant="static" />
            <MessageReactions groups={reactions} mine={mine} onToggle={onToggleReaction} />
          </>
        ) : (
          <div className="msg-bubble">
            {showAuthor && <div className="msg-author-inline" style={{ color: authorColor }}>{authorLabel}</div>}
            {msg.quote && (
              <div className="msg-quote" style={{ borderLeftColor: msg.quote.color || 'var(--color-primary)' }}>
                <div className="msg-quote-head" style={{ color: msg.quote.color || 'var(--color-text)' }}>{msg.quote.author}</div>
                <div className="msg-quote-text">{msg.quote.text}</div>
              </div>
            )}
            {msg.kind === 'link' ? (
              <a className="msg-link" href={msg.text} onClick={(e) => e.preventDefault()}>{msg.text}</a>
            ) : (
              <div className="msg-text">{renderText(msg.text)}</div>
            )}
            <BubbleFooter reactions={reactions} mine={mine} msg={msg} onToggleReaction={onToggleReaction} />
          </div>
        )}
      </div>
    </div>
  );
}
