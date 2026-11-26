import { router } from 'expo-router';
import { useEffect } from 'react';
import { BackHandler, Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { SecondaryButton } from '@/components/buttons';
import { Screen } from '@/components/screen';
import { useSession } from '@/state/session';
import { C } from '@/theme/colors';
import { CRAYON, HAND } from '@/theme/fonts';
import { CrayonFrame, plain } from '@/components/crayon';

// 위험 발화 안내 (FR-10). 거울 연출 없이 연락처만 또렷하게. 이 세션의 역할극은 다시 이어지지 않는다.
export default function SafetyScreen() {
  const { s, reset } = useSession();
  // 서버가 위험을 감지하면 보내 주는 공식 안내 (ai-server/content/game.json의 help)
  const help = s.game?.help;
  const home = () => {
    reset();
    // 쌓인 화면(손님 맞이 등)을 모두 닫고 처음 화면으로
    if (router.canDismiss()) router.dismissAll();
    router.replace('/');
  };

  // 안드로이드 뒤로 가기로 상담에 돌아가지 못하게, 뒤로 가기는 처음 화면으로 보낸다
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      home();
      return true;
    });
    return () => sub.remove();
  });

  return (
    <Screen step="안내" action="닫기" onAction={home} glowAt="50% -20%" footer={<SecondaryButton label="처음 화면으로" onPress={home} />}>
      <View style={{ gap: 10, paddingTop: 12 }}>
        <Text style={styles.title}>{help?.title ?? '잠시 상담을 멈출게요'}</Text>
        <Text style={styles.body}>
          {help?.lines[0] ?? '힘든 마음이 느껴져요. 혼자 견디지 않아도 괜찮아요.'} 이야기를 들어 줄 수 있는 곳에 연락해 보세요.
        </Text>
      </View>
      <Pressable accessibilityRole="link" onPress={() => Linking.openURL('tel:109')} style={[styles.primaryLine, CRAYON && plain]}>
        {CRAYON ? <CrayonFrame fill={C.glass} stroke={C.onGlass} radius={16} seed={2} grainOpacity={0.06} /> : null}
        <Text style={{ fontSize: 16, fontWeight: '700', color: C.onGlass }}>자살예방상담전화 109</Text>
        <Text style={{ fontSize: 14, color: '#3E5366' }}>24시간 상담</Text>
      </Pressable>
      <Pressable accessibilityRole="link" onPress={() => Linking.openURL('tel:15770199')} style={[styles.line, CRAYON && plain]}>
        {CRAYON ? <CrayonFrame fill={undefined} stroke={C.borderStrong} radius={16} seed={4} grainOpacity={0} /> : null}
        <Text style={{ fontSize: 16, fontWeight: '700', color: C.text }}>정신건강위기상담전화 1577-0199</Text>
        <Text style={{ fontSize: 14, color: C.muted }}>24시간 상담</Text>
      </Pressable>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {[
          { no: '112', label: '경찰' },
          { no: '119', label: '구급' },
        ].map((e) => (
          <Pressable key={e.no} accessibilityRole="link" onPress={() => Linking.openURL(`tel:${e.no}`)} style={[styles.line, styles.small, CRAYON && plain]}>
            {CRAYON ? <CrayonFrame stroke={C.borderStrong} radius={16} seed={Number(e.no)} grainOpacity={0} /> : null}
            <Text style={{ fontSize: 16, fontWeight: '700', color: C.text }}>{e.no}</Text>
            <Text style={{ fontSize: 14, color: C.muted }}>긴급 상황 · {e.label}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.note}>이번 상담은 여기서 끝나요. 같은 판의 역할극은 다시 이어지지 않아요.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 25, fontFamily: HAND, fontWeight: 'normal', color: C.text },
  body: { fontSize: 15, lineHeight: 25, color: '#C8D3DC' },
  primaryLine: { minHeight: 64, paddingVertical: 12, paddingHorizontal: 18, borderRadius: 16, backgroundColor: C.glass, justifyContent: 'center', gap: 2 },
  line: { minHeight: 64, paddingVertical: 12, paddingHorizontal: 18, borderRadius: 16, borderWidth: 1, borderColor: C.borderStrong, justifyContent: 'center', gap: 2 },
  small: { flex: 1, minHeight: 56 },
  note: { fontSize: 14, lineHeight: 21, color: C.muted },
});
