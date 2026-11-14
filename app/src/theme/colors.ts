// 거울상담소 색상 (디자인 캔버스와 같은 값)
export const C = {
  bg: '#1B2026',
  bgGlow: '#34404B', // 거울 주변이 밝아지는 색
  panel: 'rgba(255,255,255,0.05)',
  line: '#2E363E',
  border: '#3A434C',
  borderStrong: '#4A545E',
  text: '#EEF2F5',
  muted: '#BCC6CF',
  sub: '#A9B4BE',
  ice: '#9CCBFF', // 강조 글자
  glass: '#EAF4FF', // 주요 버튼 배경
  onGlass: '#13202B', // 거울·버튼 위 글자
  danger: '#F2A99C',
} as const;

// 거울 빛 (boxShadow 문자열)
export const glow = {
  soft: '0 0 24px rgba(170,215,255,0.35)',
  mirror: '0 0 34px rgba(170,215,255,0.6), 0 0 90px rgba(120,180,240,0.28)',
};
