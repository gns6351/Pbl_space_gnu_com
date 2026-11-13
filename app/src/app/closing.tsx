import { router } from 'expo-router';
import { Image, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton, SecondaryButton } from '@/components/buttons';
import { Mirror } from '@/components/mirror';
import { Screen } from '@/components/screen';
import { guestImage } from '@/data/guests';
import { useSession } from '@/state/session';
import { C } from '@/theme/colors';

const LABEL = { 수용: '받아들이기', 수정: '고쳐서 받기', 보류: '나중에 생각하기', 거부: '지금은 아니에요' } as const;

// 07 마무리 (FR-07, FR-11)
export default function ClosingScreen() {
  const { s, reset } = useSession();
  const hasCard = !!s.highlight;

  const restart = () => {
    reset();
    router.replace('/');
  };

  const remove = () => {
    // TODO(서버 연동): DELETE /game/sessions/:id 로 세션과 카드를 지운다.
    restart();
  };

  return (
    <Screen
      step="마무리"
      glowAt="50% 36%"
      footer={
        <>
          <PrimaryButton label="처음으로" onPress={restart} />
          <SecondaryButton label="이 상담 기록 삭제하기" tone="danger" onPress={remove} />
        </>
      }>
      <View style={{ gap: 6 }}>
        <Text style={styles.title}>오늘의 상담을 마쳤어요</Text>
        <Text style={styles.body}>[손님 이름]은 고개를 끄덕이며 상담소를 나섰어요.</Text>
      </View>
      <View style={{ alignItems: 'center' }}>
        {hasCard ? (
          <Mirror width={240} height={300} style={{ paddingHorizontal: 34, gap: 12 }}>
            <Text style={styles.mirrorLabel}>오늘 거울이 돌려준 말</Text>
            <Text style={styles.mirrorText}>{s.returned}</Text>
            {s.decision ? <Text style={styles.mirrorLabel}>내 선택 · {LABEL[s.decision]}</Text> : null}
          </Mirror>
        ) : (
          <Mirror width={200} height={260} style={{ justifyContent: 'flex-end' }}>
            {s.guestId ? <Image source={guestImage(s.guestId, 'relieved')} style={{ width: '100%', height: '92%' }} resizeMode="contain" /> : null}
          </Mirror>
        )}
      </View>
      {!hasCard ? <Text style={[styles.body, { textAlign: 'center' }]}>오늘은 손님 이야기를 들어 준 날이에요.</Text> : null}
      <Text style={styles.note}>{s.saveConsent ? '저장에 동의해서 이 카드만 보관돼요.' : '저장에 동의하지 않아 앱을 닫으면 사라져요.'}</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: '700', color: C.text, textAlign: 'center' },
  body: { fontSize: 14, lineHeight: 22, color: C.muted, textAlign: 'center' },
  mirrorLabel: { fontSize: 11, fontWeight: '700', color: '#3E5366', textAlign: 'center' },
  mirrorText: { fontSize: 16, lineHeight: 26, fontWeight: '500', color: C.onGlass, textAlign: 'center' },
  note: { fontSize: 12, color: C.sub, textAlign: 'center' },
});
