import './ErgMission.css';
import valuesMarkup from './ErgValues.html?raw';

export default function ErgMission() {
  return <div className="erg-mission">
    <div className="erg-values-slot" dangerouslySetInnerHTML={{ __html: valuesMarkup }} />
    <p className="erg-mission-copy">Быть лучшими в том, что мы делаем. Развиваться вместе с миром, оставаясь верными своим ценностям. Бережно раскрывая потенциал Земли и человечества, обеспечивать процветание тех, кто на нас полагается.</p>
  </div>;
}
