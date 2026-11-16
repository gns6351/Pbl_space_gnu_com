import { router } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/buttons';
import { Mirror } from '@/components/mirror';
import { Screen } from '@/components/screen';
import { players } from '@/data/players';
import { useProfile } from '@/state/profile';
import { C, glow } from '@/theme/colors';
import { CRAYON, HAND } from '@/theme/fonts';
import { CrayonFrame, plain } from '@/components/crayon';

// 00 내 캐릭터 고르기 (FR-13). 처음 실행 때 나오고, 첫 화면에서 다시 바꿀 수 있다.
export default function CharacterScreen() {
  const { playerId, setPlayer } = useProfile();
  const [picked, setPicked] = useState(playerId ?? players[0].id);
  const current = players.find((p) => p.id === picked) ?? players[0];
  const first = !playerId;

  const done = async () => {
    await setPlayer(picked);
    if (first) router.replace('/');
    else router.back();
  };

  return (
    <Screen
      step={first ? '처음 한 번만' : '내 캐릭터'}
      action={first ? '건너뛰기' : '닫기'}
      onAction={first ? done : () => router.back()}
      glowAt="50% 24%"
      footer={<PrimaryButton label={first ? '이 모습으로 시작하기' : '저장하기'} onPress={done} />}>
      <View style={{ alignItems: 'center' }}>
        <Mirror width={150} height={200} reflection={current.image} />
      </View>
      <View style={{ gap: 6 }}>
        <Text style={styles.title}>거울에 비칠 내 모습을 골라 주세요</Text>
        <Text style={styles.body}>거울 장면마다 이 캐릭터가 비춰요. 나중에 바꿀 수 있어요.</Text>
      </View>
      <View style={styles.grid}>
        {players.map((p, i) => {
          const on = p.id === picked;
          return (
            <Pressable
              key={p.id}
              accessibilityRole="button"
              accessibilityLabel={`캐릭터 ${i + 1}`}
              accessibilityState={{ selected: on }}
              onPress={() => setPicked(p.id)}
              style={[styles.cell, on && styles.cellOn, CRAYON && plain, CRAYON && on && { boxShadow: glow.soft }]}>
              {/* 바탕 칠은 캐릭터 뒤에, 손그림 테두리는 캐릭터 앞에 그린다 */}
              {CRAYON ? <CrayonFrame fill={on ? 'rgba(234,244,255,0.14)' : 'rgba(255,255,255,0.06)'} radius={48} seed={i + 1} grainOpacity={0} /> : null}
              {/* 캐릭터는 손그림 선과 같은 위치(안쪽 CLIP_INSET px)에서 둥글게 잘라, 선 밖으로 비치지 않게 한다 */}
              <View style={styles.clip}>
                <Image source={p.image} style={{ width: '100%', height: '90%' }} resizeMode="contain" />
              </View>
              {CRAYON ? <CrayonFrame stroke={on ? '#CFE3F5' : C.border} strokeWidth={on ? 2 : 1.6} radius={48} seed={i + 1} grainOpacity={0} /> : null}
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
}

// 손그림 선이 칸 가장자리에서 들어와 있는 정도 (선 굵기 + 여유). 삐져나오면 늘리고, 빈틈이 보이면 줄인다
const CLIP_INSET = 3;

const styles = StyleSheet.create({
  clip: {
    position: 'absolute',
    top: CLIP_INSET,
    left: CLIP_INSET,
    right: CLIP_INSET,
    bottom: CLIP_INSET,
    borderRadius: 48 - CLIP_INSET,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  title: { fontSize: 25, fontFamily: HAND, fontWeight: 'normal', color: C.text, textAlign: 'center' },
  body: { fontSize: 14, lineHeight: 22, color: C.muted, textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 10 },
  cell: {
    width: '23%',
    height: 96,
    borderRadius: 48,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  cellOn: { borderWidth: 2, borderColor: '#CFE3F5', backgroundColor: 'rgba(234,244,255,0.14)', boxShadow: glow.soft },
});
