import { useEffect, useRef, useState } from 'react';
import { getChatPreset } from '../utils/chatThemeCatalog';
import { watchChatWallpaperPlayback } from '../utils/chatWallpaperPlayback';
import '../screens/ChatAppearance.css';

function WallpaperVideo({ src, poster }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (failed || !ref.current) return;
    return watchChatWallpaperPlayback(ref.current, { onVisible: setVisible, onFailure: () => setFailed(true) });
  }, [src, failed]);
  if (failed) return null;
  return <video ref={ref} className="qa-wallpaper-video" src={src} poster={poster}
    muted loop playsInline preload="none" style={{ opacity: visible ? 1 : 0 }} />;
}

// Actual chats, previews and tiles always render the canonical preset asset.
// Tiles never create video elements; the poster remains behind every live video.
export default function ChatWallpaper({ appearance, miniature = false }) {
  const theme = getChatPreset(appearance.preset || appearance.id);
  return <div className={`qa-wallpaper-layers${miniature ? ' qa-wallpaper-layers--mini' : ''}`} aria-hidden="true">
    {theme.poster && <img className="qa-wallpaper-photo" src={theme.poster} alt="" loading={miniature ? 'lazy' : 'eager'} decoding="async" />}
    {theme.video && !miniature && <WallpaperVideo key={`${theme.id}:${theme.video}`} src={theme.video} poster={theme.poster} />}
    {theme.pattern && <div className="qa-pattern-layer" />}
    {theme.group === 'gradient' && <div className="qa-wallpaper-grain" />}
  </div>;
}
