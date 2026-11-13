import { Pressable, StyleSheet, Text } from 'react-native';

import { C, glow } from '@/theme/colors';

type Props = { label: string; onPress?: () => void; disabled?: boolean; tone?: 'default' | 'danger' };

// 거울빛 주요 버튼
export function PrimaryButton({ label, onPress, disabled }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.primary, disabled && styles.disabled, pressed && { opacity: 0.85 }]}>
      <Text style={styles.primaryText}>{label}</Text>
    </Pressable>
  );
}

// 테두리만 있는 보조 버튼
export function SecondaryButton({ label, onPress, disabled, tone = 'default' }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.secondary, disabled && styles.disabled, pressed && { opacity: 0.7 }]}>
      <Text style={[styles.secondaryText, tone === 'danger' && { color: C.danger }]}>{label}</Text>
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
  secondaryText: { fontSize: 14, color: C.text },
  disabled: { opacity: 0.4, boxShadow: 'none' },
});
