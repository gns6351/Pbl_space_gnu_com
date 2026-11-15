import { router } from 'expo-router';

import { ComponentRef, useRef, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Bubble } from '@/components/bubble';
import { PrimaryButton } from '@/components/buttons';
import { guestImage } from '@/data/guests';
import { useSession } from '@/state/session';
import { C } from '@/theme/colors';
import { CRAYON, HAND } from '@/theme/fonts';
import { CrayonFrame, crayonLine, plain } from '@/components/crayon';

type Msg = { from: 'guest' | 'me'; text: string; highlight?: boolean };

// 서버 연동 전 임시 대본. askAdvice 턴은 선택지 없이 직접 써야 한다 (FR-05). 실제 대화는 AI가 만들고 더 길어진다.
const SCRIPT: { guest: string; choices: string[]; askAdvice?: boolean }[] = [
  { guest: '사실 팀원 한 명이 일주일째 답장이 없어요.', choices: ['많이 답답했겠다.', '언제부터 그랬어?', '다른 팀원들은 뭐래?'] },
  { guest: '단톡방에 공지를 올려도 읽기만 하고 아무 말이 없어요.', choices: ['읽기만 하면 더 신경 쓰이지.', '다른 연락 방법은 있어?'] },
  { guest: '그냥 제가 다 해 버릴까 싶다가도 억울해요.', choices: ['억울할 만해.', '혼자 다 하면 힘들잖아.'] },
  { guest: '그 사람이 또 안 읽으면요? 저라면 어떻게 하는 게 좋을까요?', choices: [], askAdvice: true },
  { guest: '따로 연락하는 건 좀 무서워요. 괜히 싸우게 될까 봐요.', choices: ['그 마음 이해돼.', '무서운 게 당연해.'] },
  { guest: '혹시 말을 꺼낸다면, 어떻게 시작하면 좋을까요?', choices: [], askAdvice: true },
  { guest: '그렇게 해 볼 수 있을 것 같아요. 오늘 이야기 들어 줘서 고마워요.', choices: [] },
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
    // 거울 앞에서 고를 수 있게 모아 둔다. 바로 앞의 손님 말도 함께 남긴다.
    if (highlight) set({ highlights: [...s.highlights, { id: Date.now(), text: text.trim(), before: cur.guest }] });
    const nextTurn = turn + 1;
    const nextMsgs: Msg[] = [...msgs, { from: 'me', text: text.trim(), highlight }];
    if (nextTurn < SCRIPT.length) nextMsgs.push({ from: 'guest', text: SCRIPT[nextTurn].guest });
    setMsgs(nextMsgs);
    setTurn(nextTurn);
    setDraft('');
    setFreeMode(false);
    setTimeout(() => scroll.current?.scrollToEnd({ animated: true }), 50);
  };

  const finish = () => router.push('/farewell');

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
        <Pressable accessibilityRole="button" onPress={finish} style={[styles.pill, CRAYON && plain]}>
          {CRAYON ? <CrayonFrame fill="rgba(255,255,255,0.04)" stroke={crayonLine} strokeWidth={1.8} radius={22} seed={3} grainOpacity={0.1} grainTone="light" /> : null}
          <Text style={styles.pillText}>마무리</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={() => router.replace('/')} style={[styles.pill, CRAYON && plain]}>
          {CRAYON ? <CrayonFrame fill="rgba(255,255,255,0.04)" stroke={crayonLine} strokeWidth={1.8} radius={22} seed={8} grainOpacity={0.1} grainTone="light" /> : null}
          <Text style={styles.pillText}>그만하기</Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView ref={scroll} contentContainerStyle={styles.list}>
          {msgs.map((m, i) =>
            m.from === 'guest' ? (
              <Bubble key={i} from="guest" text={m.text} seed={i + 1} />
            ) : (
              <View key={i} style={{ alignItems: 'flex-end', gap: 4 }}>
                <Bubble from="me" text={m.text} highlight={m.highlight} seed={i + 1} />
                {m.highlight ? <Text style={styles.remember}>거울이 기억할게요</Text> : null}
              </View>
            ),
          )}
        </ScrollView>

        {done ? (
          <View style={styles.composer}>
            <PrimaryButton label="마무리하기" onPress={finish} />
          </View>
        ) : (
          <View style={styles.composer}>
            {showInput ? (
              <>
                <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-end' }}>
                  {/* 안쪽 여백은 바깥 틀에 둔다. 여러 줄이 되어 스크롤돼도 글이 테두리 밖으로 나가지 않게 */}
                  <View style={[styles.inputBox, CRAYON && plain]}>
                  {CRAYON ? <CrayonFrame fill="rgba(234,244,255,0.06)" stroke="#CFE3F5" radius={22} seed={5} grainOpacity={0.05} grainTone="light" /> : null}
                  <TextInput
                    value={draft}
                    onChangeText={setDraft}
                    placeholder={askAdvice ? '손님에게 조언해 주세요' : '손님에게 하고 싶은 말'}
                    placeholderTextColor={C.sub}
                    multiline
                    maxLength={300}
                    style={styles.input}
                    textAlignVertical="center"
                    accessibilityLabel="답장 입력"
                  />
                  </View>
                  <Pressable accessibilityRole="button" accessibilityLabel="보내기" onPress={() => send(draft, false)} style={[styles.send, CRAYON && plain, CRAYON && { boxShadow: '0 0 16px rgba(170,215,255,0.45)' }]}>
                    {CRAYON ? <CrayonFrame fill={C.glass} stroke={C.onGlass} radius={26} seed={9} grainOpacity={0.07} /> : null}
                    <Text style={{ color: C.onGlass, fontSize: 18, fontWeight: '700' }}>→</Text>
                  </Pressable>
                </View>
              </>
            ) : (
              <View style={{ gap: 8 }}>
                {cur.choices.map((c) => (
                  <Pressable key={c} accessibilityRole="button" onPress={() => send(c, true)} style={[styles.choice, CRAYON && plain]}>
                    {CRAYON ? <CrayonFrame fill="rgba(255,255,255,0.04)" stroke={crayonLine} strokeWidth={1.8} radius={24} seed={c.length} grainOpacity={0.08} grainTone="light" /> : null}
                    <Text style={styles.choiceText}>{c}</Text>
                  </Pressable>
                ))}
                <Pressable accessibilityRole="button" onPress={() => setFreeMode(true)} style={styles.textBtn}>
                  <Text style={{ color: C.ice, fontSize: 14 }}>직접 쓰기</Text>
                </Pressable>
              </View>
            )}
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  header: { height: 64, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 8, borderBottomWidth: 1, borderBottomColor: C.line },
  avatar: { width: 34, height: 44, borderRadius: 22, borderWidth: 2, borderColor: '#F2F8FF', backgroundColor: '#DCEBF8', overflow: 'hidden', boxShadow: '0 0 12px rgba(170,215,255,0.55)' },
  name: { fontSize: 18, fontFamily: HAND, fontWeight: 'normal', color: C.text },
  meta: { fontSize: 14, color: C.sub },
  pill: { height: 44, paddingHorizontal: 12, borderRadius: 22, borderWidth: 1, borderColor: C.borderStrong, justifyContent: 'center' },
  pillText: { fontSize: 14, color: C.text },
  textBtn: { minHeight: 44, paddingHorizontal: 10, alignItems: 'center', justifyContent: 'center' },
  list: { padding: 16, gap: 12 },
  remember: { fontSize: 15, fontFamily: HAND, color: C.ice },
  composer: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16, borderTopWidth: 1, borderTopColor: C.line, backgroundColor: '#20262C', gap: 8 },
  inputBox: { flex: 1, minHeight: 52, justifyContent: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 22, borderWidth: 1.5, borderColor: '#CFE3F5', backgroundColor: 'rgba(234,244,255,0.06)' },
  input: { maxHeight: 100, padding: 0, color: C.text, fontSize: 15, lineHeight: 22 },
  send: { width: 52, height: 52, borderRadius: 26, backgroundColor: C.glass, alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 16px rgba(170,215,255,0.45)' },
  choice: { minHeight: 48, paddingHorizontal: 16, borderRadius: 24, borderWidth: 1, borderColor: C.borderStrong, justifyContent: 'center' },
  choiceText: { fontSize: 14, color: C.text },
});
