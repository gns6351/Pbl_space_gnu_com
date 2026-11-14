import { Pressable, StyleSheet, Text, View } from 'react-native';

import { C } from '@/theme/colors';

// 동의 화면과 설정 화면이 같이 쓰는 고지 내용. 바꾸면 state/profile.tsx의 CONSENT_VERSION을 올린다.
const ITEMS = [
  { label: '수집 목적', value: '대화 진행과 돌려줄 문장 만들기' },
  { label: '외부 AI 전송', value: '걱정과 대화가 Google Gemini로 전송' },
  { label: '보관 기간', value: '[보관 기간 입력]' },
  { label: '삭제 방법', value: '마무리 화면·설정에서 언제든 삭제' },
];

export function ConsentNotice() {
  return (
    <View style={styles.card}>
      {ITEMS.map((it) => (
        <View key={it.label} style={{ width: '47%', gap: 2 }}>
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
      <View style={[styles.box, checked && styles.boxOn]}>
        {checked ? <Text style={{ color: C.onGlass, fontSize: 14, fontWeight: '700' }}>✓</Text> : null}
      </View>
      <Text style={{ flex: 1, fontSize: 15, color: C.text }}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, padding: 16, borderRadius: 14, borderWidth: 1, borderColor: C.border, backgroundColor: C.panel },
  label: { fontSize: 14, fontWeight: '700', color: C.ice },
  value: { fontSize: 14, lineHeight: 21, color: C.text },
  box: { width: 22, height: 22, borderRadius: 5, borderWidth: 1.5, borderColor: C.borderStrong, alignItems: 'center', justifyContent: 'center' },
  boxOn: { borderColor: C.ice, backgroundColor: C.ice },
});
