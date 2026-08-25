import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import './Skeleton.css';

// Разделы, для которых скелетон уже показывался в этой сессии вкладки —
// при повторных заходах скелетон больше не нужен, только плавный fade-in.
const visitedRoutes = new Set();

// Скелетон — только при первом тапе на раздел. Дальше переход мгновенный,
// а контент проявляется плавным fade-in (см. класс .fade-in / <FadeIn>).
export function useSkeleton(delay = 700) {
  const { pathname } = useLocation();
  const [loading, setLoading] = useState(() => !visitedRoutes.has(pathname));

  useEffect(() => {
    if (!loading) return;
    const t = setTimeout(() => {
      visitedRoutes.add(pathname);
      setLoading(false);
    }, delay);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return loading;
}

// Оборачивает готовый контент экрана в лёгкую fade-in анимацию при монтировании.
export function FadeIn({ children }) {
  return <div className="fade-in">{children}</div>;
}

// Базовый блок с шиммером. circle=true — круг co стороной w.
export function Sk({ w, h, r, circle, flex, style }) {
  return (
    <span
      className="sk"
      style={{
        width: w, height: h,
        borderRadius: circle ? 999 : r ?? 8,
        flex: flex ? '1 1 auto' : undefined,
        ...style,
      }}
    />
  );
}

const Row = ({ gap = 12, style, children }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap, ...style }}>{children}</div>
);
const Col = ({ gap = 8, style, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap, flex: 1, minWidth: 0, ...style }}>{children}</div>
);

// Строка «аватар + две линии» — чаты, сервисы
function LineRow({ size = 56, r }) {
  return (
    <Row gap={12}>
      <Sk w={size} h={size} circle={r === undefined} r={r} />
      <Col>
        <Sk w="45%" h={14} />
        <Sk w="70%" h={12} />
      </Col>
    </Row>
  );
}

export function HomeSkeleton() {
  return (
    <div className="sk-screen">
      {/* Поиск + баннеры — как в card--first */}
      <div className="sk-card" style={{ borderRadius: '0 0 16px 16px', marginTop: 0 }}>
        <Sk w="100%" h={44} r={999} />
        <Row gap={16} style={{ marginTop: 16 }}>
          <Sk w={202} h={106} r={16} style={{ flex: 'none' }} />
          <Sk w={202} h={106} r={16} style={{ flex: 'none' }} />
        </Row>
      </div>
      {/* Сервисы + избранное */}
      <div className="sk-card">
        <Sk w={120} h={18} style={{ marginBottom: 16 }} />
        <div className="sk-grid">
          {[...Array(8)].map((_, i) => (
            <Col key={i} gap={10} style={{ alignItems: 'center' }}>
              <Sk w={60} h={60} r={20} />
              <Sk w={52} h={10} />
            </Col>
          ))}
        </div>
        <Sk w={140} h={18} style={{ margin: '24px 0 16px' }} />
        <Row gap={12}>
          <Sk w={210} h={64} r={12} style={{ flex: 'none' }} />
          <Sk w={210} h={64} r={12} style={{ flex: 'none' }} />
        </Row>
      </div>
      {/* Публикации/Мероприятия */}
      <div className="sk-card">
        <Row gap={12} style={{ marginBottom: 20 }}>
          <Sk h={44} r={24} flex />
          <Sk h={44} r={24} flex />
        </Row>
        {[...Array(3)].map((_, i) => (
          <Row key={i} gap={16} style={{ marginBottom: 20, alignItems: 'flex-start' }}>
            <Col gap={10}>
              <Sk w="90%" h={15} />
              <Sk w="55%" h={15} />
              <Sk w="40%" h={12} />
            </Col>
            <Sk w={84} h={84} r={16} style={{ flex: 'none' }} />
          </Row>
        ))}
      </div>
    </div>
  );
}

export function PostsSkeleton() {
  return (
    <div className="sk-screen sk-screen--white">
      <div style={{ padding: '8px 16px 12px' }}><Sk w="100%" h={44} r={999} /></div>
      <Row gap={12} style={{ padding: '0 16px 12px' }}>
        <Sk h={44} r={24} flex />
        <Sk h={44} r={24} flex />
      </Row>
      <Row gap={10} style={{ padding: '8px 16px 16px' }}>
        {[...Array(5)].map((_, i) => (
          <Col key={i} gap={8} style={{ flex: 'none', alignItems: 'center' }}>
            <Sk w={68} h={68} circle />
            <Sk w={54} h={10} />
          </Col>
        ))}
      </Row>
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {[...Array(4)].map((_, i) => (
          <Row key={i} gap={24} style={{ alignItems: 'flex-start' }}>
            <Col gap={12}>
              <Row gap={8}><Sk w={20} h={20} circle /><Sk w={70} h={12} /></Row>
              <Sk w="95%" h={16} />
              <Sk w="60%" h={16} />
              <Sk w="50%" h={12} />
            </Col>
            {i % 2 === 0 && <Sk w={84} h={84} r={16} style={{ flex: 'none' }} />}
          </Row>
        ))}
      </div>
    </div>
  );
}

export function ChatsSkeleton() {
  return (
    <div className="sk-screen sk-screen--white">
      <div style={{ padding: '8px 16px 12px' }}><Sk w="100%" h={44} r={999} /></div>
      <div style={{ padding: '4px 16px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {[...Array(9)].map((_, i) => <LineRow key={i} />)}
      </div>
    </div>
  );
}

export function ServicesSkeleton() {
  return (
    <div className="sk-screen sk-screen--white">
      <div style={{ padding: '8px 16px 20px' }}><Sk w="100%" h={44} r={999} /></div>
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Sk w={140} h={14} />
        {[...Array(6)].map((_, i) => <LineRow key={i} size={48} r={16} />)}
        <Sk w={160} h={14} style={{ marginTop: 8 }} />
        {[...Array(3)].map((_, i) => <LineRow key={`b${i}`} size={48} r={16} />)}
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="sk-screen">
      {/* Шапка: аватар по центру, бабл статуса, имя с должностью и ряд
          быстрых действий — всё в одном блоке, как на готовом экране */}
      <div className="sk-card sk-card--hero">
        <Sk w={128} h={128} circle />
        <Sk w={148} h={28} r={999} style={{ marginTop: 12 }} />
        <Sk w={200} h={25} style={{ marginTop: 12 }} />
        <Sk w={132} h={14} style={{ marginTop: 6 }} />
        <Row gap={8} style={{ marginTop: 16, width: '100%' }}>
          {[...Array(4)].map((_, i) => (
            <span className="sk-quick" key={i}>
              <Sk w={36} h={36} r={12} />
              <Sk w="70%" h={12} />
            </span>
          ))}
        </Row>
      </div>

      {/* Баланс: заголовок и четыре плитки */}
      <div className="sk-card">
        <Row gap={16} style={{ marginBottom: 16 }}>
          <Sk w={90} h={16} />
          <Sk w={150} h={14} style={{ marginLeft: 'auto' }} />
        </Row>
        <div className="sk-grid sk-grid--2">
          {[...Array(4)].map((_, i) => <Sk key={i} w="100%" h={78} r={8} />)}
        </div>
      </div>

      {/* Следующая карточка — списком строк */}
      <div className="sk-card">
        <Sk w={120} h={16} style={{ marginBottom: 16 }} />
        {[...Array(3)].map((_, i) => (
          <Row gap={12} key={i} style={{ marginBottom: i === 2 ? 0 : 14 }}>
            <Sk w={40} h={40} circle style={{ flex: 'none' }} />
            <span style={{ flex: 1 }}>
              <Sk w="55%" h={14} style={{ marginBottom: 6 }} />
              <Sk w="35%" h={12} />
            </span>
          </Row>
        ))}
      </div>
    </div>
  );
}

