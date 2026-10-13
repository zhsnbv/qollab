import { useEffect, useRef, useState } from 'react';
import { frameUrl } from './cases';

export default function PublicationScreenCell({ item, theme, company, lang }) {
  const root = useRef(null), [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin: '500px' });
    observer.observe(root.current);
    return () => observer.disconnect();
  }, []);
  const url = `${frameUrl('mobile', item.scenarioId)}&theme=${theme}&company=${company}&lang=${lang}`;
  return <figure className="gal-cell gal-publication-cell" ref={root} data-case={item.id}>
    <div className="gal-frame gal-publication-frame">{visible && <iframe src={url} width="402" height="870" title={item.title} />}</div>
    <figcaption className="gal-caption"><a className="gal-title" href={url} target="_blank" rel="noreferrer">{item.title} ↗</a><span className="gal-note">{item.note} · 402×870</span></figcaption>
  </figure>;
}
