/** @type {import('@storybook/react-vite').StorybookConfig} */
export default {
  // Истории лежат рядом с кодом, а не в отдельной папке: компонент и его
  // документация правятся одной правкой.
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx)'],
  addons: ['@storybook/addon-docs'],
  framework: { name: '@storybook/react-vite', options: {} },
  staticDirs: ['../public'],
};
