import { User, ChatCircle, Smiley } from '@phosphor-icons/react';

// Скелетон «подключения» к чату: бабл на каждое сообщение (имя/время теперь
// внутри самого бабла, отдельной строки над ним больше нет), аватар — только
// на последнем сообщении серии, снизу — как в реальной вёрстке сообщений.
// Общий для группового и личных чатов (ChatRoom.jsx / DMChat.jsx).
export function ConnectingSkeleton() {
  const rows = [
    { mine: false, w: 210, h: 44, avatar: false },
    { mine: false, w: 150, h: 40, avatar: true },
    { mine: true, w: 190, h: 40 },
    { mine: false, w: 240, h: 62, avatar: true },
    { mine: true, w: 140, h: 40 },
    { mine: false, w: 200, h: 40, avatar: true },
  ];
  return (
    <div className="cr-skeleton">
      {rows.map((r, i) => (
        <div key={i} className={`cr-sk-row ${r.mine ? 'mine' : ''}`} style={{ opacity: 1 - i * 0.12 }}>
          {!r.mine && <span className={`cr-sk-avatar sk ${r.avatar ? '' : 'cr-sk-avatar--ghost'}`} />}
          <span className="cr-sk-bubble sk" style={{ width: r.w, height: r.h }} />
        </div>
      ))}
    </div>
  );
}

// Пустой чат — ещё нет переписки.
export function EmptyState() {
  return (
    <div className="cr-empty">
      <div className="cr-empty-icons">
        <span className="cr-empty-circle cr-empty-circle--side" style={{ transform: 'rotate(-6deg)' }}>
          <User size={30} color="var(--color-light)" />
        </span>
        <span className="cr-empty-circle cr-empty-circle--main">
          <ChatCircle size={40} weight="fill" color="var(--color-primary)" />
        </span>
        <span className="cr-empty-circle cr-empty-circle--side" style={{ transform: 'rotate(6deg)' }}>
          <Smiley size={30} color="var(--color-light)" />
        </span>
      </div>
      <div className="cr-empty-title">Нет сообщений</div>
      <div className="cr-empty-sub">Напишите что-нибудь, чтобы начать чат</div>
    </div>
  );
}
