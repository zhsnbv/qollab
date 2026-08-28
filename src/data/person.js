// Карточка человека для объединённого профиля: переписка приходит из
// chatProfiles, рабочие данные — из справочника сотрудников. Собираем в одном
// месте, чтобы экран не знал, из какого источника взялось конкретное поле.
import { userProfiles } from './chatProfiles';
import { employees } from './employees';
import { structure } from './profile';
import { statusById, vacationStatus } from './statuses';

// Статусы коллег: обычные человек ставит себе сам, отпуск приезжает из HR
// вместе с датами. В прототипе розданы вручную, чтобы разные варианты были
// видны сразу — и в бабле профиля, и кружком в списке чатов.
//
// Ключ — id профиля или имя: первые строки списка чатов написаны руками и id
// не имеют, а раздача по хешу до них не доставала — первый статус выпадал на
// десятую строку, ниже экрана, и казалось, что их нет вовсе.
const WORK_STATUS = {
  arman: vacationStatus('25 авг', '3 сен'),
  madina: statusById('dnd'),
  dinara: statusById('busy'),
  nurlan: statusById('brb'),
  'Аяжан Сериккызы': statusById('busy'),
  'Данияр Кенжебаев': statusById('brb'),
  'Ерлан Абишев': statusById('dnd'),
  'Нурлан Бейсенов': statusById('off'),
  'Мадина Жумагулова': statusById('away'),
};

// Остальным раздаём статусы по имени: примерно у каждого третьего он есть,
// иначе в списке чатов почти никто не показывал бы статус. Хеш отдельный —
// тот, что решает про историю переписки, распределён иначе.
const SPREAD = ['busy', 'away', 'off', 'dnd', 'brb'];
const nameHash = (str) => [...str].reduce((n, c) => (n * 33 + c.charCodeAt(0)) >>> 0, 5381);
const spreadStatus = (person) => {
  const h = nameHash(person.name);
  // Индекс берём из другого разряда: h % 5 уже решает, есть ли статус, и
  // при том же основании все получали бы один и тот же.
  return h % 5 < 2 ? statusById(SPREAD[Math.floor(h / 5) % SPREAD.length]) : null;
};

const pickStatus = (person) => WORK_STATUS[person.id] || WORK_STATUS[person.name] || spreadStatus(person);

// «Обо мне» человек пишет сам; в прототипе текст общий — своего у карточек
// собеседников в данных нет.
const ABOUT = 'Работаю над продуктами группы: аналитика, процессы и запуск новых '
  + 'сервисов. Люблю понятные решения и спокойную коммуникацию, всегда открыт(-а) '
  + 'к вопросам от коллег.';

// Почта в ERG собирается из имени и фамилии латиницей
const RU_LAT = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i',
  й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't',
  у: 'u', ф: 'f', х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y',
  ь: '', э: 'e', ю: 'yu', я: 'ya', ә: 'a', ғ: 'g', қ: 'k', ң: 'n', ө: 'o',
  ұ: 'u', ү: 'u', һ: 'h', і: 'i',
};
const translit = (word) => [...word.toLowerCase()].map((c) => RU_LAT[c] ?? c).join('');
const emailFrom = (name) => {
  const [first, last] = name.split(' ');
  return `${translit(first)}.${translit(last || first)}@erg.kz`;
};

// Корпоративные данные в прототипе общие: на макете это блок из HR-системы,
// а не то, что человек заполняет сам.
const CORP = {
  tabNumber: '16002874',
  company: 'ТОО «BTS»',
  unit: 'Управление продуктовой разработки',
  chief: structure.supervisor.name,
};

// Часть собеседников — «пустые»: общих файлов и групп с ними нет. Решаем по
// имени, а не случайно при рендере, иначе один и тот же человек то с
// вложениями, то без.
const hash = (str) => [...str].reduce((n, c) => (n * 31 + c.charCodeAt(0)) % 997, 7);
const hasHistory = (person) => !!userProfiles[person.id] || hash(person.name) % 2 === 0;

// Рабочий статус человека — тот же, что показывает профиль. Список чатов
// берёт его отсюда же, иначе в двух местах он был бы разным.
export const workStatusOf = (person) => (person && person.name ? pickStatus(person) : null);

// Собеседник приходит либо как id известного профиля, либо строкой справочника
// (тогда переписки с ним ещё нет и счётчики нулевые).
export function getPerson(id, employee) {
  // Человека из справочника узнаём и по id: чат уволенного передаёт только его,
  // и без этой ветки профиль подставлял первого попавшегося коллегу.
  const src = employee || employees.find((e) => e.id === id);
  const base = userProfiles[id] || (src && {
    id: src.id,
    name: src.name,
    role: src.role,
    phone: src.phone,
    avatar: src.avatar,
    initials: src.initials,
    tint: src.tint,
    status: src.dismissed
      ? `был(-а) в сети ${src.lastSeen || 'давно'}`
      : 'был(-а) в сети недавно',
  }) || userProfiles.ayazhan;

  const fromDirectory = employees.find((e) => e.id === base.id || e.name === base.name);

  // Вложения в прототипе общие: у собеседников без своей карточки берём тот
  // же демонабор — но только у тех, с кем «есть история».
  const demo = hasHistory(base) ? userProfiles.ayazhan : { groups: [], media: [], files: [], links: [] };

  return {
    ...CORP,
    ...base,
    groups: base.groups || demo.groups,
    media: base.media || demo.media,
    files: base.files || demo.files,
    links: base.links || demo.links,
    // Должность и телефон подтягиваем из справочника, если в чате их нет
    role: base.role || fromDirectory?.role || '',
    phone: base.phone || fromDirectory?.phone || 'не указан',
    company: fromDirectory?.company || CORP.company,
    email: emailFrom(base.name),
    about: ABOUT,
    thanks: 21,
    interests: ['Баскетбол', 'Кино', 'Музыка', 'Путешествия'],
    work: pickStatus(base),
    dismissed: !!(employee?.dismissed || fromDirectory?.dismissed),
    team: structure.team,
    supervisor: structure.supervisor,
  };
}
