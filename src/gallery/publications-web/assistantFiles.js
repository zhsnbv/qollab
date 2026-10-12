export const ASSISTANT_ACCEPT = '.pdf,.docx,.txt,.md,.csv,.json,.png,.jpg,.jpeg,.webp';
export const MAX_FILES = 5;
export const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_TEXT = 60000;
const dataUrl = file => new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = () => reject(new Error('Не удалось прочитать файл')); reader.readAsDataURL(file); });

export async function readAssistantFile(file) {
  if (file.size > MAX_FILE_SIZE) throw new Error(`${file.name}: файл больше 10 МБ.`);
  const ext = file.name.split('.').at(-1).toLowerCase();
  const base = { id: crypto.randomUUID(), name: file.name, size: file.size, extension: ext };
  if (['png', 'jpg', 'jpeg', 'webp'].includes(ext)) {
    const src = await dataUrl(file);
    const decoded = await createImageBitmap(file).catch(() => { throw new Error(`${file.name}: изображение не удалось открыть.`); });
    decoded.close();
    return { ...base, kind: 'image', src };
  }
  let text;
  if (['txt', 'md', 'csv', 'json'].includes(ext)) text = await file.text();
  else if (ext === 'docx') {
    const mammoth = await import('mammoth/mammoth.browser.js');
    const result = await (mammoth.default || mammoth).extractRawText({ arrayBuffer: await file.arrayBuffer() });
    text = result.value;
  } else if (ext === 'pdf') {
    const pdfjs = await import('pdfjs-dist');
    const worker = await import('pdfjs-dist/build/pdf.worker.min.mjs?url');
    pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
    const task = pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()), isEvalSupported: false });
    try {
      const pdf = await task.promise;
      if (pdf.numPages > 40) throw new Error(`${file.name}: выберите PDF до 40 страниц.`);
      const pages = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i), content = await page.getTextContent();
        pages.push(content.items.map(item => item.str + (item.hasEOL ? '\n' : ' ')).join(''));
        if (pages.join('\n').length > MAX_TEXT) throw new Error(`${file.name}: документ слишком большой. Загрузите нужный фрагмент.`);
      }
      text = pages.join('\n\n');
    } catch (error) {
      if (error.name === 'PasswordException') throw new Error(`${file.name}: снимите пароль с PDF и загрузите снова.`);
      throw error;
    } finally { await task.destroy(); }
  } else throw new Error(`${file.name}: поддерживаются PDF, DOCX, TXT, MD, CSV, JSON и изображения PNG/JPG/WebP.`);
  text = text.replaceAll(String.fromCharCode(0), '').trim();
  if (!text) throw new Error(`${file.name}: не найден текст. Для скана нужен PDF с текстовым слоем или текст, вставленный в чат.`);
  if (text.length > MAX_TEXT) throw new Error(`${file.name}: слишком много текста. Загрузите только нужный фрагмент.`);
  return { ...base, kind: 'document', text };
}
