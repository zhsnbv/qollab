import { useState } from 'react';
import ErgValueDetails from './ErgValueDetails';
import './ErgMission.css';
import valuesMarkup from './ErgValues.html?raw';

export default function ErgMission() {
  const [selected, setSelected] = useState(null);
  return <><div className="erg-mission">
    <div className="erg-values-slot" onClick={e => { const button = e.target.closest("[data-erg-value]"); if (button) setSelected({ id: button.dataset.ergValue, trigger: button }); }} dangerouslySetInnerHTML={{ __html: valuesMarkup }} />
    <p className="erg-mission-copy">Быть лучшими в том, что мы делаем. Развиваться вместе с миром, оставаясь верными своим ценностям. Бережно раскрывая потенциал Земли и человечества, обеспечивать процветание тех, кто на нас полагается.</p>
  </div>{selected && <ErgValueDetails valueId={selected.id} trigger={selected.trigger} onClose={() => setSelected(null)} />}</>;
}
