import { useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ConfigProvider, theme } from 'antd';
import markup from './portal-v2/shell.html?raw';
import { initializePortal } from './portal-v2/portalRuntime';
import './portal-v2/portal.css';
import './PortalShell.css';
import '../../components/ErgMission.css';

export default function PortalShell({ page, query, onSearch, onNavigate, channelsContent, children }) {
  const root = useRef(null), runtime = useRef(null), callbacks = useRef({ onSearch, onNavigate });
  const [slots, setSlots] = useState(null), [dark, setDark] = useState(false);
  useLayoutEffect(() => { callbacks.current = { onSearch, onNavigate }; });
  useLayoutEffect(() => {
    const element = root.current;
    element.innerHTML = markup;
    runtime.current = initializePortal(element, {
      onPage: next => callbacks.current.onNavigate(next),
      onSearch: value => callbacks.current.onSearch(value),
    });
    const syncTheme = () => setDark(element.dataset.theme === 'dark');
    const observer = new MutationObserver(syncTheme);
    observer.observe(element, { attributes: true, attributeFilter: ['data-theme'] });
    syncTheme();
    const stories = element.querySelector('.stories');
    stories.replaceChildren();
    setSlots({ feed: element.querySelector('#postList'), reader: element.querySelector('#publicationPage'), stories });
    return () => { observer.disconnect(); runtime.current.destroy(); runtime.current = null; };
  }, []);
  useLayoutEffect(() => { if (page !== 'editor') runtime.current?.selectPage(page); }, [page]);
  useLayoutEffect(() => { runtime.current?.setSearch(query); }, [query]);
  return <>
    <div ref={root} className="pw-source-shell concept-v2" hidden={page === 'editor'} />
    {slots && page !== 'editor' && createPortal(<ConfigProvider theme={{ algorithm: dark ? theme.darkAlgorithm : theme.defaultAlgorithm }}><div className={`pw-app pw-embedded pw-feed-channels-surface ${dark ? 'pw-dark' : ''}`}>{channelsContent}</div></ConfigProvider>, slots.stories)}
    {slots && page !== 'editor' && createPortal(<ConfigProvider theme={{ algorithm: dark ? theme.darkAlgorithm : theme.defaultAlgorithm }}><div className={`pw-app pw-embedded ${dark ? 'pw-dark' : ''}`}>{children}</div></ConfigProvider>, page === 'reader' ? slots.reader : slots.feed)}
  </>;
}
