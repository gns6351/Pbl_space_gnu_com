import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton, SecondaryButton } from '@/components/buttons';
import { Mirror, mirrorPanel } from '@/components/mirror';
import { Screen } from '@/components/screen';
import { guestImage } from '@/data/guests';
import { playerImage } from '@/data/players';
import { useProfile } from '@/state/profile';
import { useSession } from '@/state/session';
import { C } from '@/theme/colors';

const LABEL = { 수용: '받아들이기', 수정: '고쳐서 받기', 보류: '나중에 생각하기', 거부: '지금은 아니에요' } as const;

// 07 마무리 (FR-07, FR-11, FR-14)
export default function ClosingScreen() {
  const { s, reset } = useSession();
  const { playerId, addCard, removeCard, cards } = useProfile();
  const hasCard = !!s.highlight && !!s.returned;
  const savedId = useRef<string | null>(null);

  // 저장에 동의한 판만 카드 보관함(기기)에 한 번 저장한다
  useEffect(() => {
    if (!hasCard || !s.saveConsent || savedId.current) return;
    savedId.current = 'pending';
    addCard({ worry: s.worry, text: s.returned ?? '', decision: s.decision ? LABEL[s.decision] : null });
  }, [hasCard, s.saveConsent, s.worry, s.returned, s.decision, addCard]);

  const restart = () => {
    reset();
    router.replace('/');
  };

  const remove = async () => {
    // 방금 저장한 카드도 지운다. TODO(서버 연동): DELETE /game/sessions/:id 로 세션 기록을 지운다.
    const latest = cards.find((c) => c.text === s.returned);
    if (latest) await removeCard(latest.id);
    restart();
  };

  return (
    <Screen
      step="마무리"
      glowAt="50% 36%"
      footer={
        <>
          <PrimaryButton label="처음으로" onPress={restart} />
          {hasCard && s.saveConsent ? <SecondaryButton label="카드 보관함 보기" onPress={() => router.push('/archive')} /> : null}
          <SecondaryButton label="이 상담 기록 삭제하기" tone="danger" onPress={remove} />
        </>
      }>
      <View style={{ gap: 6 }}>
        <Text style={styles.title}>오늘의 상담을 마쳤어요</Text>
        <Text style={styles.body}>[손님 이름]은 고개를 끄덕이며 상담소를 나섰어요.</Text>
      </View>
      <View style={{ alignItems: 'center' }}>
        {hasCard ? (
          <Mirror width={224} height={280} reflection={playerImage(playerId)} reflectionOpacity={0.32} style={{ paddingHorizontal: 28, gap: 10 }}>
            <Text style={styles.mirrorLabel}>오늘 거울이 돌려준 말</Text>
            <Text style={[styles.mirrorText, mirrorPanel]}>{s.returned}</Text>
            {s.decision ? <Text style={styles.mirrorLabel}>내 선택 · {LABEL[s.decision]}</Text> : null}
          </Mirror>
        ) : (
          <Mirror width={200} height={260} style={{ justifyContent: 'flex-end' }}>
            {s.guestId ? <Image source={guestImage(s.guestId, 'relieved')} style={{ width: '100%', height: '92%' }} resizeMode="contain" /> : null}
          </Mirror>
        )}
      </View>
      {!hasCard ? <Text style={[styles.body, { textAlign: 'center' }]}>오늘은 손님 이야기를 들어 준 날이에요.</Text> : null}
      <Text style={styles.note}>
        {hasCard && s.saveConsent ? '카드 보관함에 저장했어요. 이 폰 안에만 남아요.' : '저장에 동의하지 않아 카드는 남지 않아요.'}
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: '700', color: C.text, textAlign: 'center' },
  body: { fontSize: 14, lineHeight: 22, color: C.muted, textAlign: 'center' },
  mirrorLabel: { fontSize: 14, fontWeight: '700', color: '#3E5366', textAlign: 'center' },
  mirrorText: { fontSize: 16, lineHeight: 26, fontWeight: '500', color: C.onGlass, textAlign: 'center' },
  note: { fontSize: 14, color: C.sub, textAlign: 'center' },
});
