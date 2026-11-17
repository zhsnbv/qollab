import { useEffect, useRef, useState } from 'react';
import { getChatPreset } from '../utils/chatThemeCatalog';
import '../screens/ChatAppearance.css';

// Actual chats, previews and tiles always render the canonical preset asset.
export default function ChatWallpaper({ appearance, miniature = false }) {
  const theme = getChatPreset(appearance.preset || appearance.id);
  const videoRef = useRef(null);
  const [failedThemeId, setFailedThemeId] = useState(null);
  useEffect(() => {
    const video = videoRef.current;
    if (!video || miniature) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncPlayback = () => {
      if (document.hidden || reducedMotion.matches) video.pause();
      else video.play().catch(() => {});
    };
    syncPlayback();
    reducedMotion.addEventListener('change', syncPlayback);
    document.addEventListener('visibilitychange', syncPlayback);
    return () => { reducedMotion.removeEventListener('change', syncPlayback); document.removeEventListener('visibilitychange', syncPlayback); };
  }, [theme.id, miniature]);
  return <div className={`qa-wallpaper-layers${miniature ? ' qa-wallpaper-layers--mini' : ''}`} aria-hidden="true">
    {theme.poster && <img className="qa-wallpaper-photo" src={theme.poster} alt="" loading={miniature ? 'lazy' : 'eager'} decoding="async" />}
    {theme.video && !miniature && failedThemeId !== theme.id && <video key={theme.id} ref={videoRef} className="qa-wallpaper-video" src={theme.video} poster={theme.poster} muted loop playsInline preload="metadata" onError={() => setFailedThemeId(theme.id)} />}
    {theme.pattern && <div className="qa-pattern-layer" />}
    {theme.group === 'gradient' && <div className="qa-wallpaper-grain" />}
  </div>;
}
