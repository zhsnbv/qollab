import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Chats from '../screens/Chats';
import BottomNav from '../components/BottomNav';
import Message from '../components/Message';
import MessageMenu from '../components/MessageMenu';
import '../screens/ChatRoom.css';

// Меню сообщения привязано к настоящему узлу в ленте: копия снимается с него,
// а панели считаются от его рамки. Поэтому в витрине мы не подставляем меню
// в пустоту, а открываем его на живом бабле — как делает долгое нажатие.
export function MessageMenuDemo({ mine = false }) {
  const [menu, setMenu] = useState(null);
  const boxRef = useRef(null);
  const msg = mine
    ? { id: 2, text: 'Сегодня доделаю и скину на ревью', time: '13:24', status: 'read' }
    : { id: 1, text: 'Привет! Как продвигается задача?', time: '13:21' };

  useLayoutEffect(() => {
    const node = boxRef.current?.querySelector('.msg');
    const bubble = boxRef.current?.querySelector('.msg-bubble');
    if (!node || !bubble) return;
    setMenu({ rect: bubble.getBoundingClientRect(), node });
  }, []);

  return (
    <div className="cr-list" ref={boxRef} style={{ padding: '120px 12px 0' }}>
      <Message msg={msg} mine={mine} firstOfGroup lastOfGroup withAvatarSlot={false} />
      {menu && (
        <MessageMenu
          msg={msg}
          mine={mine}
          rect={menu.rect}
          node={menu.node}
          onClose={() => {}}
          onAction={() => {}}
          onReact={() => {}}
        />
      )}
    </div>
  );
}

// Режим выбора живёт состоянием внутри экрана, поэтому витрина не подделывает
// его разметку, а нажимает тот же карандаш, что и человек.
export function ChatsSelecting() {
  const boxRef = useRef(null);
  const done = useRef(false);

  useEffect(() => {
    const t = setInterval(() => {
      const pencil = boxRef.current?.querySelector('[aria-label="Выбрать чаты"]');
      if (!pencil || done.current) return;
      done.current = true;
      pencil.click();
      clearInterval(t);
    }, 120);
    return () => clearInterval(t);
  }, []);

  return (
    <div ref={boxRef} style={{ display: 'contents' }}>
      <Chats />
      <BottomNav />
    </div>
  );
}
