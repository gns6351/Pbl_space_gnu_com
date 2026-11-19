import { Pressable, StyleSheet, Text, View } from 'react-native';

import { C } from '@/theme/colors';
import { CrayonFrame, plain } from '@/components/crayon';
import { CRAYON, HAND } from '@/theme/fonts';

// 동의 화면과 설정 화면이 같이 쓰는 고지 내용. 바꾸면 state/profile.tsx의 CONSENT_VERSION을 올린다.
const ITEMS = [
  { label: '수집 목적', value: '대화 진행과 돌려줄 문장 만들기' },
  { label: '외부 AI 전송', value: '걱정과 대화가 Google Gemini로 전송' },
  { label: '보관 기간', value: '[보관 기간 입력]' },
  { label: '삭제 방법', value: '마무리 화면·설정에서 언제든 삭제' },
];

// 주의 카드(Caution)와 같은 모양에 하늘색 테두리. 노란색 주의 카드와 구분된다.
export function ConsentNotice() {
  return (
    <View style={[styles.card, CRAYON && plain]}>
      {CRAYON ? <CrayonFrame fill="rgba(156,203,255,0.08)" stroke={C.ice} strokeWidth={1.6} radius={14} seed={5} grainOpacity={0.06} grainTone="light" /> : null}
      <Text style={styles.title}>이야기는 이렇게 쓰여요</Text>
      {ITEMS.map((it) => (
        <View key={it.label} style={styles.row}>
          <Text style={styles.label}>{it.label}</Text>
          <Text style={styles.value}>{it.value}</Text>
        </View>
      ))}
    </View>
  );
}

export function Check({ checked, onToggle, label }: { checked: boolean; onToggle: () => void; label: string }) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      onPress={onToggle}
      style={{ minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <View style={[styles.box, checked && styles.boxOn, CRAYON && plain]}>
        {CRAYON ? <CrayonFrame fill={checked ? C.ice : undefined} stroke={checked ? C.ice : C.borderStrong} radius={5} seed={label.length} grainOpacity={0} /> : null}
        {checked ? <Text style={{ color: C.onGlass, fontSize: 14, fontWeight: '700' }}>✓</Text> : null}
      </View>
      <Text style={{ flex: 1, fontSize: 15, color: C.text }}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { padding: 14, borderRadius: 14, borderWidth: 1, borderColor: C.ice, backgroundColor: 'rgba(156,203,255,0.08)', gap: 6 },
  title: { fontSize: 17, fontFamily: HAND, color: C.ice },
  row: { flexDirection: 'row', gap: 10 },
  label: { width: 84, fontSize: 14, lineHeight: 21, fontWeight: '700', color: C.ice },
  value: { flex: 1, fontSize: 14, lineHeight: 21, color: C.text },
  box: { width: 22, height: 22, borderRadius: 5, borderWidth: 1.5, borderColor: C.borderStrong, alignItems: 'center', justifyContent: 'center' },
  boxOn: { borderColor: C.ice, backgroundColor: C.ice },
});
