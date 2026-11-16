import { Redirect, router } from 'expo-router';

import { ComponentRef, useRef, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { api, errorMessage, Turn } from '@/api';
import { Bubble } from '@/components/bubble';
import { PrimaryButton } from '@/components/buttons';
import { RetryCard } from '@/components/retry';
import { TypingBubble } from '@/components/waiting';
import { guestImage } from '@/data/guests';
import { useSession } from '@/state/session';
import { C } from '@/theme/colors';
import { CRAYON, HAND } from '@/theme/fonts';
import { CrayonFrame, crayonLine, plain } from '@/components/crayon';

type Msg = { from: 'guest' | 'me'; text: string; highlight?: boolean };

// 04 상담 (FR-04~07). 손님 대사와 선택지는 상담 턴 API가 만든다.
export default function TalkScreen() {
  const { s, set } = useSession();
  const [cur, setCur] = useState<Turn | null>(s.firstTurn);
  const [turnNo, setTurnNo] = useState(1);
  const [msgs, setMsgs] = useState<Msg[]>(s.firstTurn?.line ? [{ from: 'guest', text: s.firstTurn.line }] : []);
  const [draft, setDraft] = useState('');
  const [freeMode, setFreeMode] = useState(false);
  const [waiting, setWaiting] = useState(false); // 손님이 대답하는 중: 입력 잠금 (NFR-07)
  const [failed, setFailed] = useState<{ text: string; picked: boolean; message: string } | null>(null);
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);

  if (!s.sessionId || !cur) return <Redirect href="/" />;

  const askAdvice = cur.askAdvice;
  const showInput = askAdvice || freeMode;
  const done = cur.done;
  const lastGuestLine = [...msgs].reverse().find((m) => m.from === 'guest')?.text ?? '';
  const scrollDown = () => setTimeout(() => scroll.current?.scrollToEnd({ animated: true }), 50);

  // 서버에 보낸다. retry=true면 이미 화면에 올린 내 말을 다시 보내는 것
  const request = async (text: string, picked: boolean, retry = false) => {
    if (waiting) return;
    if (!retry) {
      setMsgs((m) => [...m, { from: 'me', text }]);
      setDraft('');
      setFreeMode(false);
    }
    setFailed(null);
    setWaiting(true);
    scrollDown();
    const before = lastGuestLine;
    try {
      const r = await api.sendTurn(s.sessionId!, { text, picked });
      // 위험 발화면 대화를 멈추고 안내 화면으로. 이 판의 역할극은 다시 이어지지 않는다 (FR-10)
      if (r.risk) {
        router.replace('/safety');
        return;
      }
      if (r.highlight) {
        // 거울 앞에서 고를 수 있게 모아 둔다. 바로 앞의 손님 말도 함께 남긴다 (FR-06)
        set({ highlights: [...s.highlights, { id: Date.now(), text, before }] });
        setMsgs((m) => m.map((x, i) => (i === m.length - 1 ? { ...x, highlight: true } : x)));
      }
      if (r.next.line) setMsgs((m) => [...m, { from: 'guest', text: r.next.line! }]);
      setCur(r.next);
      setTurnNo((n) => n + 1);
    } catch (e) {
      setFailed({ text, picked, message: errorMessage(e) });
    } finally {
      setWaiting(false);
      scrollDown();
    }
  };

  const send = (text: string, picked: boolean) => {
    if (!text.trim()) return;
    request(text.trim(), picked);
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
          <Text style={styles.name}>{s.guest?.name ?? '손님'}</Text>
          <Text style={styles.meta}>{waiting ? '대답하는 중…' : `상담 중 · ${turnNo}번째 대화`}</Text>
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
          {waiting ? <TypingBubble /> : null}
        </ScrollView>

        {failed ? (
          <View style={styles.composer}>
            <RetryCard
              title="손님이 잠깐 말을 잇지 못했어요"
              message={failed.message}
              retryLabel="다시 보내기"
              onRetry={() => request(failed.text, failed.picked, true)}
            />
          </View>
        ) : done ? (
          <View style={styles.composer}>
            <PrimaryButton label="마무리하기" onPress={finish} />
          </View>
        ) : (
          <View style={[styles.composer, waiting && { opacity: 0.45 }]} pointerEvents={waiting ? 'none' : 'auto'}>
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
                    editable={!waiting}
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
                {/* 조언 요청 턴이 아니면, 직접 쓰다가도 선택지로 돌아갈 수 있다 */}
                {!askAdvice ? (
                  <Pressable accessibilityRole="button" onPress={() => { setFreeMode(false); setDraft(''); }} style={styles.textBtn}>
                    <Text style={{ color: C.ice, fontSize: 14 }}>선택지에서 고르기</Text>
                  </Pressable>
                ) : null}
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
