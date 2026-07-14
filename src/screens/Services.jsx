import { useState } from 'react';
import TabLayout from '../components/TabLayout';
import TopBar, { DotsIcon } from '../components/TopBar';
import { MagnifyingGlass } from '@phosphor-icons/react';
import { useSkeleton, ServicesSkeleton, FadeIn } from '../components/Skeleton';
import './Services.css';

// Данные из Figma-макета Screens (Type=Services (List) / (Grid)).
// Плитки-иконки нарезаны из общего экспорта в public/img/services.
const T = (n) => `/img/services/tile-${n}.png`;

const categories = [
  {
    title: 'Работа и развитие',
    items: [
      { tile: T(1), name: 'Мои задачи', sub: 'Управление списком рабочих дел и задач' },
      { tile: T(2), name: 'Мой манифест', sub: 'Отслеживание личных целей и достижений' },
      { tile: T(3), name: 'Фабрика идей', sub: 'Платформа предложений и обсуждения' },
      { tile: T(4), name: 'ERG CU', sub: 'Обучение и развитие персонала онлайн' },
      { tile: T(5), name: 'Access', sub: 'Доступ к предприятиям компании' },
      { tile: T(6), name: 'ОТиПБ', sub: 'Охрана труда и пром. безопасности' },
      { tile: T(7), name: 'Медицина', sub: 'Услуги корпоративной медицины и здоровья' },
    ],
  },
  {
    title: 'Люди и коммуникации',
    items: [
      { tile: T(8), name: 'ПоддERGка персонала', sub: 'Поддержка персонала по всем вопросам' },
      { tile: T(9), name: 'ДРП', sub: 'Добровольное решение проблем' },
      { tile: T(10), name: 'ERG Partners', sub: 'Взаимодействие с партнерами компании' },
      { tile: T(11), name: 'Персонал', sub: 'Информация для персонала и сотрудников' },
    ],
  },
  {
    title: 'Сервисы и инструменты',
    items: [
      { tile: T(12), name: 'МТОРО', sub: 'Заказ и учёт оборудования и материалов' },
      { tile: T(13), name: 'QR Сканер', sub: 'Сканирование QR-кодов для доступа к сервисам' },
      { tile: T(14), name: 'IT услуги', sub: 'Цифровые услуги для сотрудников' },
      { tile: T(15), name: 'Информация', sub: 'Корпоративные инструкции и документы' },
    ],
  },
  {
    title: 'Бизнес и логистика',
    items: [
      { tile: T(16), name: 'Sales Market', sub: 'Площадка для продажи товаров и услуг' },
      { tile: T(17), name: 'Marketplace', sub: 'Корпоративный маркетплейс' },
      { tile: T(18), name: 'Транспорт', sub: 'Заказы служебного транспорта' },
      { tile: T(19), name: 'ERG Way +', sub: 'Автоматизация и оптимизация бизнес-процессов' },
      { tile: T(20), name: 'Электронная очередь', sub: 'Электронная очередь на отгрузку материалов' },
    ],
  },
];

export default function Services() {
  const loading = useSkeleton();
  const [view, setView] = useState('list');
  const [fading, setFading] = useState(false);

  // Смена раскладки с быстрым fade-out → swap → fade-in
  const switchView = (next) => {
    if (next === view || fading) return;
    setFading(true);
    setTimeout(() => {
      setView(next);
      setFading(false);
    }, 140);
  };

  const actions = (
    <>
      <button className="topbar-btn" aria-label="Меню"><DotsIcon /></button>
      <div className="view-toggle">
        <button
          className={`view-toggle-btn ${view === 'grid' ? 'active' : ''}`}
          onClick={() => switchView('grid')}
          aria-label="Сетка"
        >
          <span className="toggle-ico toggle-ico--grid" />
        </button>
        <button
          className={`view-toggle-btn ${view === 'list' ? 'active' : ''}`}
          onClick={() => switchView('list')}
          aria-label="Список"
        >
          <span className="toggle-ico toggle-ico--list" />
        </button>
      </div>
    </>
  );

  if (loading) {
    return <TabLayout topbar={<TopBar title="Все сервисы" actions={actions} />}><ServicesSkeleton /></TabLayout>;
  }

  return (
    <TabLayout topbar={<TopBar title="Все сервисы" actions={actions} />}>
      <FadeIn><div className="services">
        <div className="services-search-wrap">
          <div className="services-search">
            <MagnifyingGlass size={20} color="var(--color-weak)" />
            <span>Поиск</span>
          </div>
        </div>

        <div className={`svc-body ${fading ? 'fading' : ''}`}>
        {categories.map((cat) => (
          <section className="svc-section" key={cat.title}>
            <h3 className="svc-section-title">{cat.title}</h3>
            <div className={view === 'list' ? 'svc-list' : 'svc-grid'}>
              {cat.items.map((item) => (
                <button className="svc-item" key={item.name}>
                  <span className="svc-tile"><img src={item.tile} alt="" /></span>
                  <span className="svc-texts">
                    <span className="svc-name">{item.name}</span>
                    {view === 'list' && <span className="svc-sub">{item.sub}</span>}
                  </span>
                </button>
              ))}
            </div>
          </section>
        ))}
        </div>
      </div></FadeIn>
    </TabLayout>
  );
}
