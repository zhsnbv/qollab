import { Headset, Info, ClipboardText, UsersThree, Bus, IdentificationCard, ShieldCheck, GraduationCap, Megaphone, DotsThree, BellSimple } from '@phosphor-icons/react';
const icons = { Headset, Info, ClipboardText, UsersThree, Bus, IdentificationCard, ShieldCheck, GraduationCap, Megaphone, DotsThree, BellSimple };
export default function NotificationIcon({ group, size = 40 }) {
  const Icon = icons[group?.icon] || BellSimple;
  const tone = group?.tone || '#78838F';
  return <span className="notification-icon" aria-hidden="true" style={{ width: size, height: size, color: '#fff', background: tone, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon size={size * 0.5} weight="fill" /></span>;
}
