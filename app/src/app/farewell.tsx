import { router } from 'expo-router';
import { Image, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/buttons';
import { Mirror } from '@/components/mirror';
import { Screen } from '@/components/screen';
import { guestImage } from '@/data/guests';
import { useSession } from '@/state/session';
import { C } from '@/theme/colors';

// 04-3 손님 배웅. 조언이 적절했는지와 상관없이 모든 판에서 편해진 표정으로 배웅한다.
export default function FarewellScreen() {
  const { s } = useSession();
  const next = () => router.replace(s.highlight ? '/mirror-pick' : '/closing');

  return (
    <Screen step="손님 배웅" glowAt="50% 38%" footer={<PrimaryButton label={s.highlight ? '거울 앞에 서기' : '마무리하기'} onPress={next} />}>
      <View style={{ gap: 6, paddingTop: 8 }}>
        <Text style={styles.title}>[손님 이름]이 한결 편해 보여요</Text>
        <Text style={styles.body}>"오늘 이야기 들어 줘서 고마워요."</Text>
      </View>
      <View style={{ alignItems: 'center' }}>
        <Mirror width={236} height={316} style={{ justifyContent: 'flex-end' }}>
          {s.guestId ? (
            <Image source={guestImage(s.guestId, 'relieved')} style={{ width: '100%', height: '92%' }} resizeMode="contain" />
          ) : null}
        </Mirror>
      </View>
      {s.highlight ? <Text style={styles.note}>손님이 나간 뒤 거울에 다른 모습이 비치기 시작해요.</Text> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: '700', color: C.text, textAlign: 'center' },
  body: { fontSize: 15, lineHeight: 24, color: C.muted, textAlign: 'center' },
  note: { fontSize: 14, lineHeight: 22, color: C.muted, textAlign: 'center' },
});
