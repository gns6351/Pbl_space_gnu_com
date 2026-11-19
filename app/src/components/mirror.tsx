import { ReactNode } from 'react';
import { Image, ImageSourcePropType, StyleSheet, TextStyle, View, ViewStyle } from 'react-native';

import { glow } from '@/theme/colors';
import { HAND } from '@/theme/fonts';

type Props = {
  width: number;
  height: number;
  children?: ReactNode;
  style?: ViewStyle;
  /** 거울에 비치는 캐릭터 이미지 */
  reflection?: ImageSourcePropType;
  /** 1이면 또렷하게, 0.3 정도면 글자 뒤로 은은하게 */
  reflectionOpacity?: number;
};

// 하얗게 빛나는 타원 거울. 안쪽은 밝은 유리, 바깥으로 푸른빛이 번진다.
export function Mirror({ width, height, children, style, reflection, reflectionOpacity = 1 }: Props) {
  return (
    <View style={[styles.mirror, { width, height, borderRadius: Math.max(width, height) }, style]}>
      {reflection ? (
        // 거울 전체를 덮는 틀 안에서 가운데 정렬한다. 거울에 padding이 있어도 치우치지 않게.
        <View pointerEvents="none" style={styles.reflectionFrame}>
          <Image
            source={reflection}
            resizeMode="contain"
            accessibilityIgnoresInvertColors
            style={[styles.reflection, { opacity: reflectionOpacity }]}
          />
        </View>
      ) : null}
      {children}
      {/* 반짝임 점 */}
      <View pointerEvents="none" style={[styles.sparkle, { top: height * 0.15, left: width * 0.24, width: 4, height: 4 }]} />
      <View pointerEvents="none" style={[styles.sparkle, { top: height * 0.78, left: width * 0.66, width: 3, height: 3 }]} />
      <View pointerEvents="none" style={[styles.sparkle, { top: height * 0.3, left: width * 0.78, width: 2, height: 2 }]} />
    </View>
  );
}

// 거울 속 글자를 받쳐 주는 반투명 유리판
export const mirrorPanel: ViewStyle = {
  paddingVertical: 10,
  paddingHorizontal: 12,
  borderRadius: 14,
  backgroundColor: 'rgba(246,251,255,0.9)',
};

// 거울 속 문장 길이에 맞춰 거울 크기·비침 세기·글자를 정한다.
// 길수록 거울을 키우고 내 모습은 흐리게, 아주 길면 읽기 쉬운 기본 글꼴로 바꾼다.
export function mirrorFit(length: number): { width: number; height: number; reflectionOpacity: number; text: TextStyle } {
  if (length <= 40) return { width: 248, height: 300, reflectionOpacity: 0.32, text: { fontFamily: HAND, fontSize: 19, lineHeight: 28 } };
  if (length <= 90) return { width: 290, height: 360, reflectionOpacity: 0.24, text: { fontFamily: HAND, fontSize: 17, lineHeight: 25 } };
  return { width: 310, height: 420, reflectionOpacity: 0.18, text: { fontSize: 15, lineHeight: 23, fontWeight: '500' } };
}

const styles = StyleSheet.create({
  mirror: {
    borderWidth: 3,
    borderColor: '#F2F8FF',
    backgroundColor: '#DCEBF8', // 그라데이션을 못 그리는 환경용
    backgroundImage: 'radial-gradient(ellipse at 50% 38%, #F6FBFF 0%, #D3E6F7 48%, #92ADC4 100%)',
    boxShadow: glow.mirror,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  reflectionFrame: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'flex-end' },
  reflection: { width: '100%', height: '90%' },
  sparkle: {
    position: 'absolute',
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    boxShadow: '0 0 6px #FFFFFF',
  },
});
