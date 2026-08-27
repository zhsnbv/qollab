import { useState } from 'react';
import {
  ArrowSync24Regular, Share24Regular, Broom24Regular, Settings24Regular,
  WeatherSunny24Regular, WeatherMoon24Regular, PhoneDesktop24Regular,
} from '@fluentui/react-icons';
import ActionSheet from '../ActionSheet';
import AttachSheet from '../AttachSheet';

export default {
  title: 'Молекулы/Лист действий',
  component: ActionSheet,
  parameters: {
    layout: 'centered',
    device: 'full',
    options: { showPanel: false },
    docs: {
      description: {
        component:
          'Единственный способ показать меню. Шапка приходит из SheetTop: ручка, заголовок и крестик '
          + 'в одну строку, свайп вниз закрывает. Три раскладки: иконки справа, иконки слева (iconsLeft) '
          + 'и режим выбора с галочкой (selected).',
      },
    },
  },
};

const MENU = [
  { id: 'refresh', label: 'Обновить страницу', Icon: ArrowSync24Regular },
  { id: 'share', label: 'Поделиться ссылкой', Icon: Share24Regular },
  { id: 'cache', label: 'Очистить кэш мини-приложения', Icon: Broom24Regular },
  { id: 'settings', label: 'Настройки', Icon: Settings24Regular },
];

const THEMES = [
  { id: 'light', label: 'Светлое', Icon: WeatherSunny24Regular },
  { id: 'dark', label: 'Тёмное', Icon: WeatherMoon24Regular },
  { id: 'auto', label: 'Автоматически', Icon: PhoneDesktop24Regular },
];

export const МенюЭкрана = {
  name: 'Меню экрана',
  render: () => <ActionSheet items={MENU} onClose={() => {}} onPick={() => {}} />,
};

export const СЗаголовком = {
  name: 'С заголовком и иконками слева',
  render: () => <AttachSheet onClose={() => {}} onPick={() => {}} />,
  parameters: { docs: { description: { story: 'AttachSheet — тот же лист с iconsLeft и отредактированными подписями.' } } },
};

export const РежимВыбора = {
  name: 'Режим выбора',
  render: () => {
    const [value, setValue] = useState('dark');
    return <ActionSheet title="Оформление" items={THEMES} selected={value} onClose={() => {}} onPick={setValue} />;
  },
};
