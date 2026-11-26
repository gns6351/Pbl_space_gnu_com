import AsyncStorage from '@react-native-async-storage/async-storage';

// 지훈님 AI 서버(ai-server)와 주고받는 부분. 문서: ai-server/docs/api.md
// 서버 주소는 app/.env 의 EXPO_PUBLIC_API_URL (에뮬레이터: http://10.0.2.2:3000/api/game)
const BASE = process.env.EXPO_PUBLIC_API_URL ?? '';

// 이 시간 안에 응답이 없으면 실패로 본다 (ms). 거울 장면은 서버가 20초 안에 끝낸다
const TIMEOUT_MS = 30000;

// ---------- 서버가 돌려주는 화면 상태(view) ----------
export type Stage = 'worry' | 'guest' | 'counsel' | 'mirror' | 'judge' | 'done' | 'help' | 'quit';

export type GameGuest = { name: string; age: string; role: string; background: string; situation: string; source: 'ai' | 'example' };

export type GameTurn = {
    n: number; // 지금 턴 번호. 보낼 때 그대로 돌려준다
    max: number;
    kind: 'normal' | 'advice'; // advice = 조언 요청 턴 (직접 써야 함)
    guest: string; // 손님 대사
    choices: { id: string; text: string }[];
    input: 'choice_or_text' | 'text';
    suggestEnd: boolean; // 손님이 마무리를 제안한 대사
};

export type View = {
    id: string;
    stage: Stage;
    store: boolean;
    worry?: string;
    guest?: GameGuest;
    canReroll?: boolean;
    turn?: GameTurn;
    transcript?: { n: number; guest: string; player: { type: 'choice' | 'text'; text: string }; highlighted: boolean }[];
    highlights?: { id: string; turn: number; text: string }[];
    mirrorOptions?: { id: string; turn: number; guestBefore: string; text: string; guestAfter: string | null }[];
    mirror?: { worry: string; original: string; returned: string | null; shown: 'self' | 'original_only' };
    help?: { title: string; lines: string[] };
};

export type Verdict = 'accept' | 'modify' | 'hold' | 'reject';

// ---------- 실패 ----------
export class GameError extends Error {
    status: number; // 0이면 서버에 닿지 못함
    code?: string; // 예: AI_RETRY, STALE_TURN, WRONG_STAGE
    retryable: boolean;
    constructor(status: number, message: string, code?: string, retryable = false) {
        super(message);
        this.status = status;
        this.code = code;
        this.retryable = retryable;
    }
}

/** 실패를 화면에 보여 줄 짧은 안내로 바꾼다 */
export function errorMessage(e: unknown): string {
    if (!(e instanceof GameError)) return '연결이 잠깐 끊겼어요. 다시 시도해 주세요.';
    if (e.code === 'TIMEOUT') return '응답이 평소보다 오래 걸리고 있어요. 다시 시도해 주세요.';
    if (e.status === 0) return '상담소에 연결하지 못했어요. 인터넷 연결을 확인하고 다시 시도해 주세요.';
    if (e.code === 'AI_RETRY') return '손님이 잠깐 생각에 잠겼어요. 다시 시도해 주세요.';
    return e.message || '상담소에 잠깐 문제가 생겼어요. 다시 시도해 주세요.';
}

// ---------- 기기 ID, 요청 번호 ----------
// 기기마다 한 번 만들어 저장해 두는 익명 ID (서버의 playerId). 내 캐릭터 번호와는 다르다
const KEY_DEVICE = 'mirror.deviceId';
let deviceId: string | null = null;
const randomPart = () => Math.random().toString(36).slice(2, 10);

async function getDeviceId(): Promise<string> {
    if (deviceId) return deviceId;
    const saved = await AsyncStorage.getItem(KEY_DEVICE);
    
    deviceId = saved ?? `d-${Date.now().toString(36)}-${randomPart()}`;
    if (!saved) await AsyncStorage.setItem(KEY_DEVICE, deviceId);
    return deviceId;
}

/** 버튼을 누를 때마다 새로 만든다. 같은 요청을 다시 보낼 때는 같은 값을 쓴다 (FR-12) */
export const newRequestId = () => `r-${Date.now().toString(36)}-${randomPart()}`;

// ---------- 서버 호출 ----------
async function call(method: 'GET' | 'POST' | 'DELETE', path: string, body?: object): Promise<View> {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);

    try {
        const res = await fetch(BASE + path, {
            method,
            headers: { 'Content-Type': 'application/json', 'x-player-id': await getDeviceId() },
            body: body ? JSON.stringify(body) : undefined,
            signal: ctrl.signal,
        });

        if (res.status === 204) return {} as View;
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new GameError(res.status, data.error ?? '', data.code, data.retryable === true);
        return data as View;

    } catch (e) {
        if (e instanceof GameError) throw e;
        if (ctrl.signal.aborted) throw new GameError(0, '', 'TIMEOUT', true);
        throw new GameError(0, '', 'NETWORK', true);

    } finally {
        clearTimeout(timer);
    }
}

const post = (path: string, body: object, rid = newRequestId()) => call('POST', path, { ...body, requestId: rid });

// 화면에서 부를 함수들. rid를 넘기면 그 번호로 다시 보낸다 (다시 시도할 때)
export const game = {
    /** 새 판 만들기 (FR-01). store: 대화 저장 동의 */
    create: async (store: boolean, rid?: string) => post('/sessions', { playerId: await getDeviceId(), consent: true, store }, rid),
    /** 걱정 보내기 → 손님 생성 또는 도움 안내 */
    worry: (id: string, worry: string, rid?: string) => post(`/sessions/${id}/worry`, { worry }, rid),
    /** 손님 다시 만들기 (1회) */
    reroll: (id: string, rid?: string) => post(`/sessions/${id}/guest/reroll`, {}, rid),
    /** 상담 시작 → 첫 턴 */
    start: (id: string, rid?: string) => post(`/sessions/${id}/start`, {}, rid),
    /** 선택지(choiceId) 또는 직접 쓴 말(text) 보내기 */
    turn: (id: string, n: number, input: { choiceId: string } | { text: string }, rid?: string) =>
    post(`/sessions/${id}/turn`, { turn: n, ...input }, rid),
    /** 마무리 (언제든) → mirror 또는 done */
    end: (id: string, rid?: string) => post(`/sessions/${id}/end`, {}, rid),
    /** 고른 조언을 나에게 하는 말로 바꾸기 → judge */
    mirror: (id: string, highlightId: string, rid?: string) => post(`/sessions/${id}/mirror`, { highlightId }, rid),
    /** 돌아온 말에 대한 판단 → done */
    decision: (id: string, verdict: Verdict, edited?: string, rid?: string) => post(`/sessions/${id}/decision`, { verdict, edited }, rid),
    /** 그만하기 */
    quit: (id: string) => post(`/sessions/${id}/quit`, {}),
    /** 현재 상태 다시 받기 */
    get: (id: string) => call('GET', `/sessions/${id}`),
    /** 이 판의 기록 삭제 */
    remove: (id: string) => call('DELETE', `/sessions/${id}`),
};