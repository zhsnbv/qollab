import { useEffect, useRef, useState } from 'react';
import { ChevronRight16Filled, AppsList24Filled, PeopleTeam24Filled } from '@fluentui/react-icons';
import { peekPreview, resolvePreview } from '../utils/linkPreviewApi';
import { linkKey } from '../utils/internalLink';
import './LinkPreview.css';

const LABEL = {
  mini_app: 'Mini-app Qollab',
  group_invite: 'Приглашение в группу',
};
const FALLBACK_ICON = {
  mini_app: AppsList24Filled,
  group_invite: PeopleTeam24Filled,
};

// Загрузка метаданных карточки. Попадание в каталог отдаётся синхронно —
// скелетон в этом случае не мигает. Ответ, пришедший после размонтирования
// или после смены ссылки в сообщении, игнорируется.
function usePreview(link) {
  const key = linkKey(link);
  const [state, setState] = useState(() => peekPreview(link) || { status: 'loading' });
  const keyRef = useRef(key);

  useEffect(() => {
    keyRef.current = key;
    const hit = peekPreview(link);
    if (hit) { setState(hit); return undefined; }

    let alive = true;
    setState({ status: 'loading' });
    resolvePreview(link).then((result) => {
      if (alive && keyRef.current === key) setState(result);
    });
    return () => { alive = false; };
    // link пересоздаётся при каждом разборе, поэтому следим за ключом
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return state;
}

// Карточка внутренней ссылки под текстом сообщения (раздел 5 плана).
// Ошибка и недоступность не оставляют вечную «Загрузку»: карточка исчезает,
// а обычная ссылка в тексте остаётся рабочим fallback.
export default function LinkPreview({ link, onOpen }) {
  const state = usePreview(link);
  if (state.status === 'unavailable') return null;

  const label = LABEL[link.type];

  if (state.status === 'loading') {
    return (
      <div className="lp lp--skeleton" aria-busy="true" aria-label={`${label}, загрузка`}>
        <div className="lp-row">
          <span className="lp-ico lp-sk" />
          <span className="lp-body">
            <span className="lp-sk lp-sk--kind" />
            <span className="lp-sk lp-sk--title" />
            <span className="lp-sk lp-sk--sub" />
            {/* У приглашения две строки описания канала — ровно столько же
                занимает готовая карточка, поэтому бабл не прыгает */}
            {link.type === 'group_invite' && (
              <>
                <span className="lp-sk lp-sk--note" />
                <span className="lp-sk lp-sk--note" />
              </>
            )}
          </span>
        </div>
        <span className="lp-sk lp-sk--cta" />
      </div>
    );
  }

  const Fallback = FALLBACK_ICON[link.type];
  const a11y = [label, state.title, state.subtitle, state.action].filter(Boolean).join('. ');

  // Недействительное приглашение: ни названия группы, ни аватарки, ни действия
  if (state.invalid) {
    return (
      <div className="lp lp--invalid" aria-label={a11y}>
        <div className="lp-row">
          <span className="lp-ico"><Fallback /></span>
          <span className="lp-body">
            <span className="lp-kind">{label}</span>
            <span className="lp-title">{state.title}</span>
            <span className="lp-sub">Спросите новую ссылку у того, кто её прислал</span>
          </span>
        </div>
      </div>
    );
  }

  return (
    <button className="lp" onClick={() => onOpen && onOpen(link, state)} aria-label={a11y}>
      <span className="lp-row">
        <span className="lp-ico">
          {state.logo ? <img src={state.logo} alt="" loading="lazy" /> : <Fallback />}
        </span>
        <span className="lp-body">
          <span className="lp-kind">{label}</span>
          <span className="lp-title">{state.title}</span>
          {state.subtitle && <span className="lp-sub">{state.subtitle}</span>}
          {state.note && <span className="lp-note">{state.note}</span>}
        </span>
      </span>
      <span className="lp-cta">{state.action}<ChevronRight16Filled /></span>
    </button>
  );
}
