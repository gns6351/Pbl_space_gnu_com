// 서버 연결 설정.
// 서버가 준비되면 useMock을 false로 바꾸고, app/.env에 EXPO_PUBLIC_API_URL=서버 주소 를 넣는다.
// (.env는 커밋하지 않는다. API 키 같은 비밀값은 앱에 절대 넣지 않는다)
export const API_CONFIG = {
  useMock: true,
  baseUrl: process.env.EXPO_PUBLIC_API_URL ?? '',
  // 이 시간 안에 응답이 없으면 실패로 보고 실패 화면을 보여 준다 (ms)
  timeoutMs: { guest: 30000, turn: 20000, reflect: 20000 },
};

// 임시 API가 일부러 기다리는 시간 (ms). 기다리는 화면을 확인하기 위한 값
export const MOCK_DELAY = { guest: 2500, turn: 1500, reflect: 3500 };

// 실패 화면 시험용 말. 걱정·대화·조언 어디든 이 말이 들어 있으면 임시 API가 한 번 실패한다.
// (다시 시도하면 성공한다)
export const MOCK_FAIL_WORD = '/실패';
