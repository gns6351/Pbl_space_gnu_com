import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

// 기기에만 저장되는 값: 내 캐릭터, 동의 상태, 카드 보관함 (FR-01, FR-13, FR-14). 서버로 보내지 않는다.
export type Card = {
  id: string;
  createdAt: string; // ISO 날짜
  worry: string;
  text: string; // 거울이 돌려준 말 (사용자가 고친 최종본)
  decision: string | null;
};

export type Consent = {
  version: number; // 고지 내용이 바뀌면 CONSENT_VERSION을 올려 다시 묻는다
  saveCards: boolean; // (선택) 카드 저장 동의
  agreedAt: string; // ISO 날짜
};

// 동의 화면의 고지 내용(수집 목적·전송·보관·삭제)을 바꾸면 이 숫자를 올린다.
export const CONSENT_VERSION = 1;

const KEY_PLAYER = 'mirror.playerId';
const KEY_CARDS = 'mirror.cards';
const KEY_CONSENT = 'mirror.consent';

type Ctx = {
  loaded: boolean;
  playerId: string | null;
  setPlayer: (id: string) => Promise<void>;
  consent: Consent | null; // 유효한 동의만 들어 있다 (버전이 다르면 null)
  agree: (saveCards: boolean) => Promise<void>;
  setSaveCards: (saveCards: boolean) => Promise<void>;
  withdraw: () => Promise<void>;
  cards: Card[];
  addCard: (card: Omit<Card, 'id' | 'createdAt'>) => Promise<void>;
  removeCard: (id: string) => Promise<void>;
  clearCards: () => Promise<void>;
};

const ProfileContext = createContext<Ctx | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [loaded, setLoaded] = useState(false);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [consent, setConsentState] = useState<Consent | null>(null);
  const [cards, setCards] = useState<Card[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [p, c, k] = await Promise.all([
          AsyncStorage.getItem(KEY_PLAYER),
          AsyncStorage.getItem(KEY_CARDS),
          AsyncStorage.getItem(KEY_CONSENT),
        ]);
        setPlayerId(p);
        setCards(c ? (JSON.parse(c) as Card[]) : []);
        const saved = k ? (JSON.parse(k) as Consent) : null;
        setConsentState(saved && saved.version === CONSENT_VERSION ? saved : null);
      } catch {
        // 읽기 실패 시 빈 상태로 시작 (동의도 다시 묻는다)
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  const saveCards = useCallback(async (next: Card[]) => {
    setCards(next);
    await AsyncStorage.setItem(KEY_CARDS, JSON.stringify(next));
  }, []);

  const saveConsent = useCallback(async (next: Consent | null) => {
    setConsentState(next);
    if (next) await AsyncStorage.setItem(KEY_CONSENT, JSON.stringify(next));
    else await AsyncStorage.removeItem(KEY_CONSENT);
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      loaded,
      playerId,
      consent,
      cards,
      setPlayer: async (id) => {
        setPlayerId(id);
        await AsyncStorage.setItem(KEY_PLAYER, id);
      },
      agree: (save) => saveConsent({ version: CONSENT_VERSION, saveCards: save, agreedAt: new Date().toISOString() }),
      setSaveCards: async (save) => {
        if (consent) await saveConsent({ ...consent, saveCards: save });
      },
      withdraw: () => saveConsent(null),
      addCard: async (card) => {
        const next = [{ ...card, id: String(Date.now()), createdAt: new Date().toISOString() }, ...cards];
        await saveCards(next);
      },
      removeCard: async (id) => {
        await saveCards(cards.filter((c) => c.id !== id));
      },
      clearCards: () => saveCards([]),
    }),
    [loaded, playerId, consent, cards, saveCards, saveConsent],
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile은 ProfileProvider 안에서만 쓸 수 있어요');
  return ctx;
}
