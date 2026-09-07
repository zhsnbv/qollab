// Резолвер метаданных карточки — этап 2 плана. В прототипе «сеть» подделана,
// но политика настоящая: catalog-first у мини-аппов, дедупликация одинаковых
// запросов, ограниченный кэш с TTL, отдельный отрицательный кэш и очистка
// при выходе из аккаунта.
import { previewMiniApps, previewInvites } from '../data/linkPreviews';
import { linkKey, parseInternalLink } from './internalLink';

// TTL из таблицы раздела 8.2. Значения в проде согласуются с бэкендом.
const TTL = {
  catalog: Infinity, // живёт до следующего обновления каталога
  mini_app: 15 * 60 * 1000,
  group_invite: 5 * 60 * 1000,
  negative: 45 * 1000,
};

// Задержки, чтобы скелетон было видно: каталог отвечает мгновенно, endpoint —
// как настоящий запрос.
const LATENCY = { catalog: 0, endpoint: 420, invite: 620 };

// Шов для сторей и тестов: скелетон живёт доли секунды, и поймать его иначе
// нельзя. В приложении не вызывается.
export function setPreviewLatency(patch) {
  Object.assign(LATENCY, patch);
}

const cache = new Map();
const inflight = new Map();

// Всё, что закэшировано, привязано к сессии: при logout/смене аккаунта
// показывать чужие метаданные нельзя.
export function resetLinkPreviewCache() {
  cache.clear();
  inflight.clear();
}

function fresh(entry) {
  if (!entry) return null;
  const ttl = entry.negative ? TTL.negative : TTL[entry.ttlKind] ?? 0;
  if (ttl === Infinity) return entry;
  return Date.now() - entry.at < ttl ? entry : null;
}

// Синхронный ответ там, где он возможен: попадание в каталог не должно
// показывать скелетон, а повторный рендер того же сообщения — ходить в сеть.
export function peekPreview(link) {
  const key = linkKey(link);
  if (!key) return null;
  const hit = fresh(cache.get(key));
  if (hit) return hit.result;
  if (link.type === 'mini_app') {
    const app = previewMiniApps[link.miniAppId];
    if (app && app.source === 'catalog') return miniAppResult(link, app, 'catalog');
  }
  return null;
}

function miniAppResult(link, app, cacheKind) {
  if (!app || !app.available) return { status: 'unavailable', reason: app ? 'forbidden' : 'not_found' };
  return {
    status: 'ready',
    cache: cacheKind,
    kind: 'mini_app',
    title: app.names.ru,
    subtitle: app.descriptions.ru,
    logo: app.logo,
    action: 'Открыть',
  };
}

function inviteResult(invite) {
  if (!invite) return { status: 'unavailable', reason: 'not_found' };
  if (invite.state !== 'active') {
    // Недействительное приглашение показываем карточкой, но без названия и
    // аватарки: по плану оно не должно раскрывать, что за группа.
    return { status: 'ready', cache: 'network', kind: 'group_invite', invalid: true, title: 'Приглашение недействительно' };
  }
  const member = invite.membership === 'member';
  return {
    status: 'ready',
    cache: 'network',
    kind: 'group_invite',
    title: invite.channel.name,
    subtitle: `${invite.channel.members} участников`,
    note: invite.channel.about,
    logo: invite.channel.avatar,
    action: member ? 'Открыть' : 'Вступить',
  };
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// Один запрос на ключ: пятьдесят одинаковых ссылок в истории не должны
// превращаться в пятьдесят запросов (бюджет из раздела 10).
export function resolvePreview(link) {
  const key = linkKey(link);
  if (!key) return Promise.resolve({ status: 'unavailable', reason: 'invalid' });

  const hit = fresh(cache.get(key));
  if (hit) return Promise.resolve(hit.result);
  if (inflight.has(key)) return inflight.get(key);

  const job = (async () => {
    let result;
    let ttlKind;
    if (link.type === 'mini_app') {
      const app = previewMiniApps[link.miniAppId];
      const fromCatalog = app && app.source === 'catalog';
      await wait(fromCatalog ? LATENCY.catalog : LATENCY.endpoint);
      result = miniAppResult(link, app, fromCatalog ? 'catalog' : 'network');
      ttlKind = fromCatalog ? 'catalog' : 'mini_app';
    } else {
      await wait(LATENCY.invite);
      result = inviteResult(previewInvites[link.token]);
      ttlKind = 'group_invite';
    }
    cache.set(key, {
      result,
      at: Date.now(),
      ttlKind,
      negative: result.status === 'unavailable',
    });
    inflight.delete(key);
    return result;
  })();

  inflight.set(key, job);
  return job;
}

// Для проверок в сторях и тестах
export function previewCacheStats() {
  return { cached: cache.size, inflight: inflight.size };
}

// Одна точка исполнения ссылок Qollab: и текст, и карточка приходят сюда, и
// результат обязан совпадать (раздел 8, этап 5 плана). Внешние адреса и
// служебные команды карточки не получают и открываются как обычные ссылки.
export function describeLink(url) {
  const link = parseInternalLink(url);
  if (!link) return 'Ссылка откроется во внешнем браузере';
  if (link.type === 'mini_app') {
    const app = previewMiniApps[link.miniAppId];
    if (!app || !app.available) return 'Приложение недоступно';
    return `Откроется «${app.names.ru}»${link.toUrl ? ` на ${link.toUrl}` : ''}`;
  }
  const invite = previewInvites[link.token];
  if (!invite || invite.state !== 'active') return 'Приглашение недействительно';
  return invite.membership === 'member'
    ? `Откроется группа «${invite.channel.name}»`
    : `Вступление в группу «${invite.channel.name}»`;
}
