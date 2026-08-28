// Справочник сотрудников для экрана «Написать сообщение» (Figma 25122-109360).
// Поиск в макете идёт «по ФИ, тел, должности», поэтому у каждого есть имя,
// телефон, должность и предприятие — по ним и фильтруем.
// dismissed — уволенные: имя зачёркнуто, вместо реквизитов «Сотрудник уволен».
export const employees = [
  {
    id: 'nurlan-ibragimov', name: 'Нурлан Ибрагимов',
    company: 'Business & Technology Services',
    phone: '+77017300276', role: 'Java Developer',
    avatar: '/img/chats/daniyar.png',
  },
  {
    id: 'ivan-ivanov', name: 'Иван Иванов',
    initials: 'ИИ', dismissed: true,
  },
  {
    id: 'ekaterina', name: 'Екатерина Брунер', dismissed: true,
    // У уволенного из карточки остаётся только телефон и дата последнего входа:
    // должность, подразделение и руководитель к нему уже не относятся.
    phone: '+7 (701) 413-49-44',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    lastSeen: '19.06.2026 в 14:55',
  },
  {
    id: 'aliya-seitova', name: 'Алия Сеитова',
    company: 'Шубарколь Комир',
    phone: '+77015500234', role: 'Бухгалтер',
    initials: 'АС', tint: 'green',
  },
  {
    id: 'asel-temirova', name: 'Асель Темирова',
    company: 'Научно-исследовательский инженерный центр ERG',
    phone: '+77015500234', role: 'Бухгалтер',
    initials: 'АС', tint: 'green',
  },
  {
    id: 'nurlan-bekenov', name: 'Нурлан Бекенов',
    company: 'Business & Technology Services',
    phone: '+77015500234', role: 'Разработчик программного обеспечения',
    avatar: '/img/chats/daniyar.png',
  },
  {
    id: 'aliya-zhakesheva', name: 'Алия Жакешева',
    company: 'Услуги в области бухгалтерского учёта',
    phone: '+77015500345', role: 'Инженер-программист',
    initials: 'АЖ', tint: 'orange',
  },
  {
    id: 'aizhan-serikkyzy', name: 'Аяжан Сериккызы',
    company: 'Business & Technology Services',
    phone: '+77017300112', role: 'Руководитель проекта',
    avatar: '/img/chats/ayazhan.png',
  },
  {
    id: 'daniyar-kenzhebaev', name: 'Данияр Кенжебаев',
    company: 'ERG Service',
    phone: '+77017300455', role: 'Инженер по охране труда',
    avatar: '/img/chats/daniyar.png',
  },
  {
    id: 'erlan-abishev', name: 'Ерлан Абишев',
    company: 'Казахстанский электролизный завод',
    phone: '+77017300987', role: 'Юрист',
    initials: 'ЕА', tint: 'orange',
  },
  {
    id: 'timur-mukashev', name: 'Тимур Мукашев',
    company: 'Соколовско-Сарбайское ГПО',
    phone: '+77015500781', role: 'Начальник смены',
    initials: 'ТМ', tint: 'blue',
  },
  {
    id: 'leila-kasymova', name: 'Лейла Касымова',
    company: 'Аксуский завод ферросплавов',
    phone: '+77015500640', role: 'HR бизнес-партнёр',
    initials: 'ЛК', tint: 'orange',
  },
  {
    id: 'bekzat-yerzhanov', name: 'Бекзат Ержанов',
    company: 'Евразийская Энергетическая Корпорация',
    phone: '+77015500329', role: 'Энергетик',
    initials: 'БЕ', tint: 'blue',
  },
];

const norm = (s) => (s || '').toLowerCase();

export function searchEmployees(query) {
  const q = norm(query.trim());
  if (!q) return [];
  return employees.filter((e) =>
    norm(e.name).includes(q)
    || norm(e.role).includes(q)
    || norm(e.company).includes(q)
    || norm(e.phone).includes(q));
}
