import { useMemo, useState } from 'react';
import { Image, LayoutChangeEvent, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const grain = require('../../assets/textures/grain.png');
// 어두운 바탕 위에서는 검은 결이 안 보여서 밝은 결을 쓴다
const grainLight = require('../../assets/textures/grain-light.png');

// 어두운 화면에서 손그림 선이 묻히지 않는 밝은 선 색
export const crayonLine = '#8C97A3';

type Props = {
  /** 안쪽 칠 색. 없으면 투명 */
  fill?: string;
  /** 테두리 색. 없으면 테두리 없음 */
  stroke?: string;
  strokeWidth?: number;
  radius?: number;
  /** 같은 화면의 버튼끼리 선 모양이 똑같지 않게 하는 값 */
  seed?: number;
  /** 크레파스 결 세기 (0~1). 약하게: 0.06 정도 */
  grainOpacity?: number;
  /** 'light'면 밝은 결 (어두운 칠 위), 'dark'면 검은 결 (밝은 칠 위) */
  grainTone?: 'light' | 'dark';
};

// 부모를 꽉 채우는 손그림 테두리 + 칠 + 크레파스 결.
// 부모 View에 position:'relative'가 있어야 하고, 글자는 이 위에 일반 Text로 올린다.
export function CrayonFrame({ fill, stroke, strokeWidth = 1.6, radius = 24, seed = 1, grainOpacity = 0.06, grainTone = 'dark' }: Props) {
  const [size, setSize] = useState({ w: 0, h: 0 });
  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width !== size.w || height !== size.h) setSize({ w: width, h: height });
  };

  const paths = useMemo(() => {
    if (!size.w || !size.h) return null;
    const pad = strokeWidth + 1;
    return {
      fill: wobblyRoundRect(size.w, size.h, radius, pad, seed, 0.7),
      line1: wobblyRoundRect(size.w, size.h, radius, pad, seed + 11, 0.9),
      line2: wobblyRoundRect(size.w, size.h, radius, pad + 0.8, seed + 23, 1.2),
    };
  }, [size.w, size.h, radius, strokeWidth, seed]);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill} onLayout={onLayout}>
      {paths ? (
        <Svg width={size.w} height={size.h}>
          {fill ? <Path d={paths.fill} fill={fill} /> : null}
          {stroke ? <Path d={paths.line1} stroke={stroke} strokeWidth={strokeWidth} fill="none" strokeLinejoin="round" opacity={0.9} /> : null}
          {/* 크레파스로 한 번 더 덧그린 듯한 얇은 두 번째 선 */}
          {stroke ? <Path d={paths.line2} stroke={stroke} strokeWidth={strokeWidth * 0.6} fill="none" strokeLinejoin="round" opacity={0.35} /> : null}
        </Svg>
      ) : null}
      {grainOpacity > 0 ? (
        <View style={[StyleSheet.absoluteFill, { borderRadius: radius, overflow: 'hidden' }]}>
          <Image source={grainTone === 'light' ? grainLight : grain} resizeMode="repeat" style={{ width: '100%', height: '100%', opacity: grainOpacity }} />
        </View>
      ) : null}
    </View>
  );
}

// 둥근 사각형 둘레를 일정 간격으로 찍고, 점마다 살짝 흔들어 손으로 그린 선처럼 만든다.
function wobblyRoundRect(w: number, h: number, r: number, pad: number, seed: number, jitter: number) {
  const x0 = pad, y0 = pad, x1 = w - pad, y1 = h - pad;
  const rr = Math.min(r, (x1 - x0) / 2, (y1 - y0) / 2);
  const pts: [number, number][] = [];
  const step = 10;
  const line = (ax: number, ay: number, bx: number, by: number) => {
    const n = Math.max(1, Math.round(Math.hypot(bx - ax, by - ay) / step));
    for (let i = 0; i < n; i++) pts.push([ax + ((bx - ax) * i) / n, ay + ((by - ay) * i) / n]);
  };
  const arc = (cx: number, cy: number, a0: number, a1: number) => {
    const n = Math.max(2, Math.round((rr * Math.abs(a1 - a0)) / step));
    for (let i = 0; i < n; i++) {
      const a = a0 + ((a1 - a0) * i) / n;
      pts.push([cx + rr * Math.cos(a), cy + rr * Math.sin(a)]);
    }
  };
  const P = Math.PI;
  line(x0 + rr, y0, x1 - rr, y0);
  arc(x1 - rr, y0 + rr, -P / 2, 0);
  line(x1, y0 + rr, x1, y1 - rr);
  arc(x1 - rr, y1 - rr, 0, P / 2);
  line(x1 - rr, y1, x0 + rr, y1);
  arc(x0 + rr, y1 - rr, P / 2, P);
  line(x0, y1 - rr, x0, y0 + rr);
  arc(x0 + rr, y0 + rr, P, (3 * P) / 2);

  let s = seed * 9973;
  const rand = () => {
    s = (s * 16807) % 2147483647;
    return (s / 2147483647) * 2 - 1;
  };
  const j = pts.map(([x, y]) => [x + rand() * jitter, y + rand() * jitter] as [number, number]);

  // 점 사이를 부드러운 곡선으로 잇는다
  const mid = (a: [number, number], b: [number, number]) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const start = mid(j[j.length - 1], j[0]);
  let d = `M${start[0].toFixed(1)},${start[1].toFixed(1)}`;
  for (let i = 0; i < j.length; i++) {
    const p = j[i];
    const m = mid(p, j[(i + 1) % j.length]);
    d += ` Q${p[0].toFixed(1)},${p[1].toFixed(1)} ${m[0].toFixed(1)},${m[1].toFixed(1)}`;
  }
  return d + ' Z';
}

// CRAYON이 켜져 있을 때 원래 테두리·바탕을 지우는 스타일. 손그림 테두리가 대신 그려진다.
export const plain = { borderWidth: 0, backgroundColor: 'transparent', boxShadow: 'none' } as const;
