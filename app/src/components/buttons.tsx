import { Pressable, StyleSheet, Text } from 'react-native';

import { CrayonFrame, crayonLine } from '@/components/crayon';
import { C, glow } from '@/theme/colors';
import { CRAYON, HAND } from '@/theme/fonts';

type Props = { label: string; onPress?: () => void; disabled?: boolean; tone?: 'default' | 'danger' };

// 버튼 글자로 시드를 만들어, 같은 화면의 버튼들이 서로 다른 손그림 선을 갖게 한다
const seedOf = (s: string) => [...s].reduce((a, ch) => a + ch.charCodeAt(0), 0) % 997;

// 거울빛 주요 버튼
export function PrimaryButton({ label, onPress, disabled }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [CRAYON ? styles.primaryCrayon : styles.primary, disabled && styles.disabled, pressed && { opacity: 0.85 }]}>
      {CRAYON ? <CrayonFrame fill={C.glass} stroke={C.onGlass} strokeWidth={1.4} radius={28} seed={seedOf(label)} grainOpacity={0.07} /> : null}
      <Text style={[styles.primaryText, CRAYON && styles.hand]}>{label}</Text>
    </Pressable>
  );
}

// 테두리만 있는 보조 버튼
export function SecondaryButton({ label, onPress, disabled, tone = 'default' }: Props) {
  const color = tone === 'danger' ? C.danger : C.text;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [CRAYON ? styles.secondaryCrayon : styles.secondary, disabled && styles.disabled, pressed && { opacity: 0.7 }]}>
      {CRAYON ? <CrayonFrame fill="rgba(255,255,255,0.04)" stroke={tone === 'danger' ? C.danger : crayonLine} strokeWidth={1.8} radius={24} seed={seedOf(label)} grainOpacity={0.08} grainTone="light" /> : null}
      <Text style={[styles.secondaryText, { color }, CRAYON && styles.handSmall]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  primary: {
    height: 56,
    borderRadius: 28,
    backgroundColor: C.glass,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: glow.soft,
  },
  primaryCrayon: {
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: glow.soft,
  },
  primaryText: { fontSize: 16, fontWeight: '700', color: C.onGlass },
  secondary: {
    minHeight: 48,
    paddingHorizontal: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: C.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryCrayon: { minHeight: 48, paddingHorizontal: 12, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  secondaryText: { fontSize: 14, color: C.text },
  // 손글씨 글꼴은 fontWeight 대신 글꼴 이름으로 굵기를 고른다
  hand: { fontFamily: HAND, fontWeight: 'normal', fontSize: 19 },
  handSmall: { fontFamily: HAND, fontWeight: 'normal', fontSize: 17 },
  disabled: { opacity: 0.4, boxShadow: 'none' },
});
