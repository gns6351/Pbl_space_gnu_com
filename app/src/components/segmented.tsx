import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CrayonFrame, crayonLine, plain } from '@/components/crayon';
import { C } from '@/theme/colors';
import { CRAYON, HAND } from '@/theme/fonts';

type Props<T extends string> = { options: { key: T; label: string }[]; value: T; onChange: (v: T) => void };

// 두세 가지 방법 중 하나를 고르는 탭 (예: 직접 쓰기 / 예시에서 고르기)
export function Segmented<T extends string>({ options, value, onChange }: Props<T>) {
  return (
    <View style={[styles.wrap, CRAYON && plain]} accessibilityRole="tablist">
      {CRAYON ? <CrayonFrame fill="rgba(255,255,255,0.03)" stroke={crayonLine} strokeWidth={1.6} radius={24} seed={21} grainOpacity={0.06} grainTone="light" /> : null}
      {options.map((o, i) => {
        const on = o.key === value;
        return (
          <Pressable
            key={o.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            onPress={() => onChange(o.key)}
            style={[styles.tab, on && styles.tabOn, CRAYON && plain]}>
            {CRAYON && on ? <CrayonFrame fill={C.glass} stroke={C.onGlass} strokeWidth={1.3} radius={20} seed={i + 30} grainOpacity={0.07} /> : null}
            <Text style={[styles.label, on && styles.labelOn]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', padding: 4, borderRadius: 24, borderWidth: 1, borderColor: C.borderStrong, gap: 4 },
  tab: { flex: 1, minHeight: 44, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  tabOn: { backgroundColor: C.glass },
  label: { fontSize: 17, fontFamily: HAND, color: C.muted },
  labelOn: { color: C.onGlass },
});
