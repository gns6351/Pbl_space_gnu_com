// 앱과 서버가 주고받는 데이터 모양. 지훈님 API 명세가 정해지면 이름을 맞춘다.

/** 손님 생성 API가 돌려주는 손님 정보 (FR-03) */
export type GuestInfo = {
  name: string;
  age: string; // 예: '20대 후반~30대 초반'
  background: string; // 예: '디자인 회사 2년 차'
  reason: string; // 찾아온 이유 (걱정의 핵심 갈등은 유지하고 이름·배경만 바꾼 고민)
};

/** 손님의 한 턴: 대사와 다음에 고를 수 있는 것 (FR-04, FR-05, FR-07) */
export type Turn = {
  line: string | null; // 손님 대사. 대화가 끝났으면 null일 수 있다
  choices: string[]; // 선택지 2~3개. 조언 요청 턴이면 빈 배열
  askAdvice: boolean; // true면 선택지 없이 직접 써야 한다
  done: boolean; // true면 대화 끝 (마무리하기만 남는다)
};

export type CreateGuestResult = { sessionId: string; guest: GuestInfo; first: Turn };

export type SendTurnResult = {
  highlight: boolean; // 방금 보낸 말이 조언으로 판정됐는지 (직접 입력 턴만, FR-06)
  risk: boolean; // 위험 발화로 판정됐는지 (FR-10). true면 안내 화면으로
  next: Turn;
};

export type ReflectResult = { returned: string | null }; // 점검 실패 시 null (원문만 표시, FR-09)

/** 화면에 맞는 안내를 고르기 위한 실패 종류 */
export type ApiErrorKind = 'timeout' | 'network' | 'server';

export class ApiError extends Error {
  kind: ApiErrorKind;
  constructor(kind: ApiErrorKind, message?: string) {
    super(message ?? kind);
    this.kind = kind;
  }
}
