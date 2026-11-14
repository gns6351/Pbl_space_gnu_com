import { Redirect, router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton, SecondaryButton } from '@/components/buttons';
import { Mirror } from '@/components/mirror';
import { Screen } from '@/components/screen';
import { playerImage } from '@/data/players';
import { useProfile } from '@/state/profile';
import { useSession } from '@/state/session';
import { C } from '@/theme/colors';

// 홈. 처음 실행이면 캐릭터 고르기로, 동의가 저장돼 있으면 바로 걱정 입력으로 간다.
export default function HomeScreen() {
  const { reset, set } = useSession();
  const { loaded, playerId, consent, cards } = useProfile();

  if (loaded && !playerId) return <Redirect href="/character" />;

  const start = () => {
    reset();
    if (consent) {
      set({ saveConsent: consent.saveCards });
      router.push('/worry');
    } else {
      router.push('/consent');
    }
  };

  return (
    <Screen
      step="거울상담소"
      action="설정"
      onAction={() => router.push('/settings')}
      footer={
        <>
          <PrimaryButton label="상담 시작하기" onPress={start} disabled={!loaded} />
          <SecondaryButton label={`카드 보관함${cards.length ? ` (${cards.length})` : ''}`} onPress={() => router.push('/archive')} />
        </>
      }>
      <View style={{ alignItems: 'center', paddingTop: 24, gap: 4 }}>
        <Mirror width={200} height={266} reflection={playerImage(playerId)} />
        <Pressable accessibilityRole="button" onPress={() => router.push('/character')} style={styles.change}>
          <Text style={styles.changeText}>내 캐릭터 바꾸기</Text>
        </Pressable>
      </View>
      <View style={{ gap: 6 }}>
        <Text style={styles.title}>거울상담소에 오신 걸 환영해요</Text>
        <Text style={styles.body}>오늘은 어떤 손님이 찾아올까요?</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  change: { minHeight: 44, paddingHorizontal: 12, justifyContent: 'center' },
  changeText: { fontSize: 14, color: C.ice },
  title: { fontSize: 22, fontWeight: '700', color: C.text, textAlign: 'center' },
  body: { fontSize: 15, lineHeight: 24, color: C.muted, textAlign: 'center' },
});
