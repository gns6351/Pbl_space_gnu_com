import { createContext, ReactNode, useContext, useMemo, useState } from 'react';

import type { GuestInfo, Turn } from '@/api';

// 직접 쓴 조언 하나. before는 그 말을 하게 된 바로 앞의 손님 말 (거울 앞에서 상황을 떠올리게 한다)
export type Highlight = { id: number; text: string; before: string };

// 한 판 동안 화면들이 함께 쓰는 값. 서버 연동 전까지는 앱 안에서만 들고 있는다.
type Session = {
  saveConsent: boolean;
  worry: string;
  guestId: string | null; // 손님 일러스트
  sessionId: string | null; // 서버의 이번 판 번호
  guest: GuestInfo | null; // 손님 생성 API가 만든 손님
  firstTurn: Turn | null; // 손님의 첫 대사
  regenLeft: number;
  highlights: Highlight[]; // 기록장에 담긴 직접 쓴 조언들 (한 판에 여러 개)
  highlight: string | null; // 그중 거울 앞에서 고른 하나
  returned: string | null; // 거울이 돌려준 말
  decision: '수용' | '수정' | '보류' | '거부' | null;
};

const initial: Session = {
  saveConsent: false,
  worry: '',
  guestId: null,
  sessionId: null,
  guest: null,
  firstTurn: null,
  regenLeft: 1,
  highlights: [],
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
