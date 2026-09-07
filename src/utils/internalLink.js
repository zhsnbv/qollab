// Разбор внутренних ссылок Qollab в сообщениях — по разделу 6 плана
// «Карточки внутренних ссылок в чатах».
//
// Функции чистые и намеренно не знают про React: карточку рисует UI, а тут
// только классификация. Правила строгие, потому что от них зависит, что
// пользователь увидит как «свою» ссылку:
//   • host сравнивается целиком, а не через includes — иначе
//     link.qollab.kz.evil.example проходил бы как внутренний;
//   • userinfo (user@host) отклоняется — это классический спуф адресной строки;
//   • command берётся из allowlist: карточка нужна только контенту, который
//     осознанно пересылают, а не служебным командам (auth, sessions, access).

const HOSTS = ['link.qollab.kz'];
const SCHEME = 'qollab:';

// Только эти команды получают карточку. Всё остальное (chats, auth, sessions,
// access, qr-screen, ergiz_session) — навигация, не контент.
const CARD_COMMANDS = {
  apps: 'mini_app',
  invite: 'group_invite',
};

const MAX_ID = 64;
const MAX_TOKEN = 128;
const MAX_TO_URL = 512;

export function parseInternalLink(raw) {
  const src = String(raw || '').trim();
  let url;
  try {
    url = new URL(src);
  } catch {
    return null;
  }

  const scheme = url.protocol.toLowerCase();
  if (scheme === 'https:' || scheme === 'http:') {
    if (url.username || url.password) return null;
    if (!HOSTS.includes(url.hostname.toLowerCase())) return null;
  } else if (scheme !== SCHEME) {
    return null;
  }

  const q = url.searchParams;
  const type = CARD_COMMANDS[(q.get('command') || '').toLowerCase()];
  if (!type) return null;

  if (type === 'mini_app') {
    const miniAppId = q.get('id');
    if (!miniAppId || miniAppId.length > MAX_ID) return null;
    const toUrl = q.get('to_url') || undefined;
    // to_url не исполняем и не показываем — только передаём дальше, и то
    // лишь если он выглядит как внутренний путь.
    if (toUrl && (toUrl.length > MAX_TO_URL || !toUrl.startsWith('/') || toUrl.startsWith('//'))) {
      return { type, url: src, miniAppId };
    }
    return { type, url: src, miniAppId, toUrl };
  }

  const token = q.get('token');
  if (!token || token.length > MAX_TOKEN) return null;
  return { type, url: src, token };
}

// Ключ кэша и дедупликации. Токен приглашения наружу не уходит: в прототипе
// хранить его негде, но привычка правильная — по плану raw token не должен
// попадать ни в логи, ни в долгоживущие ключи.
export function linkKey(link) {
  if (!link) return null;
  return link.type === 'mini_app'
    ? `mini_app:${link.miniAppId}`
    : `group_invite:${link.token.slice(0, 6)}…${link.token.length}`;
}

const URL_RE = /(?:https?|qollab):\/\/[^\s<>«»"']+/gi;
const MD_LINK_RE = /\[[^\]]*\]\(\s*((?:https?|qollab):\/\/[^\s)]+)\s*\)/gi;
const CODE_RE = /(`{1,3})[\s\S]*?\1/g;
// Хвостовая пунктуация не входит в адрес: «зайди сюда https://…/?x=1.» —
// точка тут принадлежит предложению, а не ссылке.
const TRAILING = /[.,;:!?)»"'\]]+$/;

function maskCode(text) {
  // Ссылки внутри `code` и ```fenced``` не считаются ссылками. Заменяем на
  // пробелы той же длины, чтобы индексы остальных совпадений не поехали.
  return text.replace(CODE_RE, (m) => ' '.repeat(m.length));
}

// Все ссылки сообщения в порядке документа: markdown-подписи и «голые» URL.
export function collectLinks(text) {
  const masked = maskCode(String(text || ''));
  const found = [];
  const covered = [];

  MD_LINK_RE.lastIndex = 0;
  for (let m = MD_LINK_RE.exec(masked); m; m = MD_LINK_RE.exec(masked)) {
    found.push({ at: m.index, url: m[1] });
    covered.push([m.index, m.index + m[0].length]);
  }

  URL_RE.lastIndex = 0;
  for (let m = URL_RE.exec(masked); m; m = URL_RE.exec(masked)) {
    // Тот же адрес внутри markdown-подписи уже учтён
    if (covered.some(([a, b]) => m.index >= a && m.index < b)) continue;
    found.push({ at: m.index, url: m[0].replace(TRAILING, '') });
  }

  return found.sort((a, b) => a.at - b.at).map((f) => f.url);
}

// Карточка в сообщении одна — первая подходящая ссылка в порядке документа
// (правило 4.1 плана: «максимум одна карточка»).
export function extractFirstInternalLink(text) {
  for (const url of collectLinks(text)) {
    const link = parseInternalLink(url);
    if (link) return link;
  }
  return null;
}
