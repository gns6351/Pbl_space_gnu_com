import { Redirect, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { errorMessage, game } from '@/api/game';
import { PrimaryButton } from '@/components/buttons';
import { GuestCard } from '@/components/guest-card';
import { Mirror } from '@/components/mirror';
import { Screen } from '@/components/screen';
import { Waiting } from '@/components/waiting';
import { guestImage, pickGuest } from '@/data/guests';
import { guestIdOfPlayer } from '@/data/players';
import { useProfile } from '@/state/profile';
import { useSession } from '@/state/session';
import { C } from '@/theme/colors';

// 03 손님 맞이 (FR-03). 손님 정보는 서버가 만들고, 그림은 앱이 고른다.
export default function GuestScreen() {
  const { s, set } = useSession();
  const { playerId } = useProfile();
  const mine = guestIdOfPlayer(playerId); // 내 캐릭터와 같은 손님은 나오지 않게
  const [busy, setBusy] = useState<'reroll' | 'start' | null>(null);
  const [error, setError] = useState('');

  // 손님 그림을 아직 안 골랐으면 하나 고른다
  useEffect(() => {
    if (!s.guestId) set({ guestId: pickGuest([mine]).id});
  }, [s.guestId, set, mine]);

  const guest = s.game?.guest;
  if(!s.game || !guest) return <Redirect href="/" />;
  const id=s.game.id;

  // 다른 손님 맞이하기 (서버가 1회만 허락한다)
  const reroll = async () => {
    if (busy) return;
    setBusy('reroll');
    setError('');

    try{
      const v = await game.reroll(id);
      set({ game: v, guestId: pickGuest([mine, s.guestId]).id });
    } catch (e){
      setError(errorMessage(e));
    } finally {
      setBusy(null);
    }
  };

  // 상담 시작 → 서버가 손님의 첫 대사를 준다
  const start = async () => {
    if (busy) return;
    setBusy('start');
    setError('');
    try {
      const v = await game.start(id);
      set({ game: v});
      router.push('/talk');
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(null);
    }
  };

  return (
    <Screen
      step="손님 맞이"
      glowAt="50% 34%"
      footer={
        busy === 'start' ? (
          <Waiting text="손님이 자리에 앉고 있어요" />
        ) : (
          <>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <PrimaryButton label={error ? '다시 시도하기' : '상담 시작하기'} onPress={start} disabled={busy != null} />
          </>
        )
      }>
      <View style={{ alignItems: 'center' }}>
        <Mirror width={236} height={316} style={{ justifyContent: 'flex-end' }}>
          {s.guestId && busy !== 'reroll' ? (
            <Image source={guestImage(s.guestId, 'worried')} style={styles.guest} resizeMode="contain" />
          ) : null}
        </Mirror>
      </View>

      {busy === 'reroll' ? (
        <Waiting text="다른 손님이 오고 있어요" />
      ) : (
        <GuestCard name={guest.name} age={guest.age} background={guest.role} reason={`${guest.background} ${guest.situation}`} />
      )}

      {s.game.canReroll ? (
        <Pressable accessibilityRole="button" disabled={busy !== null} onPress={reroll} style={styles.regen}>
          <Text style={styles.regenText}>다른 손님 맞이하기 (1회)</Text>
        </Pressable>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  guest: { width: '100%', height: '92%' },
  regen: { height: 44, alignItems: 'center', justifyContent: 'center' },
  regenText: { fontSize: 14, color: C.ice },
  error: { fontSize: 14, lineHeight: 21, color: C.danger, textAlign: 'center'},
});
