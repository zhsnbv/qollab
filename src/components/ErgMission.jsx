import { useState } from 'react';
import ErgValueDetails from './ErgValueDetails';
import './ErgMission.css';
import valuesMarkup from './ErgValues.html?raw';

export default function ErgMission() {
  const [selected, setSelected] = useState(null);
  return <><div className="erg-mission">
    <div className="erg-values-slot" onClick={e => { const button = e.target.closest("[data-erg-value]"); if (button) setSelected({ id: button.dataset.ergValue, trigger: button }); }} dangerouslySetInnerHTML={{ __html: valuesMarkup }} />
  </div>{selected && <ErgValueDetails valueId={selected.id} trigger={selected.trigger} onClose={() => setSelected(null)} />}</>;
}
