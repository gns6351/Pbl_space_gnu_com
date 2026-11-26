import { router } from 'expo-router';
import { Image, StyleSheet, Text, View } from 'react-native';

import { Bubble } from '@/components/bubble';
import { PrimaryButton } from '@/components/buttons';
import { Mirror } from '@/components/mirror';
import { Screen } from '@/components/screen';
import { guestImage } from '@/data/guests';
import { useSession } from '@/state/session';
import { C } from '@/theme/colors';
import { HAND } from '@/theme/fonts';

// 04-3 손님 배웅. 조언이 적절했는지와 상관없이 모든 판에서 편해진 표정으로 배웅한다.
export default function FarewellScreen() {
  const { s } = useSession();
  // 서버가 조언이 있었으면 mirror, 없었으면 done 단계를 준다.
  const hasAdvice = s.game?.stage === 'mirror';
  const next = () => router.replace(hasAdvice ? '/mirror-pick' : '/closing');

  return (
    <Screen step="손님 배웅" glowAt="50% 42%" footer={<PrimaryButton label={hasAdvice ? '거울 앞에 서기' : '마무리하기'} onPress={next} />}>
      <Text style={styles.title}>{s.game?.guest?.name ? `${s.game.guest.name} 님이` : '손님이'} 한결 편해 보여요</Text>
      <View style={{ alignItems: 'center', gap: 10 }}>
        {/* 손님이 직접 건네는 인사 */}
        <Bubble from="guest" text="오늘 이야기 들어 줘서 고마워요." seed={4} style={{ alignSelf: 'center' }} />
        <Mirror width={236} height={316} style={{ justifyContent: 'flex-end' }}>
          {s.guestId ? (
            <Image source={guestImage(s.guestId, 'relieved')} style={{ width: '100%', height: '92%' }} resizeMode="contain" />
          ) : null}
        </Mirror>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 25, fontFamily: HAND, color: C.text, textAlign: 'center', paddingTop: 8 },
});
