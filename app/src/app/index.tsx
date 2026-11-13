import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/buttons';
import { Mirror } from '@/components/mirror';
import { Screen } from '@/components/screen';
import { useSession } from '@/state/session';
import { C } from '@/theme/colors';

// 01 접수 · 동의 (FR-01)
export default function ConsentScreen() {
  const { set, reset } = useSession();
  const [required, setRequired] = useState(false);
  const [save, setSave] = useState(false);

  const next = () => {
    reset();
    set({ saveConsent: save });
    router.push('/worry');
  };

  return (
    <Screen
      step="접수 1/2"
      onAction={() => {}}
      footer={
        <>
          <PrimaryButton label="다음" onPress={next} disabled={!required} />
          <Text style={styles.hint}>필수 동의 전에는 '다음'을 누를 수 없어요</Text>
        </>
      }>
      <View style={{ alignItems: 'center', paddingTop: 4 }}>
        <Mirror width={132} height={176}>
          <Text style={styles.mirrorText}>거울상담소</Text>
        </Mirror>
      </View>
      <View style={{ gap: 6 }}>
        <Text style={styles.title}>거울상담소에 오신 걸 환영해요</Text>
        <Text style={styles.body}>시작하기 전에 아래 내용을 확인해 주세요.</Text>
      </View>
      <View style={styles.card}>
        <Item label="수집 목적" value="대화 진행과 돌려줄 문장 만들기" />
        <Item label="외부 AI 전송" value="걱정과 대화가 Google Gemini로 전송" />
        <Item label="보관 기간" value="[보관 기간 입력]" />
        <Item label="삭제 방법" value="마무리 화면에서 언제든 삭제" />
      </View>
      <Text style={styles.small}>실명, 연락처 같은 개인정보는 입력하지 마세요. 이 게임은 상담·치료 서비스가 아니에요.</Text>
      <View>
        <Check checked={required} onToggle={() => setRequired(!required)} label="(필수) 위 내용에 동의해요" />
        <Check checked={save} onToggle={() => setSave(!save)} label="(선택) 돌려받은 문장 카드를 저장할게요" />
      </View>
    </Screen>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ width: '47%', gap: 2 }}>
      <Text style={{ fontSize: 12, fontWeight: '700', color: C.ice }}>{label}</Text>
      <Text style={{ fontSize: 13, lineHeight: 19, color: C.text }}>{value}</Text>
    </View>
  );
}

function Check({ checked, onToggle, label }: { checked: boolean; onToggle: () => void; label: string }) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      onPress={onToggle}
      style={{ minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <View
        style={{
          width: 20,
          height: 20,
          borderRadius: 4,
          borderWidth: 1.5,
          borderColor: checked ? C.ice : C.borderStrong,
          backgroundColor: checked ? C.ice : 'transparent',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        {checked ? <Text style={{ color: C.onGlass, fontSize: 13, fontWeight: '700' }}>✓</Text> : null}
      </View>
      <Text style={{ fontSize: 14, color: C.text }}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  mirrorText: { fontSize: 15, fontWeight: '700', color: C.onGlass, letterSpacing: 0.6 },
  title: { fontSize: 22, fontWeight: '700', color: C.text, textAlign: 'center' },
  body: { fontSize: 14, lineHeight: 22, color: C.muted, textAlign: 'center' },
  card: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.panel,
  },
  small: { fontSize: 12, lineHeight: 18, color: C.sub },
  hint: { fontSize: 12, color: C.sub, textAlign: 'center' },
});
