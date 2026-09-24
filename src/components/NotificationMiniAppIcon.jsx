import { allServices } from '../data/services';
// Exact component exports from the supplied Figma mini-app library.
const icons = {
  'Почта 2.0': 'mail', 'Информация': 'information', 'IT заявки': 'it-tickets',
  'Расчетный листок 3.0': 'payslip', 'ERG Bus': 'erg-bus', 'ЕСЭД': 'esed',
  'Электронная очередь': 'queue', 'МТОРО': 'mtoro', 'ERG CU': 'erg-cu',
  'Корпоративные скидки': 'discounts', 'ERG Partners': 'partners', 'Qollab': 'qollab',
};
export default function NotificationMiniAppIcon({ service, size = 32 }) {
  const source = icons[service] ? `/img/notification-miniapps/${icons[service]}.png` : allServices.find(s => s.name === service)?.img || '/img/notification-miniapps/fallback.png';
  return <img className="ng-miniapp-icon" src={source} alt={service || 'Миниапп'} width={size} height={size} />;
}
