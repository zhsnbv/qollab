import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// Keep the outgoing screen mounted until its exit finishes. Guard rapid taps
// so one gesture cannot pop several screens or leave a pending navigation.
export function useNotificationBack(fallback) {
  const navigate = useNavigate();
  const location = useLocation();
  const [closing, setClosing] = useState(false);
  const pending = useRef(null);
  useEffect(() => () => clearTimeout(pending.current), []);
  const close = () => {
    if (pending.current !== null) return;
    setClosing(true);
    const delay = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 260;
    pending.current = setTimeout(() => {
      if (location.state?.background) navigate(-1);
      else navigate(fallback, { replace: true });
    }, delay);
  };
  return [closing, close];
}
