import { router } from 'expo-router';
import { useEffect } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/buttons';
import { GuestCard } from '@/components/guest-card';
import { Mirror } from '@/components/mirror';
import { Screen } from '@/components/screen';
import { guestImage, guests, pickGuest } from '@/data/guests';
import { guestIdOfPlayer } from '@/data/players';
import { useProfile } from '@/state/profile';
import { useSession } from '@/state/session';
import { C } from '@/theme/colors';

// 03 손님 맞이 (FR-03). 지금은 일러스트만 무작위로 고르고, 이름·고민은 서버 연동 후 채운다.
export default function GuestScreen() {
  const { s, set } = useSession();
  const { playerId } = useProfile();
  const mine = guestIdOfPlayer(playerId); // 내 캐릭터와 같은 손님은 나오지 않게

  useEffect(() => {
    if (!s.guestId) set({ guestId: pickGuest([mine]).id });
  }, [s.guestId, set, mine]);

  const guest = guests.find((g) => g.id === s.guestId);

  const regenerate = () => {
    if (s.regenLeft <= 0) return;
    set({ guestId: pickGuest([mine, s.guestId]).id, regenLeft: s.regenLeft - 1 });
  };

  return (
    <Screen step="손님 맞이" glowAt="50% 34%" footer={<PrimaryButton label="상담 시작하기" onPress={() => router.push('/talk')} />}>
      <View style={{ alignItems: 'center' }}>
        <Mirror width={236} height={316} style={{ justifyContent: 'flex-end' }}>
          {guest ? <Image source={guestImage(guest.id, 'worried')} style={styles.guest} resizeMode="contain" /> : null}
        </Mirror>
      </View>
      {/* TODO(서버 연동): 손님 생성 API의 이름·배경·고민으로 바꾼다 */}
      <GuestCard
        name="[손님 이름]"
        age={guest?.ageRange}
        background="[배경]"
        reason={`[걱정 "${s.worry}"의 핵심 갈등은 유지하고 이름·배경만 바꾼 손님의 고민]`}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: s.regenLeft <= 0 }}
        disabled={s.regenLeft <= 0}
        onPress={regenerate}
        style={styles.regen}>
        <Text style={[styles.regenText, s.regenLeft <= 0 && { color: C.sub }]}>
          다른 손님 맞이하기 ({s.regenLeft}회 남음)
        </Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  guest: { width: '100%', height: '92%' },
  regen: { height: 44, alignItems: 'center', justifyContent: 'center' },
  regenText: { fontSize: 14, color: C.ice },
});
