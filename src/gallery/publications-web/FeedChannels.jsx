import { useLayoutEffect, useRef, useState } from 'react';
import { Button, Input, Modal } from 'antd';
import { ChevronLeft20Regular, ChevronRight20Regular, Settings20Filled, LockClosed20Filled, Search20Regular } from '@fluentui/react-icons';
import './FeedChannels.css';

function ChannelSubscriptions({ channels, onToggle, onClose }) {
  // Keep rows in place while toggling subscriptions, as in the mobile feed.
  const [initialIds] = useState(() => new Set(channels.filter(channel => channel.subscribed).map(channel => channel.id)));
  const [query, setQuery] = useState('');
  return <Modal open title="Настройка каналов" onCancel={onClose} width={540} footer={<Button shape="round" type="primary" onClick={onClose}>Готово</Button>} className="pw-feed-channel-settings">
    <p className="pw-subscription-intro">Выберите каналы, публикации которых хотите видеть в ленте.</p>
    <Input prefix={<Search20Regular />} placeholder="Найти канал" aria-label="Поиск каналов в настройках" value={query} onChange={event => setQuery(event.target.value)} allowClear />
    <div className="pw-subscription-sections">{[[true, 'Вы подписаны'], [false, 'Доступные каналы']].map(([subscribed, label]) => {
      const rows = channels.filter(channel => initialIds.has(channel.id) === subscribed && channel.name.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())).sort((a, b) => Number(!!b.required) - Number(!!a.required));
      return <section key={label}><h3>{label}</h3>{rows.map(channel => <div className={`pw-subscription-row ${initialIds.has(channel.id) !== !!channel.subscribed ? 'is-changed' : ''}`} key={channel.id}>
        <img src={channel.avatar} alt="" /><div><strong>{channel.name}</strong>{channel.subscribers && <span>{channel.subscribers}</span>}</div>
        {channel.required ? <span className="pw-subscription-required"><LockClosed20Filled />Обязательный</span> : <Button type={channel.subscribed ? 'default' : 'primary'} shape="round" aria-label={`${channel.subscribed ? 'Отписаться от' : 'Подписаться на'} ${channel.name}`} onClick={() => onToggle(channel)}>{channel.subscribed ? 'Вы подписаны' : 'Подписаться'}</Button>}
      </div>)}{!rows.length && <p className="pw-subscription-empty">{query ? 'Ничего не найдено' : subscribed ? 'Здесь появятся ваши подписки' : 'Вы подписаны на все доступные каналы'}</p>}</section>;
    })}</div>
  </Modal>;
}

export default function FeedChannels({ channels, selectedId, onSelect, onToggle }) {
  const track = useRef(null);
  const [settings, setSettings] = useState(false), [edges, setEdges] = useState({ start: true, end: false });
  const followed = channels.filter(channel => channel.subscribed);
  const collage = channels.filter((channel, index, all) => all.findIndex(item => item.avatar === channel.avatar) === index).slice(0, 4);
  useLayoutEffect(() => {
    const rail = track.current;
    const measure = () => setEdges({ start: rail.scrollLeft <= 2, end: rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 2 });
    const resize = new ResizeObserver(measure);
    resize.observe(rail); rail.addEventListener('scroll', measure, { passive: true }); measure();
    return () => { resize.disconnect(); rail.removeEventListener('scroll', measure); };
  }, [followed.length]);
  const scroll = direction => track.current.scrollBy({ left: direction * track.current.clientWidth * .8, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  return <>
    <div className="pw-feed-channels">
      <button className="pw-channel-scroll" type="button" aria-label="Предыдущие каналы" disabled={edges.start} onClick={() => scroll(-1)}><ChevronLeft20Regular /></button>
      <div ref={track} className="pw-feed-channels-track" role="group" aria-label="Фильтр по каналам">
        <button type="button" className="pw-channel-filter pw-channel-filter-all" aria-pressed={!selectedId} onClick={() => onSelect(null)}>
          <span className="pw-channel-filter-ring"><span className="pw-channel-collage" aria-hidden="true">{collage.map((channel, i) => <img key={channel.id} src={channel.avatar} className={`pw-channel-bubble bubble-${i}`} alt="" />)}</span></span><span className="pw-channel-filter-name">Все каналы</span>
        </button>
        {followed.map(channel => <button key={channel.id} type="button" className="pw-channel-filter" title={channel.name} aria-pressed={selectedId === channel.id} onClick={() => onSelect(channel.id)}>
          <span className="pw-channel-filter-ring"><img className={`pw-channel-filter-avatar ${channel.fit === 'contain' ? 'is-contain' : ''}`} src={channel.avatar} alt="" /></span><span className="pw-channel-filter-name">{channel.id === 'erg-cu' ? 'ERG CU' : channel.name}</span>
        </button>)}
        <button type="button" className="pw-channel-filter pw-channel-filter-settings" aria-label="Настройка каналов" onClick={() => setSettings(true)}><span className="pw-channel-filter-ring"><span className="pw-channel-settings-tile"><Settings20Filled /></span></span><span className="pw-channel-filter-name">Настройка</span></button>
      </div>
      <button className="pw-channel-scroll" type="button" aria-label="Следующие каналы" disabled={edges.end} onClick={() => scroll(1)}><ChevronRight20Regular /></button>
    </div>
    {settings && <ChannelSubscriptions channels={channels} onToggle={onToggle} onClose={() => setSettings(false)} />}
  </>;
}
