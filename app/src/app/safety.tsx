import { router } from 'expo-router';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { SecondaryButton } from '@/components/buttons';
import { Screen } from '@/components/screen';
import { useSession } from '@/state/session';
import { C } from '@/theme/colors';

// 위험 발화 안내 (FR-10). 거울 연출 없이 연락처만 또렷하게. 이 세션의 역할극은 다시 이어지지 않는다.
export default function SafetyScreen() {
  const { reset } = useSession();
  const home = () => {
    reset();
    router.replace('/');
  };

  return (
    <Screen step="안내" action="닫기" onAction={home} glowAt="50% -20%" footer={<SecondaryButton label="처음 화면으로" onPress={home} />}>
      <View style={{ gap: 10, paddingTop: 12 }}>
        <Text style={styles.title}>잠시 상담을 멈출게요</Text>
        <Text style={styles.body}>
          방금 남긴 말이 마음에 걸려요. 지금 많이 힘들다면 혼자 견디지 말고 이야기를 들어 줄 수 있는 곳에 연락해 보세요.
        </Text>
      </View>
      <Pressable accessibilityRole="link" onPress={() => Linking.openURL('tel:109')} style={styles.primaryLine}>
        <Text style={{ fontSize: 16, fontWeight: '700', color: C.onGlass }}>자살예방상담전화 109</Text>
        <Text style={{ fontSize: 14, color: '#3E5366' }}>24시간 상담</Text>
      </Pressable>
      <Pressable accessibilityRole="link" onPress={() => Linking.openURL('tel:15770199')} style={styles.line}>
        <Text style={{ fontSize: 16, fontWeight: '700', color: C.text }}>정신건강위기상담 1577-0199</Text>
        <Text style={{ fontSize: 14, color: C.muted }}>[연락처 최종 확인 필요]</Text>
      </Pressable>
      <Text style={styles.note}>이번 상담은 여기서 끝나요. 같은 판의 역할극은 다시 이어지지 않아요.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: '700', color: C.text },
  body: { fontSize: 15, lineHeight: 25, color: '#C8D3DC' },
  primaryLine: { minHeight: 64, paddingVertical: 12, paddingHorizontal: 18, borderRadius: 16, backgroundColor: C.glass, justifyContent: 'center', gap: 2 },
  line: { minHeight: 64, paddingVertical: 12, paddingHorizontal: 18, borderRadius: 16, borderWidth: 1, borderColor: C.borderStrong, justifyContent: 'center', gap: 2 },
  note: { fontSize: 14, lineHeight: 21, color: C.muted },
});
