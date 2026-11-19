import { StyleSheet, Text, View, ViewStyle } from 'react-native';

import { CrayonFrame, crayonLine, plain } from '@/components/crayon';
import { C } from '@/theme/colors';
import { CRAYON, HAND } from '@/theme/fonts';

type Props = {
  from: 'guest' | 'me';
  text: string;
  /** 거울이 기억한 말 (직접 쓴 조언). 거울빛으로 칠한다 */
  highlight?: boolean;
  seed?: number;
  style?: ViewStyle;
};

// 상담 말풍선. 손님 말은 왼쪽, 내 말은 오른쪽. 손님 배웅 화면에서도 쓴다.
export function Bubble({ from, text, highlight, seed = 1, style }: Props) {
  const guest = from === 'guest';
  const fill = highlight ? '#E3F0FC' : guest ? '#262D35' : '#3A4552';
  const stroke = highlight ? '#3E5366' : guest ? crayonLine : '#9AA6B4';
  return (
    <View
      style={[
        styles.box,
        guest ? styles.guest : styles.me,
        highlight && styles.highlight,
        CRAYON && plain,
        CRAYON && highlight && { boxShadow: '0 0 22px rgba(170,215,255,0.5)' },
        style,
      ]}>
      {CRAYON ? (
        <CrayonFrame
          fill={fill}
          stroke={stroke}
          strokeWidth={1.7}
          radius={18}
          seed={seed}
          grainOpacity={highlight ? 0.08 : 0.1}
          grainTone={highlight ? 'dark' : 'light'}
        />
      ) : null}
      <Text style={[styles.text, highlight && styles.highlightText]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { maxWidth: 280, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 18 },
  guest: { alignSelf: 'flex-start', borderTopLeftRadius: 4, backgroundColor: '#262D35', borderWidth: 1, borderColor: C.border },
  me: { alignSelf: 'flex-end', borderTopRightRadius: 4, backgroundColor: '#3A4552' },
  highlight: { backgroundColor: '#E3F0FC', boxShadow: '0 0 22px rgba(170,215,255,0.5)' },
  text: { color: C.text, fontSize: 15, lineHeight: 23 },
  highlightText: { color: C.onGlass, fontFamily: HAND, fontSize: 18, lineHeight: 24 },
});
