import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { errorMessage, game } from '@/api/game';
import { PrimaryButton, SecondaryButton } from '@/components/buttons';
import { Mirror, mirrorFit, mirrorPanel } from '@/components/mirror';
import { Screen } from '@/components/screen';
import { playerImage } from '@/data/players';
import { useProfile } from '@/state/profile';
import { useSession } from '@/state/session';
import { C } from '@/theme/colors';
import { CrayonFrame, plain } from '@/components/crayon';
import { CRAYON, HAND } from '@/theme/fonts';

const DECISIONS = [
  { key: '수용', label: '받아들이기' },
  { key: '수정', label: '고쳐서 받기' },
  { key: '보류', label: '나중에 생각하기' },
  { key: '거부', label: '지금은 아니에요' },
] as const;

// 06 거울 · 비교와 판단 (FR-09)
export default function MirrorCompareScreen() {
  const { s, set } = useSession();
  const { playerId } = useProfile();
  const [text, setText] = useState(s.returned ?? s.highlight ?? '');
  const [decision, setDecision] = useState<(typeof DECISIONS)[number]['key'] | null>(null);
  const failed = s.returned === null;
  const fit = mirrorFit(text.length); // 점검 실패: 새 문장 없이 원문만

    const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  // 판단을 서버에 보낸다 (FR-09). 문장을 고쳤으면 고친 문장도 함께
  const finish = async () => {
    if (!decision || !s.game || sending) return;
    setSending(true);
    setError('');
    try {
      const edited = !failed && text.trim() !== s.returned ? text.trim() : undefined;
      const v = await game.decision(s.game.id, VERDICT[decision], edited);
      set({ game: v, decision, returned: text });
      // 고친 문장에서 위험이 감지되면 도움 안내로 (FR-10)
      router.push(v.stage === 'help' ? '/safety' : '/closing');
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setSending(false);
    }
  };

  return (
    <Screen
      step="거울 2/2"
      glowAt="50% 46%"
      footer={
        <>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <PrimaryButton label={sending ? '기록하는 중…' : error ? '다시 시도하기' : '마무리하기'} onPress={finish} disabled={!decision || sending} />
        </>
      }>

      <View style={{ gap: 8 }}>
        <Ctx label="처음 적은 걱정" text={s.worry || '[걱정]'} />
        <Ctx label="손님에게 한 말" text={s.highlight ?? '[하이라이트 원문]'} />
      </View>
      <View style={{ alignItems: 'center', gap: 8 }}>
        <Mirror width={fit.width} height={fit.height} reflection={playerImage(playerId)} reflectionOpacity={fit.reflectionOpacity} style={{ paddingHorizontal: fit.width * 0.11, gap: 8 }}>
          <Text style={styles.mirrorLabel}>{failed ? '거울에 비친 말' : '거울이 돌려준 말'}</Text>
          <TextInput
            value={text}
            onChangeText={setText}
            editable={!failed}
            multiline
            accessibilityLabel="거울이 돌려준 말"
            style={[styles.mirrorText, fit.text, mirrorPanel, { maxHeight: fit.height * 0.62 }]}
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
    <View style={[styles.ctx, CRAYON && plain]}>
      {CRAYON ? <CrayonFrame fill={'rgba(255,255,255,0.04)'} stroke={C.border} radius={12} seed={label.length} grainOpacity={0} /> : null}
      <Text style={{ fontSize: 14, fontWeight: '500', color: C.sub }}>{label}</Text>
      <Text style={{ fontSize: 14, lineHeight: 21, color: C.text }}>{text}</Text>
    </View>
  );
}

// 앱의 선택 → 서버의 verdict
const VERDICT = { 수용: 'accept', 수정: 'modify', 보류: 'hold', 거부: 'reject' } as const;

const styles = StyleSheet.create({
  error: { fontSize: 14, lineHeight: 21, color: C.danger, textAlign: 'center' },
  ctx: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1, borderColor: C.border, backgroundColor: 'rgba(255,255,255,0.04)', gap: 2 },
  mirrorLabel: { fontSize: 17, fontFamily: HAND, color: '#3E5366', letterSpacing: 0.6 },
  mirrorText: { width: '100%', minHeight: 110, color: C.onGlass, textAlign: 'center', textAlignVertical: 'center' },
  hint: { fontSize: 14, color: C.sub, textAlign: 'center' },
  question: { fontSize: 14, fontWeight: '500', color: C.text, textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 8 },
});
