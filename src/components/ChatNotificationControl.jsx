import { NOTIFICATION_MODES } from '../data/chatNotificationModes';
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Alert24Filled, AlertOff24Filled, Mention24Filled } from '@fluentui/react-icons';
import ActionSheet from './ActionSheet';
import Portal from './Portal';
import ConfirmDialog from './ConfirmDialog';
import Toast from './Toast';
import { saveNotificationMode, useChatNotificationModes } from '../utils/chatNotifications';
import './ChatNotificationControl.css';

const icons = { on: Alert24Filled, mentions: Mention24Filled, off: AlertOff24Filled };
const labels = { on: 'Уведомления включены', mentions: 'Только упоминания', off: 'Уведомления отключены' };

export default function ChatNotificationControl({ chatKey, group = false, initialMode = 'on', previewState }) {
  const saved = useChatNotificationModes();
  const mode = previewState?.mode || saved[chatKey] || initialMode;
  const [open, setOpen] = useState(!!previewState?.open);
  const [pending, setPending] = useState(previewState?.pending || null);
  const [failed, setFailed] = useState(previewState?.failed || null);
  const [toast, setToast] = useState(previewState?.toast || '');
  const [permission, setPermission] = useState(!!previewState?.permission);
  const timer = useRef(null);
  const busy = useRef(false);
  const location = useLocation();
  const navigate = useNavigate();
  // Deterministic review scenarios; no real push subscription or server request.
  const failOnce = useRef(new URLSearchParams(location.search).get('notificationError') === '1');
  useEffect(() => () => clearTimeout(timer.current), []);
  const Icon = icons[pending || mode];
  const pick = (next) => {
    if (busy.current) return;
    if (next === mode) { setOpen(false); return; }
    busy.current = true;
    setFailed(null);
    setPending(next);
    timer.current = setTimeout(() => {
      try {
        if (failOnce.current || navigator.onLine === false) {
          failOnce.current = false;
          throw new Error('Network unavailable');
        }
        saveNotificationMode(chatKey, next);
        setToast(labels[next]);
      } catch { setFailed(next); }
      setPending(null);
      setOpen(false);
      busy.current = false;
    }, 280);
  };
  const show = () => {
    setToast('');
    const denied = new URLSearchParams(location.search).get('notificationPermission') === 'denied';
    let deviceDenied = false;
    try { deviceDenied = localStorage.getItem('qollab-push-permission') === 'denied'; } catch { /* storage may be unavailable */ }
    if (denied || deviceDenied || (typeof Notification !== 'undefined' && Notification.permission === 'denied')) setPermission(true);
    else setOpen(true);
  };
  return <>
    <button className="quick-item notification-control" onClick={show} aria-label={`Уведомления: ${labels[mode]}`}>
      <span className="quick-ico"><Icon /></span>
      <span className="quick-label">Уведомления</span>
    </button>
    {open && <ActionSheet title={group ? 'Уведомления группы' : 'Уведомления чата'}
      items={NOTIFICATION_MODES.filter((item) => group || item.id !== 'mentions')}
      selected={pending || mode} confirming={pending} onPick={pick}
      onClose={() => { if (!busy.current) setOpen(false); }} />}
    {failed && <Portal><div className="notification-error" role="alert">
      <span>Не удалось изменить уведомления.</span>
      <button disabled={!!pending} onClick={() => { setOpen(true); pick(failed); }}>Повторить</button>
      <button aria-label="Закрыть ошибку" onClick={() => setFailed(null)}>×</button>
    </div></Portal>}
    {permission && <Portal><ConfirmDialog title="Уведомления запрещены"
      text="Разрешите уведомления для qollab в настройках устройства или браузера. После этого можно настроить уведомления чата."
      confirmLabel="Настройки разрешений" onConfirm={() => { setPermission(false); navigate('/settings/permissions', { state: { background: location } }); }}
      cancelLabel="Понятно" onCancel={() => setPermission(false)} /></Portal>}
    <Toast text={toast} onDone={() => { if (!previewState) setToast(''); }} duration={previewState ? 2147483647 : 2200} />
  </>;
}
