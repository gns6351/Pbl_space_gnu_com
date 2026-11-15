import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { PrimaryButton } from '@/components/buttons';
import { CrayonFrame, plain } from '@/components/crayon';
import { Screen } from '@/components/screen';
import { Segmented } from '@/components/segmented';
import { useSession } from '@/state/session';
import { C } from '@/theme/colors';
import { CRAYON, HAND } from '@/theme/fonts';

const EXAMPLES = [
  { key: '시험', text: '열심히 했는데 성적이 안 올라요' },
  { key: '팀플', text: '팀원이 연락이 안 되는데 말하기가 어려워요' },
  { key: '취업', text: '서류에서 계속 떨어지니까 자신이 없어요' },
];

type Mode = 'write' | 'example';

// 02 접수 · 걱정 입력 (FR-02: 5~300자 또는 예시 3종)
export default function WorryScreen() {
  const { set } = useSession();
  const [mode, setMode] = useState<Mode>('write');
  const [text, setText] = useState('');
  const [picked, setPicked] = useState<string | null>(null);

  const trimmed = text.trim();
  const tooShort = mode === 'write' && trimmed.length > 0 && trimmed.length < 5;
  const valid = mode === 'example' ? !!picked : trimmed.length >= 5 && trimmed.length <= 300;
  const worry = mode === 'example' ? picked ?? '' : trimmed;

  const next = () => {
    set({ worry });
    router.push('/guest');
  };

  return (
    <Screen step="접수" footer={<PrimaryButton label="손님 맞이하기" onPress={next} disabled={!valid} />}>
      <View style={{ gap: 6 }}>
        <Text style={styles.title}>요즘 마음에 걸리는 일이 있나요?</Text>
        <Text style={styles.body}>털어놓은 고민을 닮은 손님이 상담소를 찾아올 거예요.</Text>
      </View>

      <Segmented<Mode>
        options={[
          { key: 'write', label: '직접 쓰기' },
          { key: 'example', label: '예시에서 고르기' },
        ]}
        value={mode}
        onChange={setMode}
      />

      {mode === 'write' ? (
        <View style={{ gap: 8 }}>
          {/* 안쪽 여백은 바깥 틀에 둔다. 글이 길어 스크롤돼도 테두리 밖으로 나가지 않게 */}
          <View style={[styles.inputBox, CRAYON && plain]}>
            {CRAYON ? <CrayonFrame fill="rgba(234,244,255,0.06)" stroke="#CFE3F5" radius={20} seed={9} grainOpacity={0.05} grainTone="light" /> : null}
            <TextInput
              value={text}
              onChangeText={setText}
              multiline
              maxLength={300}
              placeholder="다음 주 발표가 있는데 준비가 하나도 안 된 것 같아요"
              placeholderTextColor={C.sub}
              style={styles.input}
              textAlignVertical="top"
              accessibilityLabel="고민 입력"
            />
            <Text style={styles.counter}>{text.length} / 300</Text>
          </View>
          {tooShort ? <Text style={styles.warn}>5자 이상 써 주세요</Text> : null}
        </View>
      ) : (
        <View style={{ gap: 8 }}>
          {EXAMPLES.map((e) => {
            const on = picked === e.text;
            return (
              <Pressable
                key={e.key}
                accessibilityRole="radio"
                accessibilityState={{ selected: on }}
                onPress={() => setPicked(on ? null : e.text)}
                style={[styles.example, on && styles.exampleOn, CRAYON && plain]}>
                {CRAYON ? (
                  <CrayonFrame
                    fill={on ? 'rgba(234,244,255,0.1)' : 'rgba(255,255,255,0.04)'}
                    stroke={on ? '#CFE3F5' : '#5A6470'}
                    strokeWidth={on ? 2 : 1.6}
                    radius={14}
                    seed={e.text.length}
                    grainOpacity={0.06}
                    grainTone="light"
                  />
                ) : null}
                <Text style={styles.exampleKey}>{e.key}</Text>
                <Text style={styles.exampleText}>{e.text}</Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 25, fontFamily: HAND, color: C.text },
  body: { fontSize: 17, lineHeight: 24, fontFamily: HAND, color: C.muted },
  inputBox: {
    height: 170,
    paddingTop: 14,
    paddingBottom: 34,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#CFE3F5',
    backgroundColor: 'rgba(234,244,255,0.06)',
    boxShadow: '0 0 18px rgba(170,215,255,0.18)',
  },
  input: { flex: 1, padding: 0, color: C.text, fontSize: 15, lineHeight: 24 },
  // 입력칸 안 오른쪽 아래 글자 수
  counter: { position: 'absolute', right: 16, bottom: 10, fontSize: 15, fontFamily: HAND, color: C.sub },
  warn: { paddingHorizontal: 12, fontSize: 15, fontFamily: HAND, color: C.danger },
  example: {
    minHeight: 56,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: 'rgba(255,255,255,0.04)',
    gap: 2,
  },
  exampleOn: { borderColor: '#CFE3F5', borderWidth: 1.5, backgroundColor: 'rgba(234,244,255,0.1)', boxShadow: '0 0 16px rgba(170,215,255,0.25)' },
  exampleKey: { fontSize: 17, fontFamily: HAND, color: C.text },
  exampleText: { fontSize: 14, color: C.muted },
});
