import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/buttons';
import { CrayonFrame, plain } from '@/components/crayon';
import { Mirror, mirrorPanel } from '@/components/mirror';
import { Screen } from '@/components/screen';
import { playerImage } from '@/data/players';
import { useProfile } from '@/state/profile';
import { useSession } from '@/state/session';
import { C } from '@/theme/colors';
import { CRAYON, HAND } from '@/theme/fonts';

// 05 거울 · 조언 고르기 (FR-08). 한 판 동안 직접 쓴 조언 중 하나를 고른다.
export default function MirrorPickScreen() {
  const { s, set } = useSession();
  const { playerId } = useProfile();
  // 하나뿐이면 미리 골라 둔다
  const [pickedId, setPickedId] = useState<number | null>(s.highlights.length === 1 ? s.highlights[0].id : null);
  const picked = s.highlights.find((h) => h.id === pickedId) ?? null;

  const go = () => {
    if (!picked) return;
    // 고른 말을 들고 거울이 비추는 화면으로. 반환 API는 그 화면에서 기다린다
    set({ highlight: picked.text, returned: null });
    router.push('/mirror-reflect');
  };

  return (
    <Screen
      step="거울 1/2"
      glowAt="50% 24%"
      footer={
        <>
          <PrimaryButton label="거울에 비춰 보기" onPress={go} disabled={!picked} />
          <Text style={styles.hint}>돌아올 말을 만드는 데 최대 20초 걸려요</Text>
        </>
      }>
      <View style={{ alignItems: 'center' }}>
        <Mirror width={168} height={220} reflection={playerImage(playerId)} reflectionOpacity={0.4} style={{ paddingHorizontal: 18 }}>
          <Text style={[styles.mirrorText, mirrorPanel]}>어떤 말을{'\n'}비춰 볼까요?</Text>
        </Mirror>
      </View>
      <View style={{ gap: 4 }}>
        <Text style={styles.title}>손님이 돌아간 뒤, 거울 앞</Text>
        <Text style={styles.body}>오늘 손님에게 직접 건넨 말 중 하나를 골라 보세요.</Text>
      </View>
      <View style={{ gap: 10 }}>
        {s.highlights.map((h, i) => {
          const on = h.id === pickedId;
          return (
            <Pressable
              key={h.id}
              accessibilityRole="radio"
              accessibilityState={{ selected: on }}
              onPress={() => setPickedId(h.id)}
              style={[styles.option, on && styles.optionOn, CRAYON && plain, CRAYON && on && { boxShadow: '0 0 18px rgba(170,215,255,0.28)' }]}>
              {CRAYON ? (
                <CrayonFrame
                  fill={on ? 'rgba(234,244,255,0.10)' : 'rgba(255,255,255,0.04)'}
                  stroke={on ? '#CFE3F5' : '#5A6470'}
                  strokeWidth={on ? 2 : 1.6}
                  radius={16}
                  seed={i + 7}
                  grainOpacity={0.06}
                  grainTone="light"
                />
              ) : null}
              <Text style={styles.before} numberOfLines={2}>손님: {h.before}</Text>
              <Text style={styles.said}>"{h.text}"</Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={styles.hint}>내가 직접 써서 건넨 말만 거울에 비출 수 있어요.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  mirrorText: { fontSize: 17, lineHeight: 24, fontFamily: HAND, color: C.onGlass, textAlign: 'center' },
  title: { fontSize: 24, fontFamily: HAND, color: C.text, textAlign: 'center' },
  body: { fontSize: 14, color: C.muted, textAlign: 'center' },
  option: { padding: 16, borderRadius: 16, borderWidth: 1, borderColor: C.border, backgroundColor: 'rgba(255,255,255,0.04)', gap: 6 },
  optionOn: { borderWidth: 1.5, borderColor: '#CFE3F5', backgroundColor: 'rgba(234,244,255,0.10)', boxShadow: '0 0 18px rgba(170,215,255,0.28)' },
  before: { fontSize: 14, lineHeight: 20, color: C.sub },
  said: { fontSize: 15, lineHeight: 23, fontWeight: '500', color: C.text },
  hint: { fontSize: 14, color: C.sub, textAlign: 'center' },
});
