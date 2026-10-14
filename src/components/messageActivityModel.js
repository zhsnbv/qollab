const validTime = value => value != null && Number.isFinite(Date.parse(value));
const reactionWord = count => count % 100 >= 11 && count % 100 <= 14 ? 'реакций' : count % 10 === 1 ? 'реакция' : count % 10 >= 2 && count % 10 <= 4 ? 'реакции' : 'реакций';

export function compactActivityTime(value, now = new Date(), timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone) {
  if (!validTime(value)) return '';
  const date = new Date(value), today = new Date(now);
  const dayKey = d => new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
  const clock = new Intl.DateTimeFormat('ru-RU', { timeZone, hour: '2-digit', minute: '2-digit' }).format(date);
  if (dayKey(date) === dayKey(today)) return clock;
  if (dayKey(date) === dayKey(new Date(today.getTime() - 86400000))) return 'Вчера, ' + clock;
  const currentYear = new Intl.DateTimeFormat('en', { timeZone, year: 'numeric' }).format(today);
  const year = new Intl.DateTimeFormat('en', { timeZone, year: 'numeric' }).format(date);
  return new Intl.DateTimeFormat('ru-RU', { timeZone, day: 'numeric', month: 'short', ...(year !== currentYear ? {year:'numeric'} : {}) }).format(date) + ', ' + clock;
}

function identity(person) {
  const userId = String(person.userId ?? person.id ?? '');
  return { ...person, userId, name: person.name || person.short || (userId === 'me' ? 'Вы' : person.initials) || 'Участник' };
}

export function normalizeMessageActivity({ mine = false, readers = [], reactions = {}, personal = false, now, timeZone } = {}) {
  const readMap = new Map();
  if (mine === true) for (const raw of readers) {
    const person = identity(raw);
    if (!person.userId || person.userId === 'me' || !validTime(person.readAt)) continue;
    if (!readMap.has(person.userId) || Date.parse(person.readAt) > Date.parse(readMap.get(person.userId).readAt)) readMap.set(person.userId, person);
  }
  const rows = Array.isArray(reactions) ? reactions : Object.entries(reactions).flatMap(([emoji, users]) => users.map(user => ({...user, emoji})));
  const reactionMap = new Map();
  for (const raw of rows) {
    const person = identity(raw);
    if (!person.userId || !person.emoji) continue;
    const previous = reactionMap.get(person.userId);
    if (previous && (Date.parse(previous.reactedAt) || 0) > (Date.parse(person.reactedAt) || 0)) continue;
    // The reaction payload may contain read metadata; only the separately authorized reader list can reveal it.
    const {readAt: _readAt, ...safeReaction} = person;
    reactionMap.set(person.userId, {...safeReaction, reactedAt: validTime(person.reactedAt) ? person.reactedAt : null});
  }
  const readersList = [...readMap.values()].sort((a,b) => Date.parse(b.readAt)-Date.parse(a.readAt) || a.name.localeCompare(b.name,'ru') || a.userId.localeCompare(b.userId));
  const people = new Map(personal ? [] : readMap);
  for (const reaction of reactionMap.values()) people.set(reaction.userId, {...reaction, ...people.get(reaction.userId), emoji:reaction.emoji, reactedAt:reaction.reactedAt});
  const eventTime = person => Math.max(Date.parse(person.readAt) || 0, Date.parse(person.reactedAt) || 0);
  const sortedPeople = [...people.values()].sort((a,b) => Number(Boolean(b.emoji))-Number(Boolean(a.emoji)) || eventTime(b)-eventTime(a) || a.name.localeCompare(b.name,'ru') || a.userId.localeCompare(b.userId));
  const readCount = readersList.length, reactionCount = reactionMap.size;
  const hasReadsInList = !personal && readCount > 0;
  const label = [reactionCount ? reactionCount + ' ' + reactionWord(reactionCount) : '', hasReadsInList ? (reactionCount ? readCount + ' прочитали' : 'Прочитали ' + readCount) : ''].filter(Boolean).join(' · ');
  return {readers:readersList, reactors:[...reactionMap.values()], people:sortedPeople, readCount, reactionCount, personal, personalReadAt:personal ? readersList[0]?.readAt : null, label,
    title:reactionCount ? (hasReadsInList ? 'Реакции и просмотры' : 'Реакции') : 'Просмотры', now, timeZone};
}

export function activityFixtureReaders(people, readAt = new Date().toISOString()) {
  return people.map(person => ({...identity(person), readAt}));
}
