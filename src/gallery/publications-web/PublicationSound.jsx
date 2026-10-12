import { useCallback, useRef } from 'react';
import { LikeSoundContext } from './likeSoundContext';

export default function PublicationSound({ children }) {
  const player = useRef(null);
  const play = useCallback(() => {
    const audio = player.current;
    if (!audio) return;
    // One quiet, reusable player: rapid likes restart the chime instead of stacking.
    try {
      audio.volume = .45;
      audio.currentTime = 0;
      audio.play()?.catch(() => {});
    } catch { /* Audio restrictions must never prevent a reaction. */ }
  }, []);

  return <LikeSoundContext.Provider value={play}>
    {children}
    <audio ref={player} src="/audio/publication-like-chime.wav" preload="auto" hidden aria-hidden="true" data-testid="publication-like-sound" />
  </LikeSoundContext.Provider>;
}
