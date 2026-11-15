import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/buttons';
import { Caution } from '@/components/caution';
import { Check, ConsentNotice } from '@/components/consent-notice';
import { Screen } from '@/components/screen';
import { useProfile } from '@/state/profile';
import { useSession } from '@/state/session';
import { C } from '@/theme/colors';
import { HAND } from '@/theme/fonts';

// 01 접수 · 동의 (FR-01). 처음 한 번만 묻고 기기에 저장한다. 바꾸려면 설정 화면에서.
export default function ConsentScreen() {
  const { agree } = useProfile();
  const { set } = useSession();
  const [required, setRequired] = useState(false);
  const [save, setSave] = useState(false);

  const next = async () => {
    await agree(save);
    set({ saveConsent: save });
    router.replace('/worry');
  };

  return (
    <Screen
      step="접수 1/2"
      footer={
        <>
          <PrimaryButton label="동의하고 시작하기" onPress={next} disabled={!required} />
          <Text style={styles.hint}>동의는 한 번만 받고, 설정에서 바꿀 수 있어요.</Text>
        </>
      }>
      <View style={{ gap: 6 }}>
        <Text style={styles.title}>시작하기 전에 확인해 주세요</Text>
        <Text style={styles.body}>상담에서 나눈 이야기가 어떻게 쓰이는지 알려 드려요.</Text>
      </View>
      <ConsentNotice />
      <Caution items={['실명, 연락처 같은 개인정보는 입력하지 마세요.', '이 게임은 상담·치료 서비스가 아니에요.']} />
      <View>
        <Check checked={required} onToggle={() => setRequired(!required)} label="(필수) 위 내용에 동의해요" />
        <Check checked={save} onToggle={() => setSave(!save)} label="(선택) 돌려받은 문장 카드를 이 폰에 저장할게요" />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 25, fontFamily: HAND, fontWeight: 'normal', color: C.text },
  body: { fontSize: 17, lineHeight: 24, fontFamily: HAND, color: C.muted },
  hint: { fontSize: 14, lineHeight: 21, color: C.sub, textAlign: 'center' },
});
