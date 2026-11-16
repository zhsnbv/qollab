import '../screens/ChatAppearance.css';

// Decorative layers are shared by real chats, preview bubbles and theme tiles.
export default function ChatWallpaper({ appearance, miniature = false }) {
  const live = appearance.wallpaper.endsWith('-live');
  return <div className={`qa-wallpaper-layers${miniature ? ' qa-wallpaper-layers--mini' : ''}`} aria-hidden="true">
    {live && <div className="qa-live-scene"><i /><i /><i /></div>}
    {appearance.pattern && <div className="qa-pattern-layer" />}
  </div>;
}
