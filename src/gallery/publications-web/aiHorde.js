import { parseArticleEnvelope } from './assistantArticle.js';

const API = 'https://aihorde.net/api/v2';
const headers = { 'Content-Type': 'application/json', apikey: '0000000000', 'Client-Agent': 'qollab-publications-demo:2.0:local-review' };
const pause = (ms, signal) => new Promise((resolve, reject) => {
  if (signal.aborted) { reject(new DOMException('Отменено', 'AbortError')); return; }
  const abort = () => { clearTimeout(timer); reject(new DOMException('Отменено', 'AbortError')); };
  const timer = setTimeout(() => { signal.removeEventListener('abort', abort); resolve(); }, ms);
  signal.addEventListener('abort', abort, { once: true });
});
async function request(path, options = {}) {
  let response;
  try { response = await fetch(API + path, { ...options, headers, signal: options.signal ? AbortSignal.any([options.signal, AbortSignal.timeout(20000)]) : AbortSignal.timeout(20000) }); }
  catch (error) {
    if (options.signal?.aborted) throw new DOMException('Отменено', 'AbortError');
    throw new Error(error.name === 'TimeoutError' ? 'AI-сервис долго не отвечает. Попробуйте ещё раз.' : 'Не удалось связаться с AI-сервисом. Проверьте соединение и повторите.');
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(response.status === 429 ? 'Квилли сейчас занят. Попробуйте чуть позже.' : data.rc === 'KudosUpfront' ? 'Достигнут лимит запросов. Попробуйте позже.' : 'AI-сервис не смог обработать текст. Попробуйте ещё раз.');
  return data;
}
function formattedPrompt(prompt, model) {
  if (/gemma-4/i.test(model)) return `<|turn>user\n${prompt}<turn|>\n<|turn>model\n<|channel>thought\n<channel|>`;
  return /gemma/i.test(model) ? `<start_of_turn>user\n${prompt}<end_of_turn>\n<start_of_turn>model\n` : `<|im_start|>user\n${prompt}<|im_end|>\n<|im_start|>assistant\n`;
}
export async function generateArticleWithAiHorde(prompt, { signal, onProgress = () => {} }) {
  onProgress({ phase: 'connecting' });
  const models = await request('/status/models?type=text', { signal });
  const candidates = (Array.isArray(models) ? models : []).filter(model => model.count > 0 && (/^(?:koboldcpp\/)?google\/gemma-4-(?:12b|31b|26b-a4b)(?:-it)?$/i.test(model.name) || /gemma-3-(?:4|12|27)b-it$/i.test(model.name) || /Qwen2\.5-(?:3|7|14|32|72)B-Instruct$/i.test(model.name)));
  candidates.sort((a, b) => ((a.eta || 0) + 512 / (a.performance || 10)) - ((b.eta || 0) + 512 / (b.performance || 10)));
  if (!candidates[0]) throw new Error('Квилли временно недоступен. Материалы сохранены — попробуйте позже.');
  const model = candidates[0].name;
  let text = '';
  // Anonymous workers often limit one answer to 512 tokens. Continue the same
  // assistant turn when needed instead of silently cutting off a whole article.
  for (let part = 0; part < 6; part++) {
    signal.throwIfAborted();
    let id, finished = false;
    try {
      onProgress({ model, phase: part ? 'continuing' : 'sending' });
      const queued = await request('/generate/text/async', { method: 'POST', signal, body: JSON.stringify({ prompt: formattedPrompt(prompt, model) + text, models: [model], params: { max_length: 512, max_context_length: 16384, temperature: 0.3, top_p: 0.9, rep_pen: 1.03, n: 1, stop_sequence: ['<end_of_turn>', '<|im_end|>', '<eos>', '<turn|>'] }, trusted_workers: false, validated_backends: true, slow_workers: true, context_fit: 'reject' }) });
      id = queued.id;
      if (!id) throw new Error('AI-сервис не принял запрос. Попробуйте ещё раз.');
      signal.throwIfAborted();
      const deadline = Date.now() + 180000;
      while (Date.now() < deadline) {
        const status = await request(`/generate/text/status/${encodeURIComponent(id)}`, { signal });
        if (status.faulted || status.is_possible === false) throw new Error('Квилли временно недоступен. Материалы сохранены — попробуйте позже.');
        onProgress({ model, phase: status.processing ? (part ? 'continuing' : 'writing') : 'queued', position: status.queue_position });
        if (status.done) {
          finished = true;
          const generation = status.generations?.[0];
          if (!generation?.text || generation.state === 'faulted') throw new Error('Не удалось получить статью. Попробуйте ещё раз.');
          text += generation.text;
          break;
        }
        await pause(3000, signal);
      }
      if (!finished) throw new Error('Очередь заняла больше трёх минут. Запрос отменён, материалы сохранены — попробуйте позже.');
    } finally {
      if (id && !finished) await request(`/generate/text/status/${encodeURIComponent(id)}`, { method: 'DELETE', signal: AbortSignal.timeout(5000) }).catch(() => {});
    }
    try { parseArticleEnvelope(text); return { text, model }; } catch { /* Continue until an actual article is complete. */ }
  }
  throw new Error('Не удалось завершить статью. Материалы сохранены — попробуйте более короткий запрос.');
}
