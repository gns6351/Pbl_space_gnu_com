import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { api, errorMessage } from '@/api';
import { PrimaryButton } from '@/components/buttons';
import { GuestCard } from '@/components/guest-card';
import { Mirror } from '@/components/mirror';
import { RetryCard } from '@/components/retry';
import { Screen } from '@/components/screen';
import { Waiting } from '@/components/waiting';
import { guestImage, guests, pickGuest } from '@/data/guests';
import { guestIdOfPlayer } from '@/data/players';
import { useProfile } from '@/state/profile';
import { useSession } from '@/state/session';
import { C } from '@/theme/colors';

type Status = 'loading' | 'ready' | 'error';

// 03 손님 맞이 (FR-03). 일러스트는 앱에서 고르고, 이름·배경·고민은 손님 생성 API가 만든다.
export default function GuestScreen() {
  const { s, set, reset } = useSession();
  const { playerId } = useProfile();
  const mine = guestIdOfPlayer(playerId); // 내 캐릭터와 같은 손님은 나오지 않게
  const [status, setStatus] = useState<Status>(s.guest ? 'ready' : 'loading');
  const [error, setError] = useState('');
  const started = useRef(false);

  // 손님 한 명을 맞이한다. exclude: 이번에 나오면 안 되는 일러스트
  const invite = useCallback(
    async (exclude: (string | null)[]) => {
      setStatus('loading');
      const look = pickGuest([mine, ...exclude]);
      try {
        const r = await api.createGuest(s.worry, { ageRange: look.ageRange });
        set({ guestId: look.id, sessionId: r.sessionId, guest: r.guest, firstTurn: r.first });
        setStatus('ready');
      } catch (e) {
        setError(errorMessage(e));
        setStatus('error');
      }
    },
    [mine, s.worry, set],
  );

  useEffect(() => {
    if (started.current || s.guest) return;
    started.current = true;
    invite([]);
  }, [invite, s.guest]);

  const look = guests.find((g) => g.id === s.guestId);
  const ready = status === 'ready' && s.guest;

  const regenerate = () => {
    if (s.regenLeft <= 0 || status === 'loading') return;
    set({ regenLeft: s.regenLeft - 1 });
    invite([s.guestId]);
  };

  const home = () => {
    reset();
    router.replace('/');
  };

  return (
    <Screen
      step="손님 맞이"
      glowAt="50% 34%"
      footer={status === 'error' ? undefined : <PrimaryButton label="상담 시작하기" onPress={() => router.push('/talk')} disabled={!ready} />}>
      <View style={{ alignItems: 'center' }}>
        <Mirror width={236} height={316} style={{ justifyContent: 'flex-end' }}>
          {ready && look ? <Image source={guestImage(look.id, 'worried')} style={styles.guest} resizeMode="contain" /> : null}
        </Mirror>
      </View>

      {status === 'loading' ? <Waiting text="손님이 상담소로 오고 있어요" /> : null}

      {status === 'error' ? (
        <RetryCard title="손님을 모시지 못했어요" message={error} onRetry={() => invite([])} onQuit={home} />
      ) : null}

      {ready && s.guest ? (
        <>
          <GuestCard name={s.guest.name} age={s.guest.age} background={s.guest.background} reason={s.guest.reason} />
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: s.regenLeft <= 0 }}
            disabled={s.regenLeft <= 0}
            onPress={regenerate}
            style={styles.regen}>
            <Text style={[styles.regenText, s.regenLeft <= 0 && { color: C.sub }]}>다른 손님 맞이하기 ({s.regenLeft}회 남음)</Text>
          </Pressable>
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  guest: { width: '100%', height: '92%' },
  regen: { height: 44, alignItems: 'center', justifyContent: 'center' },
  regenText: { fontSize: 14, color: C.ice },
});
