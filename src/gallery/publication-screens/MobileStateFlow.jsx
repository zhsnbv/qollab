import { useEffect, useRef, useState } from 'react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { DeviceHost } from '../../components/Portal';
import { PublicationsProvider } from '../../components/publications/PublicationContext';
import { usePublications } from '../../components/publications/usePublications';
import PublicationOverlays from '../../components/publications/PublicationOverlays';
import { ChannelsProvider } from '../../context/ChannelsContext';
import Posts from '../../screens/Posts';
import ArticleView from '../../screens/ArticleView';
import ChannelView from '../../screens/ChannelView';
import ChannelSettings from '../../screens/ChannelSettings';
import BottomNav from '../../components/BottomNav';

function MobileFlow({ scenario }) {
  const { setSheet, resolve, sheet } = usePublications();
  const location = useLocation();
  const started = useRef(false), resolver = useRef(resolve);
  resolver.current = resolve;
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    // Run after the ordinary route effect has closed old sheets.
    const timer = setTimeout(() => {
      if (scenario.sheet || scenario.menu) setSheet({ type: scenario.menu ? 'menu' : scenario.sheet, post: resolver.current(scenario.post) });
    }, 50);
    return () => { clearTimeout(timer); started.current = false; };
  }, [scenario, setSheet]);
  return <><div className="publication-app-stack" inert={!!sheet}>
    <Routes><Route path="/posts" element={<><Posts /><BottomNav /></>} /><Route path="/article" element={<ArticleView />} /><Route path="/channel/:channelId" element={<ChannelView />} /><Route path="/channels/settings" element={<ChannelSettings />} /></Routes>
  </div><PublicationOverlays /><span hidden data-frame-route={location.pathname} /></>;
}
export default function MobileStateFlow({ scenario }) {
  const [host, setHost] = useState(null);
  const route = scenario.page === 'reader' ? `/article?post=${scenario.post}` : scenario.page === 'channel' ? `/channel/${scenario.channel || 'erg-news'}` : scenario.page === 'settings' ? '/channels/settings' : '/posts';
  return <div className="device publication-state-device" ref={setHost}>{host && <DeviceHost.Provider value={host}><ChannelsProvider><PublicationsProvider><MemoryRouter initialEntries={[route]}><MobileFlow scenario={scenario} /></MemoryRouter></PublicationsProvider></ChannelsProvider></DeviceHost.Provider>}</div>;
}
