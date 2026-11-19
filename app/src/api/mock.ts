import { MOCK_DELAY, MOCK_FAIL_WORD } from './config';
import { ApiError, CreateGuestResult, ReflectResult, SendTurnResult, Turn } from './types';

// 서버가 생기기 전까지 쓰는 임시 API. 실제 대화는 AI가 만들고 더 길어진다.

const SCRIPT: { line: string; choices: string[]; askAdvice?: boolean }[] = [
  { line: '사실 팀원 한 명이 일주일째 답장이 없어요.', choices: ['많이 답답했겠다.', '언제부터 그랬어?', '다른 팀원들은 뭐래?'] },
  { line: '단톡방에 공지를 올려도 읽기만 하고 아무 말이 없어요.', choices: ['읽기만 하면 더 신경 쓰이지.', '다른 연락 방법은 있어?'] },
  { line: '그냥 제가 다 해 버릴까 싶다가도 억울해요.', choices: ['억울할 만해.', '혼자 다 하면 힘들잖아.'] },
  { line: '그 사람이 또 안 읽으면요? 저라면 어떻게 하는 게 좋을까요?', choices: [], askAdvice: true },
  { line: '따로 연락하는 건 좀 무서워요. 괜히 싸우게 될까 봐요.', choices: ['그 마음 이해돼.', '무서운 게 당연해.'] },
  { line: '혹시 말을 꺼낸다면, 어떻게 시작하면 좋을까요?', choices: [], askAdvice: true },
  { line: '그렇게 해 볼 수 있을 것 같아요. 오늘 이야기 들어 줘서 고마워요.', choices: [] },
];

const NAMES = ['서윤', '민준', '하은', '도윤', '지아', '현우'];
const sessions = new Map<string, number>(); // sessionId → 지금 턴 번호
const failedOnce = new Set<string>(); // 같은 요청은 한 번만 실패시키고, 다시 시도하면 성공

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function maybeFail(key: string, text: string) {
  if (text.includes(MOCK_FAIL_WORD) && !failedOnce.has(key)) {
    failedOnce.add(key);
    throw new ApiError('network', '임시 API 실패 시험');
  }
}

function turnAt(i: number): Turn {
  const t = SCRIPT[Math.min(i, SCRIPT.length - 1)];
  return { line: t.line, choices: t.choices, askAdvice: !!t.askAdvice, done: i >= SCRIPT.length - 1 };
}

export const mockApi = {
  async createGuest(worry: string, look: { ageRange: string }): Promise<CreateGuestResult> {
    await wait(MOCK_DELAY.guest);
    await maybeFail('guest:' + worry, worry);
    const sessionId = `mock-${Date.now()}`;
    sessions.set(sessionId, 0);
    return {
      sessionId,
      guest: {
        name: NAMES[Math.floor(Math.random() * NAMES.length)],
        age: look.ageRange,
        background: '[배경]',
        reason: `[임시] "${worry.replace(MOCK_FAIL_WORD, '').trim()}"와 닮은 고민을 안고 찾아왔어요.`,
      },
      first: turnAt(0),
    };
  },

  async sendTurn(sessionId: string, input: { text: string; picked: boolean }): Promise<SendTurnResult> {
    await wait(MOCK_DELAY.turn);
    const i = sessions.get(sessionId) ?? 0;
    await maybeFail(`turn:${sessionId}:${i}`, input.text);
    const risk = input.text.includes('/위험');
    // 실제로는 직접 입력 턴에서만 논문 엔진이 판정한다. 임시로 10자 이상이면 조언으로 본다.
    const highlight = !input.picked && !risk && input.text.trim().length >= 10;
    sessions.set(sessionId, i + 1);
    return { highlight, risk, next: turnAt(i + 1) };
  },

  async reflect(sessionId: string, text: string): Promise<ReflectResult> {
    await wait(MOCK_DELAY.reflect);
    await maybeFail(`reflect:${sessionId}:${text}`, text);
    return { returned: `[임시] ${text}` };
  },
};
