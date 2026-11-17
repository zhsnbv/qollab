import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ArrowUpRight, ArrowRight, Check, Copy, DownloadSimple, Play, X, GithubLogo, BookOpen, Code, Cube, Lightning, MagnifyingGlass } from '@phosphor-icons/react';
import ChatWallpaper from '../../components/ChatWallpaper';
import Message from '../../components/Message';
import { CHAT_PRESETS, appearanceClass, appearanceStyle } from '../../utils/chatThemeCatalog';
import { ACCEPTANCE, DOCS, GROUPS, REPOSITORY, RULES, SECTIONS, SOURCE_MAP, sourceUrl, storyUrl } from './handoffContent';
import mediaMetadata from './mediaMetadata.json';
import '../../screens/ChatRoom.css';
import './DeveloperHandoff.css';

const THEME_COUNT = CHAT_PRESETS.length;
const LIVE_COUNT = CHAT_PRESETS.filter(theme => theme.video).length;
const STILL_COUNT = CHAT_PRESETS.filter(theme => theme.group === 'photo').length;
const IN_MESSAGE = { id: 'handoff-in', text: 'Посмотри, как выглядит новая тема', time: '14:32' };
const OUT_MESSAGE = { id: 'handoff-out', text: 'Да, всё на своих местах ✨', time: '14:33', status: 'read' };
const groupName = id => GROUPS.find(([key]) => key === id)?.[1] || id;
const sizeLabel = bytes => `${(bytes / 1024 / 1024).toLocaleString('ru-RU', { maximumFractionDigits: 2 })} МБ`;
const toHex = value => {
  const rgb = value.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  return rgb ? `#${rgb.slice(1, 4).map(part => Number(part).toString(16).padStart(2, '0')).join('').toUpperCase()}` : value;
};

function ExternalLink({ href, children, className = '', ...props }) {
  return <a className={className} href={href} target="_blank" rel="noreferrer" {...props}>{children}<ArrowUpRight size={16} aria-hidden="true" /></a>;
}
function CodeBlock({ children, label = 'Код' }) {
  const [state, setState] = useState('');
  useEffect(() => { if (!state) return; const timer = setTimeout(() => setState(''), 2400); return () => clearTimeout(timer); }, [state]);
  const copy = async () => {
    try { await navigator.clipboard.writeText(children); setState('Скопировано'); }
    catch { setState('Выделите и скопируйте текст'); }
  };
  return <div className="dh-code"><div className="dh-code-top"><span>{label}</span><button onClick={copy} aria-label={`Скопировать: ${label}`}><Copy size={14} />Копировать</button></div><pre><code>{children}</code></pre><span className="dh-sr-only" role="status">{state}</span>{state && <span className="dh-code-feedback" aria-hidden="true">{state}</span>}</div>;
}
function SectionHeading({ number, eyebrow, title, children }) {
  return <header className="dh-section-heading"><span className="dh-number">{number}</span><div><span className="dh-eyebrow">{eyebrow}</span><h2>{title}</h2>{children && <p>{children}</p>}</div></header>;
}
function AssetLink({ path, children }) {
  return <a className="dh-asset-link" href={path} download><DownloadSimple size={15} aria-hidden="true" />{children}<span>{path.split('/').pop()}</span></a>;
}
function ThemeThumb({ theme, className = '' }) {
  return <span className={`dh-theme-thumb ${appearanceClass(theme)} ${className}`} style={appearanceStyle(theme)}><ChatWallpaper appearance={theme} miniature /><span className="dh-tile-bubbles" aria-hidden="true"><i className="sc-mini-in" /><i className="sc-mini-out" /></span></span>;
}

export default function DeveloperHandoff() {
  const [brand, setBrand] = useState('erg');
  const [mode, setMode] = useState('light');
  const [group, setGroup] = useState('all');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState('live-prism');
  const [playing, setPlaying] = useState(false);
  const [colors, setColors] = useState([]);
  const previewRef = useRef(null);
  const selected = CHAT_PRESETS.find(theme => theme.id === selectedId) || CHAT_PRESETS[0];
  const metadata = mediaMetadata[selected.id];
  const visibleThemes = useMemo(() => CHAT_PRESETS.filter(theme => (group === 'all' || theme.group === group) && `${theme.name} ${theme.id}`.toLowerCase().includes(query.trim().toLowerCase())), [group, query]);
  useEffect(() => { const before = document.title; document.title = 'qollab · Разработчикам'; return () => { document.title = before; }; }, []);
  // Preview controls are intentionally local: no preferences or sessionStorage writes.
  useLayoutEffect(() => {
    const root = document.documentElement;
    const before = { theme: root.getAttribute('data-theme'), company: root.getAttribute('data-company') };
    return () => { Object.entries(before).forEach(([key, value]) => { if (value === null) root.removeAttribute(`data-${key}`); else root.setAttribute(`data-${key}`, value); }); };
  }, []);
  useLayoutEffect(() => {
    document.documentElement.dataset.theme = mode;
    document.documentElement.dataset.company = brand;
    const stage = previewRef.current;
    if (!stage) return;
    const incoming = getComputedStyle(stage.querySelector('.msg--their .msg-bubble'));
    const outgoing = getComputedStyle(stage.querySelector('.msg--mine .msg-bubble'));
    const receipt = getComputedStyle(stage.querySelector('[data-delivery-state="read"]'));
    setColors([
      ['Входящий', incoming.backgroundColor], ['Исходящий', outgoing.backgroundColor],
      ['Текст входящего', incoming.color], ['Текст исходящего', outgoing.color], ['Прочитано', receipt.color],
    ].map(([name, value]) => [name, toHex(value)]));
  }, [brand, mode, selectedId]);
  const select = theme => { setSelectedId(theme.id); setPlaying(false); };
  const cssAsset = selected.group === 'pattern' ? `/img/chat-themes/${selected.id}.svg` : selected.group === 'gradient' ? `/img/chat-themes/grain-${selected.id.replace('grad-', '')}.svg` : null;
  return <div className="dh-hub" data-brand-preserve>
    <a className="dh-skip" href="#dh-main">К содержимому</a>
    <aside className="dh-rail"><a className="dh-logo" href="#overview">qollab<span>develop</span></a><span className="dh-rail-label">ПЕРЕДАЧА В РАЗРАБОТКУ</span><nav aria-label="Разделы документации">{SECTIONS.map(([id, label], i) => <a key={id} href={`#${id}`}><span>0{i + 1}</span>{label}</a>)}</nav><div className="dh-rail-bottom"><span className="dh-version"><i />React · Vite · Storybook</span><ExternalLink href={REPOSITORY}><GithubLogo size={17} />Исходный код</ExternalLink></div></aside>
    <main className="dh-main" id="dh-main">
      <section className="dh-hero" id="overview"><div className="dh-topline"><span>DESIGN → DEVELOPMENT</span><span>Настройки & темы чатов</span></div><div className="dh-hero-body"><div><span className="dh-eyebrow">ОДНА ССЫЛКА. ВЕСЬ КОНТЕКСТ.</span><h1>От дизайна<br />к рабочему продукту<span>.</span></h1><p>Интерактивный прототип, компоненты, темы и медиа. Всё, что нужно, чтобы перенести поведение в приложение и уверенно его развивать.</p><div className="dh-actions"><ExternalLink className="dh-button dh-button--primary" href="/handoff/settings?view=prototype">Открыть прототип</ExternalLink><ExternalLink className="dh-button" href={storyUrl('список')}>Storybook</ExternalLink></div></div><div className="dh-hero-art" aria-hidden="true">{['live-coast', 'grad-mint', 'art-coast'].map(id => <ThemeThumb key={id} theme={CHAT_PRESETS.find(theme => theme.id === id)} />)}<span className="dh-art-caption">Один каталог · единые компоненты</span></div></div><div className="dh-metrics"><div><strong>{THEME_COUNT}</strong><span>готовые темы</span></div><div><strong>{LIVE_COUNT}</strong><span>настоящие Live-фоны</span></div><div><strong>2 × 2</strong><span>пространства и режима</span></div><div><strong>1</strong><span>источник визуальных правил</span></div></div></section>

      <div className="dh-start-links"><ExternalLink href="/handoff/chat-theme-states"><Cube size={22} /><span><strong>Состояния сообщений</strong><small>Статусы, вложения, long press</small></span></ExternalLink><ExternalLink href="/handoff/chat-interactions?chat=personal"><Lightning size={22} /><span><strong>Настоящие действия</strong><small>Ответ, реакция, пересылка</small></span></ExternalLink><ExternalLink href="/handoff/settings?view=prototype&screen=storage"><Play size={22} /><span><strong>Процесс очистки</strong><small>Интерактивный сценарий</small></span></ExternalLink></div>

      <section className="dh-section" id="catalog"><SectionHeading number="01" eyebrow="ТЕМЫ И МЕДИА" title="Выберите тему. Посмотрите всё.">Каталог подключён напрямую к приложению. Палитра, фон и имена файлов всегда берутся из одного пресета.</SectionHeading>
        <div className="dh-catalog-toolbar"><div className="dh-filter-label"><label htmlFor="dh-search"><MagnifyingGlass size={16} /><input id="dh-search" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Название или ID темы" /></label><span>{visibleThemes.length} из {THEME_COUNT}</span></div><div className="dh-control-groups"><div className="dh-segment" role="group" aria-label="Рабочее пространство превью">{[['erg', 'ERG'], ['integra', 'Integra']].map(([id, name]) => <button key={id} aria-pressed={brand === id} onClick={() => setBrand(id)}>{name}</button>)}</div><div className="dh-segment" role="group" aria-label="Режим превью">{[['light', 'Светлый'], ['dark', 'Тёмный']].map(([id, name]) => <button key={id} aria-pressed={mode === id} onClick={() => setMode(id)}>{name}</button>)}</div></div></div>
        <div className="dh-filter-chips" role="group" aria-label="Вид темы">{GROUPS.map(([id, label]) => <button key={id} aria-pressed={group === id} onClick={() => setGroup(id)}>{label}<span>{id === 'all' ? THEME_COUNT : CHAT_PRESETS.filter(theme => theme.group === id).length}</span></button>)}</div>
        <div className="dh-catalog-layout"><div className="dh-catalog-grid" aria-label="Каталог тем">{visibleThemes.map(theme => <button className={`dh-theme-tile${selectedId === theme.id ? ' is-selected' : ''}`} key={theme.id} onClick={() => select(theme)} aria-pressed={selectedId === theme.id} aria-label={`Тема ${theme.name}`} data-preset={theme.id}><ThemeThumb theme={theme} />{theme.video && <span className="dh-live"><i />LIVE</span>}<span className="dh-tile-name">{theme.name}{selectedId === theme.id && <Check size={14} aria-hidden="true" />}</span></button>)}{visibleThemes.length === 0 && <p className="dh-empty">По этому запросу тем нет. Попробуйте другое название.</p>}</div>
          <aside className="dh-inspector" aria-label="Выбранная тема"><div className="dh-inspector-heading"><div><span className="dh-eyebrow">{groupName(selected.group)}</span><h3>{selected.name}</h3></div><code>{selected.id}</code></div>
            <div className={`dh-chat-preview ${appearanceClass(selected)}`} style={appearanceStyle(selected)} ref={previewRef}><ChatWallpaper appearance={selected} miniature /><span className="dh-preview-label">НАСТОЯЩИЙ MESSAGE</span><div className="dh-preview-messages"><Message msg={IN_MESSAGE} mine={false} withAvatarSlot={false} firstOfGroup lastOfGroup /><Message msg={OUT_MESSAGE} mine withAvatarSlot={false} firstOfGroup lastOfGroup /></div></div>
            <div className="dh-palette" aria-label="Цвета выбранной темы">{colors.map(([name, color]) => <div key={name}><i style={{ background: color }} /><span>{name}</span><code>{color}</code></div>)}</div>
            <p className="dh-inspector-note">{selected.palette ? 'Цвет read применяется внутри бабла. В меню и списках остаётся цвет приложения.' : `Стандартная тема следует токенам ${brand === 'erg' ? 'ERG' : 'Integra'}. Переключатели здесь не меняют сохранённые настройки.`}</p>
            {metadata && <><button className="dh-button dh-play-button" onClick={() => setPlaying(value => !value)} aria-expanded={playing} aria-controls="dh-video-player">{playing ? <X size={16} /> : <Play size={16} weight="fill" />}{playing ? 'Закрыть видео' : 'Посмотреть Live'}<small>{metadata.duration} с · {sizeLabel(metadata.bytes)}</small></button>{playing && <div className="dh-player" id="dh-video-player"><video key={selected.id} controls autoPlay muted loop playsInline preload="none" poster={selected.poster} src={selected.video} aria-label={`Live-фон ${selected.name}`} /><small>{metadata.width} × {metadata.height} · H.264 · без звука</small></div>}</>}
            <div className="dh-asset-links">{selected.video && <AssetLink path={selected.video}>Видео MP4</AssetLink>}{selected.poster && <AssetLink path={selected.poster}>Постер WebP</AssetLink>}{cssAsset && <AssetLink path={cssAsset}>{selected.pattern ? 'Паттерн SVG' : 'Зерно SVG'}</AssetLink>}{selected.id === 'standard' ? [['src/styles/tokens.css', 'Базовые токены'], ['src/styles/companies.css', 'Токены пространства'], ['src/components/MessageDeliveryStatus.css', 'Стандартные статусы']].map(([path, label]) => <ExternalLink className="dh-asset-link" key={path} href={sourceUrl(path)}><Code size={15} />{label}<span>{path.split('/').pop()}</span></ExternalLink>) : !selected.poster && <ExternalLink className="dh-asset-link" href={sourceUrl('src/screens/ChatAppearance.css')}><Code size={15} />CSS фона<span>ChatAppearance.css</span></ExternalLink>}</div>
            <details className="dh-preset-source"><summary>Объект пресета</summary><CodeBlock label={selected.id}>{JSON.stringify(selected, null, 2)}</CodeBlock></details>
          </aside></div>
        <div className="dh-media-note"><span><strong>{LIVE_COUNT} MP4</strong> · 720 × 1280 · циклы 9 / 24 с · без звука</span><p>Миниатюры — статичные постеры. Видео на этой странице запускается только по кнопке. {STILL_COUNT} фотографические темы — «Ночная степь» и «Планета» — остаются статичными. Выбор в этом каталоге служит для просмотра и не записывает настройки пользователя.</p></div>
      </section>

      <section className="dh-section" id="implementation"><SectionHeading number="02" eyebrow="УСТРОЙСТВО ПРОЕКТА" title="Быстрый старт, понятные границы.">React 19, Vite и Storybook. Репозиторий публичный; все ссылки ведут к действующим исходникам в main.</SectionHeading><div className="dh-two-column"><CodeBlock label="Установка и локальный запуск">{'git clone https://github.com/zhsnbv/qollab.git\ncd qollab\nnpm ci\nnpm run dev'}</CodeBlock><div className="dh-setup-notes"><h3>Локальная среда</h3><p>Node.js 20.19+ (ветка 20) или 22.12+ в соответствии с <code>engines</code>. Адрес dev-сервера появится в терминале.</p><dl><div><dt>Прототип</dt><dd>/handoff/settings</dd></div><div><dt>Этот раздел</dt><dd>/handoff/developers</dd></div><div><dt>Компоненты</dt><dd>npm run storybook</dd></div><div><dt>Полная сборка</dt><dd>npm run build</dd></div></dl></div></div>
        <div className="dh-source-map">{SOURCE_MAP.map(([title, files], index) => <details key={title} open={index === 0}><summary><span>{String(index + 1).padStart(2, '0')}</span>{title}<small>{files.length} файлов</small></summary><div>{files.map(([path, description]) => <ExternalLink key={path} href={sourceUrl(path)}><span><code>{path}</code><small>{description}</small></span></ExternalLink>)}</div></details>)}</div>
        <div className="dh-two-column dh-model"><div><h3>Сохранение выбора</h3><p><code>qollab.settings.v2</code> хранится в localStorage. В production этот адаптер должен читать и обновлять пользовательские настройки через backend. Стабильный ID связывает UI, миграцию и ассеты.</p><CodeBlock label="Схема настроек">{'{\n  "chatAppearance": {\n    "erg": { "preset": "live-coast" },\n    "integra": { "preset": "grad-mint" }\n  }\n}'}</CodeBlock></div><div><h3>Подключение темы к экрану</h3><p>Хук возвращает тему активного пространства. Внутри поверхности используйте настоящие сообщения. Изменение выбора проходит через единый адаптер.</p><CodeBlock label="React">{'const { appearance, update } = useChatAppearance();\n\n<div className={appearanceClass(appearance)}\n     style={appearanceStyle(appearance)}>\n  <ChatWallpaper appearance={appearance} />\n  <Message msg={message} mine={message.mine} />\n</div>\n\nupdate({ preset: "live-coast" });'}</CodeBlock></div></div>
      </section>

      <section className="dh-section" id="contracts"><SectionHeading number="03" eyebrow="ПРАВИЛА И СОСТОЯНИЯ" title="Что важно сохранить.">Эти ограничения обеспечивают одинаковое поведение в настройках, настоящем чате и контекстном меню.</SectionHeading><div className="dh-rules">{RULES.map(([title, text], i) => <article key={title}><span>{String(i + 1).padStart(2, '0')}</span><h3>{title}</h3><p>{text}</p></article>)}</div>
        <div className="dh-specs"><article><div className="dh-spec-header"><h3>Настройки и навигация</h3><ExternalLink href={storyUrl('список')}>Storybook</ExternalLink></div><ul><li>Белый top bar и текущий фон прототипа. Профиль не дублируется.</li><li>Язык — bottom sheet; Қазақша первым.</li><li>Каталог: один белый блок, закреплённое превью и прокручиваемая сетка 9:16.</li><li>Светлая / тёмная / системная — три превью 9:16 с равными отступами.</li><li>Общий стек: push / pop 300 мс, сохранённый родитель, управление фокусом и inert. При reduced motion переход мгновенный.</li></ul></article><article><div className="dh-spec-header"><h3>Быстрая реакция</h3><ExternalLink href={storyUrl('быстраяреакция')}>Storybook</ExternalLink></div><ul><li>40 подобранных эмодзи без поиска. Свернуто: 12 в двух рядах по 6.</li><li>Выбранная реакция остаётся видимой в свернутом состоянии.</li><li>Кнопка раскрытия: chevron вниз / вверх, aria-expanded и aria-controls.</li><li>Эмодзи 26 px, круг до 44 px. Оранжевое выделение одинаковое в ERG и Integra.</li><li>Набор опирается на публичные данные Unicode; это не статистика пользователей Qollab.</li></ul></article><article><div className="dh-spec-header"><h3>Данные и память</h3><ExternalLink href="/handoff/settings?view=prototype&screen=storage">Пройти сценарий</ExternalLink></div><ul><li>Разделённые сегменты donut с коротким круговым появлением; состав кэша выбирается по категориям.</li><li>Очистка на весь DeviceHost: экран под сильным blur и тёмной подложкой, фоновый интерфейс inert.</li><li>Процесс: вихрь втягивает иконки, внизу только процент. Цвет следует рабочему пространству.</li><li>Готово: мягкая зелёная галочка без подложки; «Отлично» — точный primary с белым текстом.</li><li>Фокус управляется внутри процесса и возвращается после закрытия; reduced motion сохраняет понятный статус.</li></ul></article><article><div className="dh-spec-header"><h3>Live и производительность</h3><ExternalLink href={sourceUrl('src/utils/chatWallpaperPlayback.js')}>Реализация</ExternalLink></div><ul><li>Стабильный poster находится под видео; видео видно только после playing.</li><li>muted, playsInline, loop, preload="none". В миниатюрах видеоплееров нет.</li><li>Скрытый маршрут, inert, offscreen, background tab, reduced motion и saveData приостанавливают фон.</li><li>Ошибка или запрещённый autoplay оставляет poster. Не заменять фото «фальшивым Live».</li><li>720 × 1280, H.264; 3 цикла по 9 с и 12 по 24 с. Для новых клипов проверять шов и движение на повторе.</li></ul></article></div>
        <div className="dh-cache-stories"><span className="dh-eyebrow">ОЧИСТКА В STORYBOOK</span><ExternalLink href="/storybook/?path=/story/cache-cleaning--running">Процесс · фиксированные 48%</ExternalLink><ExternalLink href="/storybook/?path=/story/cache-cleaning--complete">Завершение</ExternalLink><p>Эти два состояния предназначены для визуальной проверки. Настоящий переход от 0 до 100% запускается в сценарии «Данные и память».</p></div><div className="dh-boundary"><span className="dh-eyebrow">ГРАНИЦА ПРОТОТИПА</span><h3>UI-прототип для интеграции. Данные ещё демонстрационные.</h3><p>Очистка меняет локальное состояние, а не файловую систему телефона. Размеры памяти и сведения об устройстве — mock. Отправка сообщений, голосовое воспроизведение и часть действий показывают сценарий без сервера. «Выбрать» пока сообщает, что множественный выбор появится позже.</p><p>В production нужны API настроек и сообщений, настоящая статистика кэша, безопасное удаление локальных данных, ошибки и повтор операций. У общего ActionSheet остаётся отдельная задача по focus / inert. Физические устройства проверяются отдельно.</p></div>
      </section>

      <section className="dh-section" id="verification"><SectionHeading number="04" eyebrow="ПРОВЕРКА И ВЫПУСК" title="Проверяем поведение, затем публикуем.">Ниже — приёмочная матрица. Это список сценариев для текущей версии, а не автоматическое заявление о пройденном QA.</SectionHeading><div className="dh-checklist">{ACCEPTANCE.map(([title, detail], i) => <article key={title}><span>{String(i + 1).padStart(2, '0')}</span><div><h3>{title}</h3><p>{detail}</p></div></article>)}</div><div className="dh-two-column"><div><CodeBlock label="Полная сборка">{'npm ci\nnpm run build\n\n# Локально проверить собранный сайт\nnpm run preview'}</CodeBlock><p className="dh-caption">npm run build включает приложение и Storybook в одном dist. build:app собирает только приложение и не подходит для полного выпуска.</p></div><div className="dh-release-note"><h3>После публикации</h3><p>Проверить главную ссылку, интерактивные экраны, <code>/storybook/index.json</code>, Storybook iframe и MP4 с Range. В последнем deployment должны оставаться все части сборки.</p><ExternalLink href="/handoff-evidence/v12/qa.json">Отчёт локальной проверки v12</ExternalLink><ExternalLink href={sourceUrl('docs/chat-themes-handoff.md')}>Публикация, QA и ограничения</ExternalLink><ExternalLink href={sourceUrl('wrangler.jsonc')}>Конфигурация Cloudflare</ExternalLink></div></div>
      </section>

      <section className="dh-section" id="resources"><SectionHeading number="05" eyebrow="ДОКУМЕНТАЦИЯ" title="Продолжить с полным контекстом.">Основной контракт уже на этой странице. Ниже — подробности, актуальные исходники и происхождение ассетов.</SectionHeading><div className="dh-docs">{DOCS.map(([path, title, note]) => <ExternalLink key={path} href={sourceUrl(path)}><BookOpen size={20} /><span><strong>{title}</strong><small>{note}</small><code>{path}</code></span></ExternalLink>)}</div><div className="dh-story-links"><span className="dh-eyebrow">ЭКРАНЫ В STORYBOOK</span>{[['список', 'Настройки'], ['оформление', 'Оформление'], ['темычатов', 'Темы чатов'], ['быстраяреакция', 'Быстрая реакция'], ['память', 'Данные и память'], ['язык', 'Язык']].map(([id, label]) => <ExternalLink key={id} href={storyUrl(id)}>{label}</ExternalLink>)}</div><div className="dh-provenance"><h3>Происхождение и дальнейшая работа</h3><p>Иллюстрации и фотопостеры подготовлены через генерацию изображений. Три сценических видео предоставлены пользователем; двенадцать абстрактных — воспроизводимый renderer с описанием исходных публичных референсов. Иконки используют существующий Phosphor / Fluent набор. Условия внешних референсов не переименовываем в лицензию проекта.</p><p>При добавлении темы: прочитать AGENTS → добавить стабильный ID и полную палитру → подготовить файлы → подключить общий renderer → проверить матрицу → собрать весь сайт. Для обновления метаданных видео этого hub: <code>node src/gallery/developer-handoff/generate-media-metadata.mjs</code>.</p><ExternalLink href="https://www.unicode.org/emoji/frequency.html">Публичные частоты эмодзи Unicode</ExternalLink></div></section>
      <footer className="dh-footer"><a className="dh-logo" href="#overview">qollab<span>develop</span></a><p>Один адрес для дизайна, исходников и передачи в разработку.</p><a href="#overview">Наверх <ArrowRight size={15} /></a></footer>
    </main>
  </div>;
}
