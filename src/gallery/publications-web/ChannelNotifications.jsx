import { useState } from 'react';
import { Button, Dropdown, Tooltip } from 'antd';
import { Alert20Filled, AlertOn20Filled, AlertOff20Filled, Checkmark20Regular } from '@fluentui/react-icons';
import './ChannelNotifications.css';

export default function ChannelNotifications({ subscribed, mode, onChange }) {
  const [open, setOpen] = useState(false);
  const enabled = subscribed && mode === 'all';
  const options = [
    { key: 'all', icon: <AlertOn20Filled />, title: subscribed ? 'Все новые статьи' : 'Подписаться и уведомлять', hint: 'Сообщать о каждой новой публикации' },
    { key: 'none', icon: <AlertOff20Filled />, title: 'Без уведомлений', hint: 'Читать публикации в ленте' },
  ];
  return <Dropdown trigger={['click']} placement="bottomRight" align={{ overflow: { adjustX: true, adjustY: true, shiftX: true } }} open={open} onOpenChange={setOpen} overlayClassName="pw-channel-notifications" popupRender={menu => <div className="pw-notification-popup"><div className="pw-notification-menu-title">Уведомления канала</div>{menu}</div>} menu={{
    selectable: true, selectedKeys: [enabled ? 'all' : 'none'],
    items: options.map(option => ({ key: option.key, icon: option.icon, label: <span className="pw-notification-option"><span><strong>{option.title}</strong><small>{option.hint}</small></span>{(enabled ? 'all' : 'none') === option.key && <Checkmark20Regular aria-hidden="true" />}</span> })),
    onClick: ({ key }) => { onChange(key); setOpen(false); },
  }}><Tooltip title={open ? null : enabled ? 'Уведомлять о новых статьях' : 'Настроить уведомления'}><Button className={`pw-channel-bell ${enabled ? 'is-on' : ''}`} shape="circle" aria-label={`Уведомления канала: ${enabled ? 'все новые статьи' : 'выключены'}`} aria-haspopup="menu" aria-expanded={open} icon={enabled ? <AlertOn20Filled /> : <Alert20Filled />} /></Tooltip></Dropdown>;
}
