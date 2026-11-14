import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/buttons';
import { Mirror, mirrorPanel } from '@/components/mirror';
import { Screen } from '@/components/screen';
import { playerImage } from '@/data/players';
import { useProfile } from '@/state/profile';
import { useSession } from '@/state/session';
import { C } from '@/theme/colors';

// 05 거울 · 조언 고르기 (FR-08). 지금은 하이라이트 1개만 보여 준다. 서버 연동 후 목록 + 앞뒤 발화로 바꾼다.
export default function MirrorPickScreen() {
  const { s, set } = useSession();
  const { playerId } = useProfile();

  const go = () => {
    // TODO(서버 연동): 반환 API로 변환·점검을 거친 문장을 받는다. 점검 실패 시 null (원문만 표시).
    set({ returned: s.highlight ? `${s.highlight} 나한테도.` : null });
    router.push('/mirror-compare');
  };

  return (
    <Screen
      step="거울 1/2"
      glowAt="50% 24%"
      footer={
        <>
          <PrimaryButton label="거울에 비춰 보기" onPress={go} />
          <Text style={styles.hint}>돌아올 말을 만드는 데 최대 20초 걸려요</Text>
        </>
      }>
      <View style={{ alignItems: 'center' }}>
        <Mirror width={168} height={220} reflection={playerImage(playerId)} reflectionOpacity={0.4} style={{ justifyContent: 'flex-start', paddingTop: 34 }}>
          <Text style={[styles.mirrorText, mirrorPanel]}>어떤 말을{'\n'}비춰 볼까요?</Text>
        </Mirror>
      </View>
      <View style={{ gap: 4 }}>
        <Text style={styles.title}>손님이 돌아간 뒤, 거울 앞</Text>
        <Text style={styles.body}>오늘 손님에게 건넨 말 중 하나를 골라 보세요.</Text>
      </View>
      <View style={styles.selected}>
        <Text style={styles.ctx}>손님: [앞 발화]</Text>
        <Text style={styles.said}>"{s.highlight ?? '[하이라이트 원문]'}"</Text>
        <Text style={styles.ctx}>손님: [뒤 발화]</Text>
      </View>
      <Text style={styles.hint}>직접 쓴 말만 여기 모여요. 선택지로 고른 말은 들어오지 않아요.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  mirrorText: { fontSize: 14, lineHeight: 22, fontWeight: '500', color: C.onGlass, textAlign: 'center' },
  title: { fontSize: 21, fontWeight: '700', color: C.text, textAlign: 'center' },
  body: { fontSize: 14, color: C.muted, textAlign: 'center' },
  selected: { padding: 16, borderRadius: 16, borderWidth: 1.5, borderColor: '#CFE3F5', backgroundColor: 'rgba(234,244,255,0.10)', boxShadow: '0 0 18px rgba(170,215,255,0.28)', gap: 8 },
  ctx: { fontSize: 14, color: C.muted },
  said: { fontSize: 15, lineHeight: 23, fontWeight: '500', color: C.text },
  hint: { fontSize: 14, color: C.sub, textAlign: 'center' },
});
