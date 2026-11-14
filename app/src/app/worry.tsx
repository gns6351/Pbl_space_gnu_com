import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { PrimaryButton } from '@/components/buttons';
import { Screen } from '@/components/screen';
import { useSession } from '@/state/session';
import { C } from '@/theme/colors';

const EXAMPLES = [
  { key: '시험', text: '열심히 했는데 성적이 안 올라요' },
  { key: '팀플', text: '팀원이 연락이 안 되는데 말하기가 어려워요' },
  { key: '취업', text: '서류에서 계속 떨어지니까 자신이 없어요' },
];

// 02 접수 · 걱정 입력 (FR-02: 5~300자 또는 예시 3종)
export default function WorryScreen() {
  const { set } = useSession();
  const [text, setText] = useState('');
  const [picked, setPicked] = useState<string | null>(null);

  const worry = picked ?? text.trim();
  const tooShort = !picked && text.trim().length > 0 && text.trim().length < 5;
  const valid = !!picked || (text.trim().length >= 5 && text.trim().length <= 300);

  const next = () => {
    set({ worry });
    router.push('/guest');
  };

  return (
    <Screen step="접수" footer={<PrimaryButton label="손님 맞이하기" onPress={next} disabled={!valid} />}>
      <View style={{ gap: 6 }}>
        <Text style={styles.title}>요즘 마음에 걸리는 일이 있나요?</Text>
        <Text style={styles.body}>적은 걱정은 거울에 비친 손님이 되어 찾아올 거예요.</Text>
      </View>
      <View style={{ gap: 8 }}>
        <Text style={styles.label}>직접 쓰기</Text>
        <TextInput
          value={text}
          onChangeText={(v) => {
            setText(v);
            if (v) setPicked(null);
          }}
          multiline
          maxLength={300}
          placeholder="예: 다음 주 발표가 있는데 준비가 하나도 안 된 것 같아요"
          placeholderTextColor={C.sub}
          style={styles.input}
          textAlignVertical="top"
        />
        <View style={styles.row}>
          <Text style={[styles.small, tooShort && { color: C.danger }]}>
            {tooShort ? '5자 이상 써 주세요' : '5자 이상 300자 이하'}
          </Text>
          <Text style={styles.small}>{text.length} / 300</Text>
        </View>
      </View>
      <Text style={[styles.small, { textAlign: 'center' }]}>또는 예시에서 고르기</Text>
      <View style={{ gap: 8 }}>
        {EXAMPLES.map((e) => {
          const on = picked === e.text;
          return (
            <Pressable
              key={e.key}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              onPress={() => {
                setPicked(on ? null : e.text);
                setText('');
              }}
              style={[styles.example, on && styles.exampleOn]}>
              <Text style={styles.exampleKey}>{e.key}</Text>
              <Text style={styles.exampleText}>{e.text}</Text>
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: '700', color: C.text },
  body: { fontSize: 14, lineHeight: 22, color: C.muted },
  label: { fontSize: 14, fontWeight: '500', color: C.muted },
  input: {
    height: 150,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#CFE3F5',
    backgroundColor: 'rgba(234,244,255,0.06)',
    boxShadow: '0 0 18px rgba(170,215,255,0.18)',
    color: C.text,
    fontSize: 15,
    lineHeight: 24,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  small: { fontSize: 14, color: C.sub },
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
  exampleKey: { fontSize: 14, fontWeight: '700', color: C.text },
  exampleText: { fontSize: 14, color: C.muted },
});
