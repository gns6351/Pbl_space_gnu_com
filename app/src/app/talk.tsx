import { router } from 'expo-router';
import { ComponentRef, useRef, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { guestImage } from '@/data/guests';
import { useSession } from '@/state/session';
import { C } from '@/theme/colors';

type Msg = { from: 'guest' | 'me'; text: string; picked?: boolean; highlight?: boolean };

// 서버 연동 전 임시 대본. 3번째 턴이 조언 요청 턴이다 (FR-05).
const SCRIPT: { guest: string; choices: string[]; askAdvice?: boolean }[] = [
  { guest: '[손님 대사] 사실 팀원 한 명이 일주일째 답장이 없어요.', choices: ['많이 답답했겠다.', '언제부터 그랬어?', '다른 팀원들은 뭐래?'] },
  { guest: '[손님 대사] 그냥 제가 다 해 버릴까 싶다가도 억울해요.', choices: ['억울할 만해.', '혼자 다 하면 힘들잖아.'] },
  { guest: '[손님 대사] 그 사람이 또 안 읽으면요? 저라면 어떻게 하는 게 좋을까요?', choices: [], askAdvice: true },
  { guest: '[손님 대사] 그렇게 해 볼 수 있을 것 같아요. 고마워요.', choices: ['다행이다.', '응원할게.'] },
];

// 04 상담 (FR-04~07)
export default function TalkScreen() {
  const { s, set } = useSession();
  const [turn, setTurn] = useState(0);
  const [msgs, setMsgs] = useState<Msg[]>([{ from: 'guest', text: SCRIPT[0].guest }]);
  const [draft, setDraft] = useState('');
  const [freeMode, setFreeMode] = useState(false);
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);

  const cur = SCRIPT[Math.min(turn, SCRIPT.length - 1)];
  const askAdvice = !!cur.askAdvice;
  const showInput = askAdvice || freeMode;
  const done = turn >= SCRIPT.length - 1;

  const send = (text: string, picked: boolean) => {
    if (!text.trim()) return;
    // TODO(서버 연동): 직접 입력일 때만 조언 판정 API 결과로 highlight를 정한다 (FR-06). 지금은 10자 이상이면 조언으로 가정.
    const highlight = !picked && text.trim().length >= 10;
    if (highlight) set({ highlight: text.trim() });
    const nextTurn = turn + 1;
    const nextMsgs: Msg[] = [...msgs, { from: 'me', text: text.trim(), picked, highlight }];
    if (nextTurn < SCRIPT.length) nextMsgs.push({ from: 'guest', text: SCRIPT[nextTurn].guest });
    setMsgs(nextMsgs);
    setTurn(nextTurn);
    setDraft('');
    setFreeMode(false);
    setTimeout(() => scroll.current?.scrollToEnd({ animated: true }), 50);
  };

  const finish = () => router.push(s.highlight ? '/mirror-pick' : '/closing');

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        {s.guestId ? (
          <View style={styles.avatar}>
            <Image source={guestImage(s.guestId)} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
          </View>
        ) : null}
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>[손님 이름]</Text>
          <Text style={styles.meta}>상담 중 · {turn + 1}번째 대화</Text>
        </View>
        <Pressable accessibilityRole="button" onPress={finish} style={styles.pill}>
          <Text style={styles.pillText}>마무리</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={() => router.replace('/')} style={styles.textBtn}>
          <Text style={[styles.pillText, { color: C.muted }]}>그만하기</Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView ref={scroll} contentContainerStyle={styles.list}>
          {msgs.map((m, i) =>
            m.from === 'guest' ? (
              <Text key={i} style={styles.guestBubble}>{m.text}</Text>
            ) : (
              <View key={i} style={{ alignItems: 'flex-end', gap: 4 }}>
                <Text style={[styles.meBubble, m.highlight && styles.meHighlight]}>{m.text}</Text>
                {m.picked ? <Text style={styles.caption}>선택지로 고른 말</Text> : null}
                {m.highlight ? <Text style={[styles.caption, { color: C.ice, fontWeight: '500' }]}>거울이 기억할게요 · 기록장에 담김</Text> : null}
              </View>
            ),
          )}
          {done ? <Text style={[styles.caption, { textAlign: 'center', marginTop: 8 }]}>손님이 마무리를 기다려요. 오른쪽 위 '마무리'를 눌러 주세요.</Text> : null}
        </ScrollView>

        {!done ? (
          <View style={styles.composer}>
            {showInput ? (
              <>
                {askAdvice ? <Text style={styles.ask}>손님이 조언을 구하고 있어요. 직접 답해 주세요.</Text> : null}
                <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-end' }}>
                  <TextInput
                    value={draft}
                    onChangeText={setDraft}
                    placeholder="손님에게 하고 싶은 말"
                    placeholderTextColor={C.sub}
                    multiline
                    maxLength={300}
                    style={styles.input}
                    accessibilityLabel="답장 입력"
                  />
                  <Pressable accessibilityRole="button" accessibilityLabel="보내기" onPress={() => send(draft, false)} style={styles.send}>
                    <Text style={{ color: C.onGlass, fontSize: 18, fontWeight: '700' }}>→</Text>
                  </Pressable>
                </View>
              </>
            ) : (
              <View style={{ gap: 8 }}>
                {cur.choices.map((c) => (
                  <Pressable key={c} accessibilityRole="button" onPress={() => send(c, true)} style={styles.choice}>
                    <Text style={styles.choiceText}>{c}</Text>
                  </Pressable>
                ))}
                <Pressable accessibilityRole="button" onPress={() => setFreeMode(true)} style={styles.textBtn}>
                  <Text style={{ color: C.ice, fontSize: 14 }}>직접 쓰기</Text>
                </Pressable>
              </View>
            )}
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  header: { height: 64, paddingLeft: 16, paddingRight: 8, flexDirection: 'row', alignItems: 'center', gap: 10, borderBottomWidth: 1, borderBottomColor: C.line },
  avatar: { width: 34, height: 44, borderRadius: 22, borderWidth: 2, borderColor: '#F2F8FF', backgroundColor: '#DCEBF8', overflow: 'hidden', boxShadow: '0 0 12px rgba(170,215,255,0.55)' },
  name: { fontSize: 15, fontWeight: '700', color: C.text },
  meta: { fontSize: 12, color: C.sub },
  pill: { height: 44, paddingHorizontal: 12, borderRadius: 22, borderWidth: 1, borderColor: C.borderStrong, justifyContent: 'center' },
  pillText: { fontSize: 14, color: C.text },
  textBtn: { minHeight: 44, paddingHorizontal: 10, alignItems: 'center', justifyContent: 'center' },
  list: { padding: 16, gap: 12 },
  guestBubble: { maxWidth: 280, padding: 12, paddingHorizontal: 14, borderRadius: 18, borderTopLeftRadius: 4, backgroundColor: '#252C33', borderWidth: 1, borderColor: C.border, color: C.text, fontSize: 15, lineHeight: 23 },
  meBubble: { maxWidth: 280, padding: 12, paddingHorizontal: 14, borderRadius: 18, borderTopRightRadius: 4, backgroundColor: '#343D46', color: C.text, fontSize: 15, lineHeight: 23, overflow: 'hidden' },
  meHighlight: { backgroundColor: '#E3F0FC', color: C.onGlass, boxShadow: '0 0 22px rgba(170,215,255,0.5)' },
  caption: { fontSize: 11, color: C.sub },
  composer: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16, borderTopWidth: 1, borderTopColor: C.line, backgroundColor: '#20262C', gap: 8 },
  ask: { fontSize: 12, color: C.muted },
  input: { flex: 1, minHeight: 52, maxHeight: 120, paddingHorizontal: 16, paddingVertical: 14, borderRadius: 26, borderWidth: 1.5, borderColor: '#CFE3F5', backgroundColor: 'rgba(234,244,255,0.06)', color: C.text, fontSize: 15 },
  send: { width: 52, height: 52, borderRadius: 26, backgroundColor: C.glass, alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 16px rgba(170,215,255,0.45)' },
  choice: { minHeight: 48, paddingHorizontal: 16, borderRadius: 24, borderWidth: 1, borderColor: C.borderStrong, justifyContent: 'center' },
  choiceText: { fontSize: 14, color: C.text },
});
