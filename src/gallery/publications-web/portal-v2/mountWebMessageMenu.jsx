import { createRoot } from 'react-dom/client';
import WebMessageMenu from './WebMessageMenu';

export function mountWebMessageMenu(element) {
  const root = createRoot(element);
  let revision = 0;
  return {
    open(props) { root.render(<WebMessageMenu key={++revision} {...props} />); },
    close() { root.render(null); },
    // Portal cleanup runs inside its parent React layout effect. Unmount after that commit.
    destroy() { queueMicrotask(() => root.unmount()); },
  };
}
