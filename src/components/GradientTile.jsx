import './GradientTile.css';

// Плитка-иконка сервиса: скруглённый градиентный квадрат с 3D-иллюстрацией
// внутри (см. Home/ServicesSheet). Иллюстрация чуть увеличена и обрезана по
// краям (object-fit: cover на изображении шире контейнера) — так эмулируем
// «выход за края» без ручного подбора offset/scale под каждую из 30+ иконок,
// как это сделано в Figma индивидуально для каждого инстанса.
//
// icon вместо img — запасной вариант для пары сервисов (Sales Market,
// Фабрика идей, Транспорт), чей экспорт из Figma пришёл пустым: это были
// изображения-заливки от стороннего плагина (Pngtree), которые API отдаёт
// пустыми — рисуем понятный Phosphor-глиф вместо белого квадрата.
export default function GradientTile({ bg, img, icon: Icon, size = 48, className = '' }) {
  return (
    <span
      className={`gtile ${className}`}
      style={{ width: size, height: size, background: `linear-gradient(180deg, ${bg})` }}
    >
      {Icon ? (
        <Icon size={Math.round(size * 0.52)} weight="fill" color="rgba(0,0,0,0.45)" className="gtile-fallback-icon" />
      ) : (
        <img className="gtile-img" src={img} alt="" />
      )}
    </span>
  );
}
