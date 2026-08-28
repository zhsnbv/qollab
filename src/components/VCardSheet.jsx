import { useEffect } from 'react';
import Portal from './Portal';
import SheetTop from './SheetTop';
import QrCode from './QrCode';
import useSheetSwipe from '../utils/useSheetSwipe';
import { pushScrim, popScrim } from '../utils/scrim';
import { me } from '../data/profile';
import './VCardSheet.css';

// Визитка: в коде лежит настоящий vCard, поэтому камера телефона предлагает
// сохранить контакт сразу, без установки qollab у собеседника.
const vcard = [
  'BEGIN:VCARD', 'VERSION:3.0',
  `FN:${me.name}`,
  `TITLE:${me.role}`,
  'ORG:ERG',
  `TEL;TYPE=CELL:${me.phone.replace(/\s/g, '')}`,
  `EMAIL:${me.email}`,
  'END:VCARD',
].join('\n');

export default function VCardSheet({ onClose }) {
  const swipe = useSheetSwipe(onClose);
  useEffect(() => { pushScrim(); return popScrim; }, []);

  return (
    <Portal>
      <div className="vcs-wrap">
        <button className="vcs-scrim" onClick={onClose} aria-label="Закрыть" />
        <div className={`vcs ${swipe.className}`} style={swipe.style} role="dialog" aria-label="QR-визитка">
          <SheetTop onClose={onClose} swipe={swipe}>
            <h3 className="vcs-title">QR-визитка</h3>
          </SheetTop>
          <div className="vcs-body">
            <p className="vcs-text">
              Покажите визитку, чтобы собеседник быстро сохранил ваши контакты —
              приложение ему для этого не нужно.
            </p>
            <div className="vcs-card"><QrCode value={vcard} size={200} /></div>
            <div className="vcs-name">{me.name}</div>
            <div className="vcs-role">{me.role}</div>
          </div>
        </div>
      </div>
    </Portal>
  );
}
