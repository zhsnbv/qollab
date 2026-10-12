import { useRef, useState } from 'react';
import { App, Button, Checkbox, Dropdown, Form, Input, Modal, Radio, Select, Tabs, Tooltip } from 'antd';
import { Camera20Regular, CheckmarkCircle20Filled, People20Regular, Share20Filled, Settings20Regular, Settings20Filled, AddCircle20Filled, Add20Regular, ArrowDownload20Regular, Delete20Regular, Search20Regular, ChevronDown20Regular } from '@fluentui/react-icons';
import { PEOPLE } from './data';
import { INITIAL_CHANNEL } from './channelData';
import ChannelNotifications from './ChannelNotifications';


function ChannelSettings({ channel, onSave, onClose, onArchive }) {
  const [form] = Form.useForm();
  const { modal } = App.useApp();
  return <Modal title="Настройки канала" open onCancel={onClose} width={590} className="pw-channel-settings" footer={<div className="pw-settings-footer"><Button danger type="text" icon={<Delete20Regular />} onClick={() => modal.confirm({ title: 'Удалить канал?', content: 'Публикации сохранятся. Канал можно будет восстановить.', okText: 'Удалить', cancelText: 'Отмена', okButtonProps: { danger: true }, onOk: onArchive })}>Удалить канал</Button><Button onClick={onClose}>Отмена</Button><Button type="primary" onClick={() => form.submit()}>Сохранить</Button></div>}>
    <Form form={form} layout="vertical" initialValues={channel} onFinish={values => { onSave(values); onClose(); }}>
      <Form.Item name="name" label="Название канала" rules={[{ required: true, whitespace: true, message: 'Введите название канала' }]}><Input maxLength={50} showCount /></Form.Item>
      <Form.Item name="description" label="Описание"><Input.TextArea maxLength={150} showCount autoSize={{ minRows: 2, maxRows: 4 }} /></Form.Item>
      <Form.Item name="type" label="Тип канала"><Radio.Group options={[{ value: 'public', label: 'Публичный' }, { value: 'closed', label: 'Закрытый' }]} /></Form.Item>
      <Form.Item name="visibility" label="Видимость"><Radio.Group options={[{ value: 'erg', label: 'Только для пользователей ERG' }, { value: 'all', label: 'Для всех' }]} /></Form.Item>
      <Form.Item name="authorship" label="Авторство"><Radio.Group options={[{ value: 'admins', label: 'Только администраторы' }, { value: 'all', label: 'Администраторы и подписчики' }]} /></Form.Item>
      <p className="pw-settings-caption">Дополнительные настройки</p>
      {[['audit', 'Добавить посты с обходом (для отдела опер. эффективность)'], ['project', 'Проект-улучшение'], ['hidden', 'Не показывать в разделе «Доступные каналы»'], ['notifications', 'Включить уведомления']].map(([name, label]) => <Form.Item key={name} name={name} valuePropName="checked"><Checkbox>{label}</Checkbox></Form.Item>)}
    </Form>
  </Modal>;
}

function ChannelMembers({ channel, onChange, onClose }) {
  const [tab, setTab] = useState('subscriber'), [query, setQuery] = useState(''), [adding, setAdding] = useState([]);
  const members = channel.members || INITIAL_CHANNEL.members;
  const visible = members.filter(p => p.role === tab && `${p.label} ${p.job}`.toLowerCase().includes(query.toLowerCase()));
  const updateRole = (id, role) => onChange({ members: members.map(p => p.value === id ? { ...p, role } : p) });
  const exportMembers = () => {
    const csv = '\uFEFFФИО;Должность;Роль\n' + members.map(p => [p.label, p.job, { admin: 'Администратор', subscriber: 'Подписчик', blocked: 'Черный список' }[p.role]].map(s => '"' + String(s || '').replaceAll('"', '""') + '"').join(';')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a'); link.href = url; link.download = 'Участники канала.csv'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return <Modal title="Участники канала" open onCancel={onClose} width={650} footer={<Button shape="round" icon={<ArrowDownload20Regular />} onClick={exportMembers}>Выгрузка участников</Button>}>
    <Tabs activeKey={tab} onChange={setTab} items={[['admin', 'Администраторы'], ['subscriber', 'Подписчики'], ['blocked', 'Черный список']].map(([key, label]) => ({ key, label: `${label} · ${members.filter(p => p.role === key).length}` }))} />
    <Input value={query} onChange={e => setQuery(e.target.value)} allowClear prefix={<Search20Regular />} placeholder="ФИО пользователя" aria-label="Поиск участников" />
    <div className="pw-channel-members">{visible.map(p => <div key={p.value}><span className="pw-member-avatar">{p.avatar ? <img src={p.avatar} alt="" /> : p.initials || p.label.split(' ').slice(0, 2).map(w => w[0]).join('')}</span><div><strong>{p.label}</strong><span title={p.job}>{p.job}</span></div>{p.value !== 'me' && <Dropdown trigger={['click']} menu={{ items: [['admin', 'Администратор'], ['subscriber', 'Подписчик'], ['blocked', 'Черный список']].filter(([key]) => key !== p.role).map(([key, label]) => ({ key, label })), onClick: ({ key }) => updateRole(p.value, key) }}><Button shape="circle" icon={<ChevronDown20Regular />} aria-label={`Изменить роль: ${p.label}`} /></Dropdown>}</div>)}{!visible.length && <p className="pw-members-empty">{query ? 'Никого не нашли' : 'В этом списке пока никого нет'}</p>}</div>
    <div className="pw-member-add"><Select mode="multiple" aria-label="Добавить участников" placeholder="Выберите сотрудников" value={adding} onChange={setAdding} options={PEOPLE.filter(p => !members.some(m => m.value === p.value)).map(p => ({ value: p.value, label: p.label }))} /><Button shape="round" disabled={!adding.length} icon={<Add20Regular />} onClick={() => { onChange({ members: [...members, ...PEOPLE.filter(p => adding.includes(p.value)).map(p => ({ ...p, role: tab }))] }); setAdding([]); }}>Добавить</Button></div>
  </Modal>;
}

export default function ChannelHeader({ channel, count, onChange, onSubscribe, notificationMode = 'none', onNotifications, canManage = true }) {
  const [panel, setPanel] = useState(null), [loading, setLoading] = useState(false);
  const input = useRef(null), imageKind = useRef('cover');
  const { message } = App.useApp();
  const changeImage = async event => {
    const file = event.target.files?.[0]; event.target.value = ''; if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 10 * 1024 * 1024) { message.error('Выберите JPG, PNG или WebP размером до 10 МБ'); return; }
    setLoading(true);
    try {
      const src = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(file); });
      await new Promise((resolve, reject) => { const img = new Image(); img.onload = resolve; img.onerror = reject; img.src = src; });
      onChange({ [imageKind.current]: src });
    } catch { message.error('Не удалось открыть изображение'); }
    finally { setLoading(false); }
  };
  const chooseImage = kind => { imageKind.current = kind; input.current.click(); };
  const share = async () => {
    const url = new URL(window.location.pathname, window.location.origin); url.hash = `channel=${encodeURIComponent(channel.id || 'erg-news')}`;
    try { await navigator.clipboard.writeText(url.href); message.success('Ссылка на канал скопирована'); }
    catch { setPanel('share'); }
  };
  if (channel.archived) return <section className="pw-channel-archived"><h2>Канал удалён</h2><p>Публикации и настройки сохранены.</p><Button type="primary" shape="round" onClick={() => onChange({ archived: false })}>Восстановить канал</Button></section>;
  return <>
    <section className="pw-channel-header">
      <div className="pw-channel-cover"><img src={channel.cover} alt={`Обложка канала ${channel.name}`} />{canManage && <Button className="pw-cover-edit" shape="round" icon={<Camera20Regular />} onClick={() => chooseImage('cover')} loading={loading}>Изменить обложку</Button>}</div>
      <div className="pw-channel-info">
        {canManage ? <Tooltip title="Изменить фото канала"><button className="pw-channel-photo" aria-label="Изменить фото канала" onClick={() => chooseImage('avatar')}><img src={channel.avatar} alt="" /><span><Camera20Regular /></span></button></Tooltip> : <span className="pw-channel-photo"><img src={channel.avatar} alt="" /></span>}
        <div className="pw-channel-header-actions"><Button className="pw-subscribe-button" type={channel.subscribed ? 'default' : 'primary'} shape="round" disabled={channel.required} icon={channel.subscribed ? <CheckmarkCircle20Filled /> : <AddCircle20Filled />} onClick={onSubscribe}>{channel.subscribed ? 'Вы подписаны' : 'Подписаться'}</Button><ChannelNotifications subscribed={channel.subscribed} mode={notificationMode} onChange={onNotifications} /><Tooltip title="Скопировать ссылку"><Button shape="circle" aria-label="Поделиться каналом" icon={<Share20Filled />} onClick={share} /></Tooltip>{canManage && <Dropdown trigger={['click']} menu={{ items: [{ key: 'members', label: 'Участники', icon: <People20Regular /> }, { key: 'settings', label: 'Настройки канала', icon: <Settings20Regular /> }], onClick: ({ key }) => setPanel(key) }}><Button shape="circle" aria-label="Управление каналом" icon={<Settings20Filled />} /></Dropdown>}</div>
        <div className="pw-channel-heading"><h1>{channel.name}</h1></div>
        <p className="pw-channel-description">{channel.description}</p>
        <div className="pw-channel-stats">{canManage ? <><button onClick={() => setPanel('members')}><People20Regular />{channel.members.filter(p => p.role !== 'blocked' && (channel.subscribed || p.value !== 'me')).length} участников</button><span>·</span></> : channel.subscribers && <><span>{channel.subscribers}</span><span>·</span></>}<span>{count} публикаций</span><span>·</span><span>{channel.type === 'closed' ? 'Закрытый канал' : 'Открытый канал'}</span></div>
      </div>
      <input ref={input} type="file" hidden accept="image/jpeg,image/png,image/webp" onChange={changeImage} />
    </section>
    {panel === 'settings' && <ChannelSettings channel={channel} onSave={onChange} onClose={() => setPanel(null)} onArchive={() => { onChange({ archived: true }); setPanel(null); }} />}
    {panel === 'members' && <ChannelMembers channel={channel} onChange={onChange} onClose={() => setPanel(null)} />}
    <Modal title="Ссылка на канал" open={panel === 'share'} onCancel={() => setPanel(null)} footer={null}><Input readOnly value={`${window.location.origin}${window.location.pathname}#channel=${encodeURIComponent(channel.id || 'erg-news')}`} onFocus={e => e.target.select()} /></Modal>
  </>;
}
