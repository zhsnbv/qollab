import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  CaretRight, BellSimple, Camera, Microphone, Image, MapPin,
  BluetoothIcon, DeviceMobile, Monitor, HandPalm, QrCode,
} from '@phosphor-icons/react';
import SettingsPage from '../components/SettingsPage';
import Switch from '../components/Switch';
import ConfirmDialog from '../components/ConfirmDialog';
import Toast from '../components/Toast';
import {
  pushSources, permissions, thisDevice, activeSessions, deviceInfo,
} from '../data/settings';
import { privacySections, privacyUpdated } from '../data/privacy';
import './SettingsPages.css';

const PERM_ICONS = { BellSimple, Camera, Microphone, Image, MapPin, BluetoothIcon };

// Уведомления приходят от сервисов, а не «вообще»: выключается каждый
// по отдельности. Общего рубильника в макете нет — и правильно: человек
// отключает шумный сервис, а не связь с компанией.
export function NotificationSettings() {
  const [on, setOn] = useState(() => Object.fromEntries(pushSources.map((s) => [s.id, s.on])));
  return (
    <SettingsPage title="Настройка уведомлений">
      <h2 className="st-group-title">Push-уведомления</h2>
      <div className="sp-list">
        {pushSources.map((s) => (
          <label className="sp-row" key={s.id}>
            <span className={`sp-app ${s.logo ? 'sp-app--logo' : ''}`}>
              {s.logo ? null : s.emoji}
            </span>
            <span className="sp-label">{s.label}</span>
            <Switch
              checked={on[s.id]}
              onChange={(v) => setOn((o) => ({ ...o, [s.id]: v }))}
              label={s.label}
            />
          </label>
        ))}
      </div>
    </SettingsPage>
  );
}

// Разрешения устройства. Прототип держит своё состояние: настоящие выдаёт
// система, и подменять её диалоги приложение не должно.
export function Permissions() {
  const [on, setOn] = useState(() => Object.fromEntries(permissions.map((p) => [p.id, p.on])));
  return (
    <SettingsPage title="Настройки разрешений">
      <div className="sp-list sp-list--plain">
        {permissions.map((p) => {
          const Icon = PERM_ICONS[p.icon];
          return (
            <label className="sp-row" key={p.id}>
              <span className="sp-perm-ico">{Icon && <Icon size={24} />}</span>
              <span className="sp-label">{p.label}</span>
              <Switch
                checked={on[p.id]}
                onChange={(v) => setOn((o) => ({ ...o, [p.id]: v }))}
                label={p.label}
              />
            </label>
          );
        })}
      </div>
    </SettingsPage>
  );
}

const DEVICE_ICONS = { phone: DeviceMobile, desktop: Monitor };

// Устройства: привязка веб-версии по QR и список сессий. Завершение чужих
// сессий — разрушающее действие, поэтому красным и с подтверждением.
export function Devices() {
  const [sessions, setSessions] = useState(activeSessions);
  const [confirm, setConfirm] = useState(null);
  const [toast, setToast] = useState('');

  const endAll = () => {
    setSessions([]);
    setConfirm(null);
    setToast('Остальные сессии завершены');
  };
  const endOne = (s) => {
    setSessions((list) => list.filter((x) => x.id !== s.id));
    setConfirm(null);
    setToast(`Сессия «${s.name}» завершена`);
  };

  const Row = ({ s, onClick }) => {
    const Icon = DEVICE_ICONS[s.kind] || DeviceMobile;
    return (
      <button className="sp-row sp-session" onClick={onClick} disabled={!onClick}>
        <span className="sp-session-ico"><Icon size={24} weight="fill" /></span>
        <span className="sp-session-texts">
          <span className="sp-session-name">{s.name}</span>
          <span className="sp-session-when">{s.when}</span>
        </span>
      </button>
    );
  };

  return (
    <SettingsPage title="Устройства">
      <section className="st-card sp-link">
        <div className="sp-link-art">
          <img className="sp-art--light" src="/img/settings/devices-light.png" alt="" />
          <img className="sp-art--dark" src="/img/settings/devices-dark.png" alt="" />
        </div>
        <p className="sp-link-text">
          Отсканируйте QR-код и откройте <b>qollab.kz</b>, чтобы связать
          веб-версию с этой учётной записью.
        </p>
        <button className="sp-btn" onClick={() => setToast('Сканер QR-кода откроется здесь')}>
          <QrCode size={22} weight="fill" />
          Привязать устройство
        </button>
      </section>

      <h2 className="st-group-title sp-caps">Это устройство</h2>
      <div className="st-card">
        <Row s={thisDevice} />
        {sessions.length > 0 && (
          <button className="sp-row sp-danger" onClick={() => setConfirm({ all: true })}>
            <span className="sp-session-ico"><HandPalm size={24} weight="fill" /></span>
            <span className="sp-label">Завершить все остальные сессии</span>
          </button>
        )}
      </div>

      <h2 className="st-group-title sp-caps">Активные сессии</h2>
      {sessions.length > 0 ? (
        <>
          <div className="st-card">
            {sessions.map((s) => <Row key={s.id} s={s} onClick={() => setConfirm({ one: s })} />)}
          </div>
          <p className="sp-hint">Нажмите, чтобы выполнить выход</p>
        </>
      ) : (
        <p className="sp-hint">Других устройств нет. Привяжите веб-версию — она появится здесь.</p>
      )}

      {confirm && (
        <ConfirmDialog
          title={confirm.all ? 'Завершить остальные сессии?' : `Завершить сессию «${confirm.one.name}»?`}
          text="На этих устройствах потребуется войти заново. Это устройство останется в сети."
          confirmLabel="Завершить"
          danger
          onConfirm={() => (confirm.all ? endAll() : endOne(confirm.one))}
          onCancel={() => setConfirm(null)}
        />
      )}
      <Toast text={toast} onDone={() => setToast('')} />
    </SettingsPage>
  );
}

// Помощь: пока единственный пункт — данные об устройстве для обращения
// в поддержку.
export function Help() {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <SettingsPage title="Помощь">
      <div className="st-card">
        <button
          className="st-row"
          onClick={() => navigate('/settings/help/device', { state: { background: location } })}
        >
          <span className="st-label">Данные об устройстве</span>
          <CaretRight size={16} color="var(--color-light)" />
        </button>
      </div>
    </SettingsPage>
  );
}

// Карточку копируют целиком и присылают в обращении, поэтому кнопка кладёт
// в буфер весь список, а не отдельные поля.
export function DeviceInfo() {
  const [toast, setToast] = useState('');
  const copy = async () => {
    const text = deviceInfo.map(([k, v]) => `${k}: ${v}`).join('\n');
    try { await navigator.clipboard.writeText(text); setToast('Данные скопированы'); }
    catch { setToast('Не удалось скопировать'); }
  };
  return (
    <SettingsPage title="Данные об устройстве">
      <section className="st-card sp-info">
        <h3 className="sp-info-title">Данные об устройстве</h3>
        <dl className="sp-info-list">
          {deviceInfo.map(([k, v]) => (
            <div className="sp-info-row" key={k}>
              <dt>{k}:</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
        <button className="sp-btn" onClick={copy}>Скопировать данные</button>
      </section>
      <Toast text={toast} onDone={() => setToast('')} />
    </SettingsPage>
  );
}

// Политика конфиденциальности: текст с qollab.kz/privacy, разбитый на разделы.
export function Privacy() {
  return (
    <SettingsPage title="Конфиденциальность">
      <article className="st-card sp-doc">
        <p className="sp-doc-updated">{privacyUpdated}</p>
        {privacySections.map((s) => (
          <section key={s.title}>
            <h3 className="sp-doc-title">{s.title}</h3>
            {s.blocks.map((b, i) => (
              typeof b === 'string'
                ? <p className="sp-doc-p" key={i}>{b}</p>
                : (
                  <ul className="sp-doc-list" key={i}>
                    {b.list.map((li) => <li key={li}>{li}</li>)}
                  </ul>
                )
            ))}
          </section>
        ))}
      </article>
    </SettingsPage>
  );
}
