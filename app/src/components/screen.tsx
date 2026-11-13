import { router } from 'expo-router';
import { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { C } from '@/theme/colors';

type Props = {
  step: string;
  action?: string; // 오른쪽 위 버튼 글자 (기본: 그만하기)
  onAction?: () => void;
  footer?: ReactNode;
  children: ReactNode;
  glowAt?: string; // 배경이 밝아지는 위치, 예: '50% 30%'
};

// 모든 화면 공통 틀: 상단 바 + 내용 + 하단 버튼 영역 (FR-11: 모든 화면에 그만하기)
export function Screen({ step, action = '그만하기', onAction, footer, children, glowAt = '50% 28%' }: Props) {
  const quit = onAction ?? (() => router.replace('/'));
  return (
    <SafeAreaView
      style={[styles.root, { backgroundImage: `radial-gradient(ellipse 90% 45% at ${glowAt}, ${C.bgGlow} 0%, ${C.bg} 72%)` }]}>
      <View style={styles.header}>
        <Text style={styles.step}>{step}</Text>
        <Pressable accessibilityRole="button" onPress={quit} style={styles.pill} hitSlop={4}>
          <Text style={styles.pillText}>{action}</Text>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {children}
      </ScrollView>
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  header: {
    height: 56,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: C.line,
  },
  step: { fontSize: 14, fontWeight: '500', color: C.muted },
  pill: {
    height: 44,
    paddingHorizontal: 14,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: C.borderStrong,
    justifyContent: 'center',
  },
  pillText: { fontSize: 14, color: C.text },
  content: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 16, gap: 18 },
  footer: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 24, gap: 8 },
});
