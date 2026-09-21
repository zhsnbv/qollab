// Vite-плагин: прогоняет исходники через babel-plugin-i18n до того, как JSX
// превратится в вызовы React. Свой плагин, а не опция @vitejs/plugin-react,
// потому что в этой сборке JSX компилирует oxc и babel там не запускается.
import { transformAsync } from '@babel/core';
import i18n from './babel-plugin-i18n.mjs';

export default function vitePluginI18n() {
  return {
    name: 'qollab-i18n',
    enforce: 'pre',
    async transform(code, id) {
      const file = id.split('?')[0];
      if (!/\.[jt]sx?$/.test(file) || file.includes('node_modules')) return null;
      if (!/[А-Яа-яЁё]/.test(code)) return null;
      const out = await transformAsync(code, {
        filename: file,
        plugins: [i18n],
        parserOpts: { plugins: ['jsx'] },
        configFile: false,
        babelrc: false,
        sourceMaps: true,
        // JSX не разворачиваем — это дальше сделает основной компилятор
        compact: false,
      });
      return out ? { code: out.code, map: out.map } : null;
    },
  };
}
