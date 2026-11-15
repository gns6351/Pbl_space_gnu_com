import { StyleSheet, Text, View } from 'react-native';

import { CrayonFrame, plain } from '@/components/crayon';
import { C } from '@/theme/colors';
import { CRAYON, HAND } from '@/theme/fonts';

type Props = { title?: string; items: string[] };

// 꼭 알아 둘 주의 사항 묶음. 따뜻한 색 테두리로 고지 카드와 구분한다.
export function Caution({ title = '꼭 알아 두세요', items }: Props) {
  return (
    <View style={[styles.box, CRAYON && plain]} accessibilityRole="summary">
      {CRAYON ? <CrayonFrame fill="rgba(246,196,106,0.08)" stroke={C.warm} strokeWidth={1.6} radius={14} seed={13} grainOpacity={0.06} grainTone="light" /> : null}
      <Text style={styles.title}>{title}</Text>
      {items.map((it) => (
        <View key={it} style={styles.row}>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.item}>{it}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { padding: 14, borderRadius: 14, borderWidth: 1, borderColor: C.warm, backgroundColor: 'rgba(246,196,106,0.08)', gap: 4 },
  title: { fontSize: 17, fontFamily: HAND, color: C.warm },
  row: { flexDirection: 'row', gap: 6 },
  dot: { fontSize: 14, lineHeight: 21, color: C.warm },
  item: { flex: 1, fontSize: 14, lineHeight: 21, color: C.text },
});
