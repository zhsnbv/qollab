import ActionSheet from './ActionSheet';
import { languages } from '../data/settings';
import { getLang, setLang } from '../i18n/runtime';

export default function LanguageSheet({ onClose }) {
  return <ActionSheet title="Язык приложения" items={languages.map(lang => ({ id: lang.id, label: lang.label, sub: lang.id === 'kk' ? 'Kazakh' : 'Russian' }))} selected={getLang()} onClose={onClose} onPick={id => { onClose(); setLang(id); }} />;
}
