import './MessageReactions.css';

// Реакции под баблом: пилюля на каждый эмодзи, внутри — кто поставил.
// До трёх человек показываем аватарками, дальше — счётчиком: иначе ряд
// расползается по ширине бабла. Своя реакция подсвечена, тап по ней снимает.
const MAX_FACES = 3;

function Face({ user }) {
  if (user.avatar) return <span className="rx-face"><img src={user.avatar} alt="" /></span>;
  return <span className={`rx-face rx-face--initials tint-${user.tint || 'orange'}`}>{user.initials}</span>;
}

export default function MessageReactions({ groups, mine, onToggle }) {
  const list = Object.entries(groups || {}).filter(([, users]) => users.length > 0);
  if (list.length === 0) return null;

  return (
    <div className={`rx ${mine ? 'rx--mine' : ''}`}>
      {list.map(([emoji, users]) => {
        const byMe = users.some((u) => u.id === 'me');
        return (
          <button
            className={`rx-pill ${byMe ? 'own' : ''}`}
            key={emoji}
            onClick={() => onToggle?.(emoji)}
            aria-label={`Реакция ${emoji}, ${users.length}`}
          >
            <span className="rx-emoji">{emoji}</span>
            {users.length > MAX_FACES ? (
              <span className="rx-count">{users.length}</span>
            ) : (
              <span className="rx-faces">
                {users.map((u) => <Face key={u.id} user={u} />)}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
