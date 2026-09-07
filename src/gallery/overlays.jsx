import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Chats from '../screens/Chats';
import BottomNav from '../components/BottomNav';
import Message from '../components/Message';
import MessageMenu from '../components/MessageMenu';
import AuthErrorView from '../components/AuthErrorView';
import { normalizeAuthError, STAGE } from '../utils/authError';
import { scenarioById } from '../data/authScenarios';
import { CaretLeft } from '@phosphor-icons/react';
import '../screens/ChatRoom.css';
import '../screens/Auth.css';

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

// ── Ошибка авторизации ────────────────────────────────────────────────────
// Экран собирается из настоящего ответа «сервера» и того же нормализатора,
// что и в живом флоу: витрина показывает не картинку, а результат разбора.
export function AuthErrorScreen({ scenario, open = false }) {
  const raw = scenarioById(scenario).respond();
  const error = normalizeAuthError({ stage: STAGE.confirmCode, ...raw });
  return (
    <div className="auth">
      <header className="auth-top">
        <span className="auth-top-btn"><CaretLeft size={24} /></span>
        <h1 className="auth-top-title">Ошибка</h1>
        <span className="auth-top-btn hdr-spacer" aria-hidden="true" />
      </header>
      <div className="auth-scroll">
        <AuthErrorView error={error} onRetry={() => {}} onRestart={() => {}} defaultOpen={open} />
      </div>
    </div>
  );
}

// ── Карточки внутренних ссылок ────────────────────────────────────────────
// Три сообщения подряд: приложение, приглашение и отозванное приглашение.
// В живом чате они появляются по сценарию через полминуты — здесь сразу.
const LINK_MSGS = [
  { id: 'l1', time: '12:24', text: 'Правки жду на почте: https://link.qollab.kz/apps?command=apps&id=mail-2&to_url=%2Finbox' },
  { id: 'l2', time: '12:25', text: 'И залетайте в группу продукта https://link.qollab.kz/?command=invite&token=inv_7f3ac2' },
  { id: 'l3', time: '12:26', text: 'Старая ссылка уже не работает: https://link.qollab.kz/?command=invite&token=inv_expired' },
];

export function LinkPreviewMessages() {
  return (
    <div className="cr-list" style={{ padding: '16px 12px' }}>
      {LINK_MSGS.map((m) => (
        <Message key={m.id} msg={m} firstOfGroup lastOfGroup withAvatarSlot={false} onOpenLink={() => {}} />
      ))}
    </div>
  );
}
