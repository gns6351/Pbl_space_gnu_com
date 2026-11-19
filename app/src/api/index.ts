import { API_CONFIG } from './config';
import { mockApi } from './mock';
import { ApiError, CreateGuestResult, ReflectResult, SendTurnResult } from './types';

export * from './types';

// 정해진 시간 안에 응답이 없거나 연결이 끊기면 ApiError로 바꿔 던진다.
async function post<T>(path: string, body: unknown, timeoutMs: number): Promise<T> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(API_CONFIG.baseUrl + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    if (!res.ok) throw new ApiError('server', `HTTP ${res.status}`);
    return (await res.json()) as T;
  } catch (e) {
    if (e instanceof ApiError) throw e;
    if (ctrl.signal.aborted) throw new ApiError('timeout');
    throw new ApiError('network');
  } finally {
    clearTimeout(timer);
  }
}

// TODO(서버 연동): 주소와 요청 모양은 지훈님 API 명세에 맞춘다. 아래는 가정한 형태.
// 로그에는 걱정·대화 원문을 남기지 않는다.
const realApi = {
  createGuest: (worry: string, look: { ageRange: string }) =>
    post<CreateGuestResult>('/game/sessions', { worry, look }, API_CONFIG.timeoutMs.guest),
  sendTurn: (sessionId: string, input: { text: string; picked: boolean }) =>
    post<SendTurnResult>(`/game/sessions/${sessionId}/turns`, input, API_CONFIG.timeoutMs.turn),
  reflect: (sessionId: string, text: string) =>
    post<ReflectResult>(`/game/sessions/${sessionId}/reflect`, { text }, API_CONFIG.timeoutMs.reflect),
};

// 임시 API도 같은 시간 제한을 걸어, 서버가 느릴 때와 똑같이 실패 화면을 확인할 수 있게 한다
function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new ApiError('timeout')), ms);
    p.then((v) => { clearTimeout(t); resolve(v); }, (e) => { clearTimeout(t); reject(e); });
  });
}

const mocked = {
  createGuest: (w: string, l: { ageRange: string }) => withTimeout(mockApi.createGuest(w, l), API_CONFIG.timeoutMs.guest),
  sendTurn: (id: string, i: { text: string; picked: boolean }) => withTimeout(mockApi.sendTurn(id, i), API_CONFIG.timeoutMs.turn),
  reflect: (id: string, t: string) => withTimeout(mockApi.reflect(id, t), API_CONFIG.timeoutMs.reflect),
};

export const api = API_CONFIG.useMock ? mocked : realApi;

/** 실패 종류에 맞는 짧은 안내 */
export function errorMessage(e: unknown): string {
  const kind = e instanceof ApiError ? e.kind : 'network';
  if (kind === 'timeout') return '응답이 평소보다 오래 걸리고 있어요. 다시 시도해 주세요.';
  if (kind === 'server') return '상담소에 잠깐 문제가 생겼어요. 다시 시도해 주세요.';
  return '연결이 잠깐 끊겼어요. 인터넷 연결을 확인하고 다시 시도해 주세요.';
}
