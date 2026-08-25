// Карточка человека для объединённого профиля: переписка приходит из
// chatProfiles, рабочие данные — из справочника сотрудников. Собираем в одном
// месте, чтобы экран не знал, из какого источника взялось конкретное поле.
import { userProfiles } from './chatProfiles';
import { employees } from './employees';
import { structure } from './profile';
import { statusById, vacationStatus } from './statuses';

// Статусы коллег: обычные человек ставит себе сам, отпуск приезжает из HR
// вместе с датами. В прототипе розданы нескольким людям, чтобы были видны
// разные варианты бабла.
const WORK_STATUS = {
  arman: vacationStatus('25 авг', '3 сен'),
  madina: statusById('dnd'),
  dinara: statusById('busy'),
  nurlan: statusById('brb'),
};

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

// Собеседник приходит либо как id известного профиля, либо строкой справочника
// (тогда переписки с ним ещё нет и счётчики нулевые).
export function getPerson(id, employee) {
  const base = userProfiles[id] || (employee && {
    id: employee.id,
    name: employee.name,
    role: employee.role,
    phone: employee.phone,
    avatar: employee.avatar,
    initials: employee.initials,
    tint: employee.tint,
    status: employee.dismissed ? 'Сотрудник уволен' : 'был(-а) в сети недавно',
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
    work: WORK_STATUS[base.id] || null,
    dismissed: !!employee?.dismissed,
    team: structure.team,
    supervisor: structure.supervisor,
  };
}
