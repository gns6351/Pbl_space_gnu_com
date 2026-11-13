import { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

import { glow } from '@/theme/colors';

type Props = {
  width: number;
  height: number;
  children?: ReactNode;
  style?: ViewStyle;
};

// 하얗게 빛나는 타원 거울. 안쪽은 밝은 유리, 바깥으로 푸른빛이 번진다.
export function Mirror({ width, height, children, style }: Props) {
  return (
    <View style={[styles.mirror, { width, height, borderRadius: Math.max(width, height) }, style]}>
      {children}
      {/* 반짝임 점 */}
      <View pointerEvents="none" style={[styles.sparkle, { top: height * 0.15, left: width * 0.24, width: 4, height: 4 }]} />
      <View pointerEvents="none" style={[styles.sparkle, { top: height * 0.78, left: width * 0.66, width: 3, height: 3 }]} />
      <View pointerEvents="none" style={[styles.sparkle, { top: height * 0.3, left: width * 0.78, width: 2, height: 2 }]} />
    </View>
  );
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
  sparkle: {
    position: 'absolute',
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    boxShadow: '0 0 6px #FFFFFF',
  },
});
