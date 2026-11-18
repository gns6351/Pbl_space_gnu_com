// AI 한 번 호출 + 시간 제한 + 출력 형식 검사 + 호출 기록
import { renderPrompt } from '../config.js';

// 시간이 지나면 실패로 처리하고, 보낸 요청도 abortSignal로 취소한다
function withTimeout(start, ms) {
  const ac = new AbortController();
  let t;
  return Promise.race([
    start(ac.signal),
    new Promise((_, reject) => { t = setTimeout(() => { ac.abort(); reject(Object.assign(new Error(`timeout ${ms}ms`), { name: 'AbortError' })); }, ms); }),
  ]).finally(() => clearTimeout(t));
}

const errCode = (err) => (err?.name === 'AbortError' || /timed? ?out|timeout|aborted/i.test(String(err?.message)) ? 'TIMEOUT' : err?.status ? `HTTP_${err.status}` : 'NETWORK');

// ask(kind, prompt, vars, { judge, attempt, mockInput })
//   judge(raw) → { valid: true, ...값 } | { valid: false, error }
//   결과: 형식이 맞으면 judge의 값, 아니면 { error }. 오류·지연도 { error }로 돌려준다(던지지 않음)
//   calls 배열에 호출마다 기록이 쌓인다(모델·지연·토큰·실패 사유·원문 응답)
export function createAsker(llm, timeoutMs, calls) {
  return async function ask(kind, prompt, vars, { attempt = 1, judge, mockInput }) {
    const t0 = Date.now();
    const base = { kind, attempt, at: new Date(t0).toISOString(), llmMode: llm.mode, model: llm.modelFor?.(kind) ?? null, prompt: `${prompt.ref}@${prompt.hash}` };
    try {
      const { raw, meta } = await withTimeout((signal) => llm.call(kind, { promptText: renderPrompt(prompt, vars), schema: prompt.schema, temperature: prompt.temperature, mockInput, attempt, signal }), timeoutMs);
      const j = judge(raw);
      calls.push({ ...base, ...meta, latencyMs: Date.now() - t0, raw, valid: j.valid, error: j.error || null });
      return j.valid ? j : { error: j.error };
    } catch (err) {
      calls.push({ ...base, latencyMs: Date.now() - t0, valid: false, error: errCode(err), message: String(err?.message || err).slice(0, 300) });
      return { error: errCode(err) };
    }
  };
}
