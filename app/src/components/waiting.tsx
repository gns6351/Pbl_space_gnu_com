import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { CrayonFrame, crayonLine, plain } from '@/components/crayon';
import { C } from '@/theme/colors';
import { CRAYON, HAND } from '@/theme/fonts';

// 차례로 깜빡이는 점 세 개. 진행 정도를 숫자로 보여 주지 않는다.
export function Dots({ color = C.muted, size = 7 }: { color?: string; size?: number }) {
  const vals = useRef([0, 1, 2].map(() => new Animated.Value(0.25))).current;
  useEffect(() => {
    const loops = vals.map((v, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 180),
          Animated.timing(v, { toValue: 1, duration: 360, useNativeDriver: true }),
          Animated.timing(v, { toValue: 0.25, duration: 360, useNativeDriver: true }),
          Animated.delay((2 - i) * 180),
        ]),
      ),
    );
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, [vals]);
  return (
    <View style={{ flexDirection: 'row', gap: size * 0.8, alignItems: 'center' }}>
      {vals.map((v, i) => (
        <Animated.View key={i} style={{ width: size, height: size, borderRadius: size, backgroundColor: color, opacity: v }} />
      ))}
    </View>
  );
}

// 기다리는 동안 보여 주는 한 줄 안내 + 점
export function Waiting({ text }: { text: string }) {
  return (
    <View style={styles.waiting} accessibilityRole="progressbar" accessibilityLabel={text} accessibilityLiveRegion="polite">
      <Dots color={C.ice} />
      <Text style={styles.waitingText}>{text}</Text>
    </View>
  );
}

// 손님이 대답을 쓰는 중일 때 대화 맨 아래에 보이는 말풍선
export function TypingBubble() {
  return (
    <View style={[styles.bubble, CRAYON && plain]} accessibilityLabel="손님이 대답하는 중" accessibilityLiveRegion="polite">
      {CRAYON ? <CrayonFrame fill="#262D35" stroke={crayonLine} strokeWidth={1.7} radius={18} seed={42} grainOpacity={0.1} grainTone="light" /> : null}
      <Dots />
    </View>
  );
}

const styles = StyleSheet.create({
  waiting: { alignItems: 'center', gap: 10, paddingVertical: 8 },
  waitingText: { fontSize: 17, fontFamily: HAND, color: C.muted, textAlign: 'center' },
  bubble: {
    alignSelf: 'flex-start',
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 18,
    borderTopLeftRadius: 4,
    backgroundColor: '#262D35',
    borderWidth: 1,
    borderColor: C.border,
  },
});
