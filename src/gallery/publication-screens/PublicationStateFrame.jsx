import { lazy, Suspense, useEffect, useMemo } from 'react';
import { WEB_CASES, MOBILE_CASES } from './cases';
import { PublicationScenarioContext } from './ScenarioContext';
import { INITIAL_POSTS, emptyPost, PHOTO_STATUSES } from '../publications-web/data';
import { initialComments } from '../publications-web/publicationContent';
import { legacyDeltaToBlocks } from '../publications-web/blockDocument';
const PublicationsWeb = lazy(() => import('../publications-web/PublicationsWeb'));
const MobileStateFlow = lazy(() => import('./MobileStateFlow'));
import './PublicationStateFrame.css';

function makeScenario(spec, platform) {
  const all = structuredClone(INITIAL_POSTS);
  const selected = all.find(p => spec.video ? p.videos?.length : p.id === (spec.post || 'news')) || all[0];
  const postId = spec.post === 'missing' ? 'missing' : selected.id;
  if (spec.negative && selected.images?.[1]) Object.assign(selected.images[1], { status: PHOTO_STATUSES[0], caption: 'Зона хранения требует дополнительной разметки. Обновить обозначения проходов и мест складирования.' });
  if (spec.comments === 'disabled') selected.comments = false;
  if (spec.liked) selected.liked = true;
  let posts = spec.only ? [selected] : [selected, ...all.filter(p => p.id !== selected.id)];
  if (spec.empty) posts = [];
  const thread = structuredClone(initialComments);
  if (['collapsed', 'expanded'].includes(spec.comments)) {
    thread[0].replies.push(...Array.from({ length: 4 }, (_, i) => ({ id: `thread-${i}`, name: 'Иван Иванов', avatar: initialComments[1].avatar, date: '6 окт', text: ['Спасибо за пример!', 'Поделились с коллегами.', 'Возьмём этот подход в работу.', 'Будем ждать следующий материал.'][i], likes: i, replies: [] })));
  }
  const discussion = spec.comments === 'empty' ? [] : thread;
  const source = all.find(p => p.type === (spec.type || 'news')) || selected;
  const editor = spec.blank ? emptyPost(spec.type || 'news') : { ...structuredClone(source), assistantId: `gallery-${spec.id}` };
  const result = { patch: { title: source.title, lead: source.lead, description: { format: 'blocknote', blocks: legacyDeltaToBlocks(source.description) } }, warnings: [] };
  const assistantMessage = { id: 'variant-1', role: 'assistant', text: 'Собрал статью и отредактировал текст. Проверьте факты и примените вариант к форме.', result, time: Date.UTC(2026, 9, 13, 5, 30), images: [] };
  const assistantChat = { input: spec.assistant === 'materials' ? 'Собери статью из материалов: короткий заголовок, лид и основной текст.' : '', files: spec.assistant === 'materials' ? [{ id: 'brief', name: 'Материалы статьи.txt', kind: 'text', text: 'На предприятии обновили оборудование. Работы завершили без дополнительного простоя.' }] : [], messages: ['result', 'history', 'applied'].includes(spec.assistant) ? [assistantMessage] : [] };
  return { ...spec, platform, post: postId, page: spec.page || 'feed', posts, editor, assistantChat,
    discussions: { [postId]: discussion }, saved: { likes: { [postId]: !!spec.liked }, bookmarks: { [postId]: !!spec.liked }, threads: { [postId]: discussion }, drafts: { [postId]: spec.comments === 'draft' ? 'Спасибо за подробный материал!\nПоделюсь с командой.' : '' } },
  };
}
// Scenario preparation uses only existing UI controls. No data is written to the user's storage.
function PrepareState({ scenario }) {
  useEffect(() => {
    let stopped = false, timer, index = 0;
    const steps = [...(scenario.steps || [])];
    if (scenario.platform === 'web') {
      if (scenario.menu) steps.push({ click: '.pw-more-button' });
      if (scenario.sheet === 'stats') steps.push({ click: '.pw-views' });
      if (scenario.comments === 'reply') steps.push({ click: '.pw-comment-reply' });
      if (scenario.sheet === 'share') steps.push({ click: '[aria-label="Поделиться публикацией"]' });
      if (scenario.assistant === 'applied') steps.push({ click: '.pw-assistant-result .pw-assistant-primary' });
      if (scenario.comments) steps.push({ scroll: '.pw-comments' });
    }
    if (scenario.scroll) steps.push({ scroll: scenario.scroll });
    const start = performance.now();
    function run() {
      if (stopped) return;
      const ready = scenario.platform === 'web' ? document.querySelector('.pw-embedded, .pw-editor') : document.querySelector('.post-list, .ar-body, .cv-scroll, .favscreen, .pm-empty, .post-empty, .channel-list, .event-list, .sk');
      if (!ready && performance.now() - start < 10000) { timer = setTimeout(run, 100); return; }
      const step = steps[index];
      if (step) {
        const node = document.querySelector(step.click || step.scroll);
        if (!node) {
          if (performance.now() - start < 12000) { timer = setTimeout(run, 150); return; }
          document.documentElement.dataset.scenarioError = `Missing: ${step.click || step.scroll}`;
        } else if (step.click) node.click();
        else node.scrollIntoView({ block: 'start', behavior: 'instant' });
        index++; timer = setTimeout(run, 220); return;
      }
      if (scenario.scrollY) {
        const area = scenario.platform === 'web' ? window : document.querySelector('.ar-body, .scroll-area');
        area?.scrollTo({ top: scenario.scrollY, behavior: 'instant' });
      }
      const expect = (selector, message) => { if (!document.querySelector(selector)) document.documentElement.dataset.scenarioError = message; };
      if (scenario.lightbox) expect('.pw-lightbox[open]', 'Lightbox not open');
      if (scenario.expanded) expect('.pw-read-more[aria-expanded="true"]', 'Card not expanded');
      if (scenario.platform === 'mobile' && (scenario.sheet || scenario.menu)) expect('[role="dialog"], .asheet', 'Sheet not open');
      if (scenario.assistant) expect('.pw-assistant-panel', 'Assistant not open');
      if (scenario.assistant === 'applied') expect('.pw-assistant-undo', 'Assistant result not applied');
      if (scenario.comments === 'collapsed') expect('[aria-expanded="false"].pw-collapse-replies, [aria-expanded="false"].pm-replies-toggle', 'Thread not collapsed');
      if (scenario.comments === 'reply') expect('.pw-replying, .pm-replying', 'Reply composer missing');
      if (scenario.comments === 'draft') expect('textarea', 'Comment composer missing');
      if (scenario.photoModal || scenario.videoModal || (scenario.platform === 'web' && ['stats', 'share'].includes(scenario.sheet))) expect('.qpub-modal-content, .ant-modal-content', 'Modal not open');
      document.documentElement.dataset.scenarioReady = scenario.id;
      window.parent.postMessage({ type: 'publication-frame-ready', id: scenario.id, error: document.documentElement.dataset.scenarioError || null }, window.location.origin);
    }
    timer = setTimeout(run, 850);
    return () => { stopped = true; clearTimeout(timer); };
  }, [scenario]);
  return null;
}
export default function PublicationStateFrame() {
  const params = new URLSearchParams(window.location.search);
  const platform = params.get('platform') === 'web' ? 'web' : 'mobile';
  const spec = (platform === 'web' ? WEB_CASES : MOBILE_CASES).find(item => item.id === params.get('case'));
  const scenario = useMemo(() => spec && makeScenario(spec, platform), [spec, platform]);
  useEffect(() => {
    document.documentElement.classList.add('publication-state-frame', `publication-state-${platform}`);
    document.documentElement.dataset.theme = params.get('theme') === 'dark' ? 'dark' : 'light';
    document.documentElement.dataset.company = ['erg', 'integra', 'bts'].includes(params.get('company')) ? params.get('company') : 'erg';
    document.title = spec?.title || 'Состояние не найдено';
    return () => document.documentElement.classList.remove('publication-state-frame', `publication-state-${platform}`);
  // Each iframe URL is a complete, immutable scenario.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [platform, spec]);
  if (!scenario) return <p>Состояние не найдено. <a href="/all?group=publications">Открыть все состояния</a></p>;
  return <PublicationScenarioContext.Provider value={scenario}>
    <Suspense fallback={null}>{platform === 'web' ? <PublicationsWeb /> : <MobileStateFlow scenario={scenario} />}</Suspense>
    <PrepareState scenario={scenario} />
  </PublicationScenarioContext.Provider>;
}
