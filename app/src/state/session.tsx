import { createContext, ReactNode, useContext, useMemo, useState } from 'react';


import type { View } from '@/api/game';

// 한 판 동안 화면들이 함께 쓰는 값. 진행 상태는 서버가 돌려준 game(view)이 기준이다.
type Session = {
  saveConsent: boolean; // 카드 저장 동의
  worry: string;
  guestId: string | null; // 손님 그림 (앱이 고른다)
  game: View | null; // 서버가 마지막으로 돌려준 화면 상태
  pickedHighlightId: string | null; // 거울 앞에서 고른 조언 번호
  highlight: string | null; // 고른 조언 원문
  returned: string | null; // 거울이 돌려준 말 (점검 실패면 null)
  decision: '수용' | '수정' | '보류' | '거부' | null;
};

const initial: Session = {
  saveConsent: false,
  worry: '',
  guestId: null,
  game: null,
  pickedHighlightId: null,
  highlight: null,
  returned: null,
  decision: null,
};

type Ctx = { s: Session; set: (patch: Partial<Session>) => void; reset: () => void };

const SessionContext = createContext<Ctx | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [s, setS] = useState<Session>(initial);
  const value = useMemo<Ctx>(
    () => ({ s, set: (patch) => setS((prev) => ({ ...prev, ...patch })), reset: () => setS(initial) }),
    [s],
  );
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession은 SessionProvider 안에서만 쓸 수 있어요');
  return ctx;
}
