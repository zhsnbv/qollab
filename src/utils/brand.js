// Подмена бренда под выбранное рабочее пространство.
//
// Тексты прототипа написаны под ERG и разбросаны по десятку файлов с данными,
// поэтому вместо правки каждой строки подменяем их на лету: проходим по
// текстовым узлам и применяем словарь. Порядок правил важен — сначала
// составные названия, потом отдельное слово, иначе «ПоддERGка» превратится
// в «ПоддIntegraка».
const RULES = (brand) => [
  [/ПоддERGка/g, 'Поддержка'],
  [/ERGiz/g, `${brand} AI`],
  [/ERG Coins/g, `${brand} Coins`],
  [/ERG Way\s*\+?/g, `${brand} Way+`],
  [/ERG Service/g, `${brand} Service`],
  [/ERG Sport/g, `${brand} Sport`],
  [/ERG News/g, `${brand} News`],
  [/ERG Pirates/g, `${brand} Pirates`],
  [/ERG CU/g, `${brand} CU`],
  [/Новости ERG/g, `Новости ${brand}`],
  [/Блог ERG/g, `Блог ${brand}`],
  [/\bERG\b/g, brand],
];

function applyTo(node, rules) {
  const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
  const dirty = [];
  while (walker.nextNode()) {
    const n = walker.currentNode;
    if (n.nodeValue.includes('ERG')) dirty.push(n);
  }
  dirty.forEach((n) => {
    let v = n.nodeValue;
    rules.forEach(([re, to]) => { v = v.replace(re, to); });
    n.nodeValue = v;
  });
}

// Возвращает функцию отключения: следим за деревом, потому что экраны
// монтируются и обновляются постоянно.
export function startBrandSwap(brand) {
  const root = document.getElementById('root');
  if (!root || !brand) return () => {};
  const rules = RULES(brand);

  applyTo(root, rules);
  const observer = new MutationObserver((records) => {
    records.forEach((r) => {
      r.addedNodes.forEach((n) => {
        if (n.nodeType === Node.ELEMENT_NODE) applyTo(n, rules);
        else if (n.nodeType === Node.TEXT_NODE && n.nodeValue.includes('ERG')) {
          let v = n.nodeValue;
          rules.forEach(([re, to]) => { v = v.replace(re, to); });
          n.nodeValue = v;
        }
      });
    });
  });
  observer.observe(root, { childList: true, subtree: true, characterData: false });
  return () => observer.disconnect();
}
