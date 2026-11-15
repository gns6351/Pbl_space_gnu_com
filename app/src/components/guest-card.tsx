import { StyleSheet, Text, View } from 'react-native';

import { CrayonFrame, plain } from '@/components/crayon';
import { C } from '@/theme/colors';
import { CRAYON, HAND } from '@/theme/fonts';

type Props = {
  name: string;
  /** 예: '20대 후반~30대 초반' */
  age?: string;
  /** 예: '디자인 회사 2년 차' */
  background?: string;
  /** 찾아온 이유 (걱정의 핵심 갈등은 유지하고 이름·배경만 바꾼 고민) */
  reason: string;
};

// 손님 설명 카드 (FR-03). 서버 연동 후 손님 생성 API 결과를 그대로 넣는다.
export function GuestCard({ name, age, background, reason }: Props) {
  const meta = [age, background].filter(Boolean).join(' · ');
  return (
    <View style={[styles.card, CRAYON && plain]}>
      {CRAYON ? <CrayonFrame fill={C.panel} stroke="#5A6470" radius={16} seed={name.length + 3} grainOpacity={0.06} grainTone="light" /> : null}
      <View style={styles.head}>
        <Text style={styles.name}>{name}</Text>
        {meta ? <Text style={styles.meta}>{meta}</Text> : null}
      </View>
      <View style={styles.divider} />
      <Text style={styles.label}>찾아온 이유</Text>
      <Text style={styles.reason}>{reason}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, borderRadius: 16, borderWidth: 1, borderColor: C.border, backgroundColor: C.panel, gap: 6 },
  head: { alignItems: 'center', gap: 2 },
  name: { fontSize: 25, fontFamily: HAND, color: C.text },
  meta: { fontSize: 14, color: C.sub },
  divider: { height: 1, backgroundColor: C.line, marginVertical: 6 },
  label: { fontSize: 14, fontWeight: '700', color: C.ice },
  reason: { fontSize: 14, lineHeight: 22, color: C.text },
});
