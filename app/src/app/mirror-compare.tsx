import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { PrimaryButton, SecondaryButton } from '@/components/buttons';
import { Mirror } from '@/components/mirror';
import { Screen } from '@/components/screen';
import { useSession } from '@/state/session';
import { C } from '@/theme/colors';

const DECISIONS = [
  { key: '수용', label: '받아들이기' },
  { key: '수정', label: '고쳐서 받기' },
  { key: '보류', label: '나중에 생각하기' },
  { key: '거부', label: '지금은 아니에요' },
] as const;

// 06 거울 · 비교와 판단 (FR-09)
export default function MirrorCompareScreen() {
  const { s, set } = useSession();
  const [text, setText] = useState(s.returned ?? s.highlight ?? '');
  const [decision, setDecision] = useState<(typeof DECISIONS)[number]['key'] | null>(null);
  const failed = s.returned === null; // 점검 실패: 새 문장 없이 원문만

  const finish = () => {
    // TODO(서버 연동): 판단 저장 API에 decision, aiDraft(s.returned), edited(text)를 보낸다.
    set({ decision, returned: text });
    router.push('/closing');
  };

  return (
    <Screen step="거울 2/2" glowAt="50% 46%" footer={<PrimaryButton label="마무리하기" onPress={finish} disabled={!decision} />}>
      <View style={{ gap: 8 }}>
        <Ctx label="처음 적은 걱정" text={s.worry || '[걱정]'} />
        <Ctx label="손님에게 한 말" text={s.highlight ?? '[하이라이트 원문]'} />
      </View>
      <View style={{ alignItems: 'center', gap: 8 }}>
        <Mirror width={248} height={288} style={{ paddingHorizontal: 36 }}>
          <Text style={styles.mirrorLabel}>{failed ? '거울에 비친 말' : '거울이 돌려준 말'}</Text>
          <TextInput
            value={text}
            onChangeText={setText}
            editable={!failed}
            multiline
            accessibilityLabel="거울이 돌려준 말"
            style={styles.mirrorText}
          />
        </Mirror>
        <Text style={styles.hint}>
          {failed ? '이번에는 새 문장을 만들지 못해 원래 했던 말을 비춰요' : '거울 속 문장을 눌러 고칠 수 있어요'}
        </Text>
      </View>
      <Text style={styles.question}>이 말을 나에게 어떻게 할까요?</Text>
      <View style={styles.grid}>
        {DECISIONS.map((d) => (
          <View key={d.key} style={{ width: '48%' }}>
            {decision === d.key ? (
              <PrimaryButton label={d.label} onPress={() => setDecision(d.key)} />
            ) : (
              <SecondaryButton label={d.label} onPress={() => setDecision(d.key)} />
            )}
          </View>
        ))}
      </View>
      <Text style={styles.hint}>어떤 선택이든 똑같이 오늘 상담의 마무리로 기록돼요</Text>
    </Screen>
  );
}

function Ctx({ label, text }: { label: string; text: string }) {
  return (
    <View style={styles.ctx}>
      <Text style={{ fontSize: 11, fontWeight: '500', color: C.sub }}>{label}</Text>
      <Text style={{ fontSize: 13, lineHeight: 20, color: C.text }}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  ctx: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1, borderColor: C.border, backgroundColor: 'rgba(255,255,255,0.04)', gap: 2 },
  mirrorLabel: { fontSize: 11, fontWeight: '700', color: '#3E5366', letterSpacing: 0.6 },
  mirrorText: { width: '100%', minHeight: 110, fontSize: 16, lineHeight: 26, fontWeight: '500', color: C.onGlass, textAlign: 'center', textAlignVertical: 'center' },
  hint: { fontSize: 12, color: C.sub, textAlign: 'center' },
  question: { fontSize: 14, fontWeight: '500', color: C.text, textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 8 },
});
