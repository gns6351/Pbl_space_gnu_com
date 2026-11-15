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
              {CRAYON ? <CrayonFrame fill={on ? 'rgba(234,244,255,0.14)' : 'rgba(255,255,255,0.06)'} stroke={on ? '#CFE3F5' : C.border} radius={48} seed={i + 1} grainOpacity={0} /> : null}
              <Image source={p.image} style={{ width: '100%', height: '90%' }} resizeMode="contain" />
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
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
