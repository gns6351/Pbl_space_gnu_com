import { Redirect, router } from 'expo-router';
import { ComponentRef, useRef, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { errorMessage, game, GameError, newRequestId, View as GameView } from '@/api/game';
import { Bubble } from '@/components/bubble';
import { PrimaryButton } from '@/components/buttons';
import { CrayonFrame, crayonLine, plain } from '@/components/crayon';
import { RetryCard } from '@/components/retry';
import { TypingBubble } from '@/components/waiting';
import { guestImage } from '@/data/guests';
import { useSession } from '@/state/session';
import { C } from '@/theme/colors';
import { CRAYON, HAND } from '@/theme/fonts';

type Pending = { input: { choiceId: string } | { text: string }; text: string, rid: string };

// 04 상담 (FR-04~07). 손님 대사·선택지·조언 판정·위험 감지는 모두 서버가 한다.
export default function TalkScreen() {
  const { s, set } = useSession();
  const [draft, setDraft] = useState('');
  const [freeMode, setFreeMode] = useState(false);
  const [pending, setPending] = useState<Pending | null>(null); // 서버 대답을 기다리는 내 말
  const [waiting, setWaiting] = useState(false);  // 기다리는 동안 입력 잠금 (FR-04)
  const [failed, setFailed] = useState('');
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);

  const v = s.game;
  if (!v || !v.turn) return <Redirect href="/" />;
  const id = v.id;
  const turn = v.turn;
  const askAdvice = turn.kind === 'advice';
  const showInput = askAdvice || freeMode;
  const scrollDown = () => setTimeout(() => scroll.current?.scrollToEnd({ animated: true }), 50);

  // 서버가 돌려준 상태에 따라 다음 화면으로
  const apply = (next: GameView) => {
    set({ game: next});
    if (next.stage === 'help') router.replace('/safety'); // 위험 감지 (FR-10)
    else if (next.stage === 'mirror' || next.stage === 'done') router.replace('/farewell'); // 12턴 자동 종료
  };

  const request = async (p: Pending) => {
    setPending(p);
    setWaiting(true);
    setFailed('');
    setDraft('');
    scrollDown();

    try {
      apply(await game.turn(id, turn.n, p.input, p.rid));
      setPending(null);

    } catch (e) {
      // 이미 처리된 턴이면 최신 상태를 다시 받아 온다
      if (e instanceof GameError && (e.code === 'STALE_TURN' || e.code === 'WRONG_STAGE')) {
        try {
          apply(await game.get(id));
          setPending(null);
          return;

        } catch {}
      }
      setFailed(errorMessage(e));
    } finally {
      setWaiting(false);
      scrollDown();
    }
  };

  const pick = (c: { id: string; text: string }) => request({ input: { choiceId: c.id }, text: C.text, rid: newRequestId() });
  const sendText = () => {
    const text = draft.trim();

    if (text) request({ input :{ text }, text, rid: newRequestId() });
  };

  // 마무리 (언제든, FR-07). 조언이 있었으면 거울로, 없으면 마무리 화면으로 
  const finish = async () => {
    if (waiting) return;
    setWaiting(true);

    try{
      const next = await game.end(id);
      set({ game: next });
      router.replace('/farewell');
    } catch (e) {
      setFailed(errorMessage(e));
    } finally {
      setWaiting(false);
    }
  };

  // 그만하기 (FR-11). 서버에 알리고 바로 처음 화면으로
  const quit = () => {
    game.quit(id).catch(() => {});
    router.replace('/');
  }

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        {s.guestId ? (
          <View style={styles.avatar}>
            <Image source={guestImage(s.guestId)} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
          </View>
        ) : null}
      
        <View style={{ flex: 1}}>
          <Text style={styles.name}>{v.guest?.name ?? '손님'}</Text>
          <Text style={styles.meta}>{waiting ? '대답하는 중...' : `상담 중 · ${turn.n}번째 대화`}</Text>
        </View>

        <Pressable accessibilityRole='button' onPress={finish} style={[styles.pill, CRAYON && plain]}>
          {CRAYON ? <CrayonFrame fill="rgba(255,255,255,0.04)" stroke={crayonLine} strokeWidth={1.8} radius={22} seed={3} grainOpacity={0.1} grainTone="light" /> : null}
          <Text style={styles.pillText}>마무리</Text>
        </Pressable>

        <Pressable accessibilityRole="button" onPress={quit} style={[styles.pill, CRAYON && plain]}>
          {CRAYON ? <CrayonFrame fill="rgba(255,255,255,0.04)" stroke={crayonLine} strokeWidth={1.8} radius={22} seed={8} grainOpacity={0.1} grainTone="light" /> : null}
          <Text style={styles.pillText}>그만하기</Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView ref={scroll} contentContainerStyle={styles.list} onContentSizeChange={scrollDown}>
          {/* 지난 대화 */}
          {(v.transcript ?? []).map((t) => (
            <View key={t.n} style={{ gap: 12 }}>
              <Bubble from="guest" text={t.guest} seed={t.n * 2} />
              <View style={{ alignItems: 'flex-end', gap: 4 }}>
                <Bubble from="me" text={t.player.text} highlight={t.highlighted} seed={t.n * 2 + 1} />
                {t.highlighted ? <Text style={styles.remember}>거울이 기억할게요</Text> : null}
              </View>
            </View>
          ))}
          {/* 지금 손님 대사 */}
          <Bubble from="guest" text={turn.guest} seed={turn.n * 2} />
          {/* 보내는 중인 내 말 + 손님이 대답하는 중 */}
          {pending ? <Bubble from="me" text={pending.text} seed={turn.n * 2 + 1} /> : null}
          {waiting && pending ? <TypingBubble /> : null}
        </ScrollView>

        {failed ? (
          <View style={styles.composer}>
            <RetryCard
              title="손님이 잠깐 말을 잇지 못했어요"
              message={failed}
              retryLabel={pending ? '다시 보내기' : '다시 시도하기'}
              onRetry={() => (pending ? request(pending) : setFailed(''))}
            />
          </View>
        ) : (
          <View style={[styles.composer, waiting && { opacity: 0.45 }]} pointerEvents={waiting ? 'none' : 'auto'}>
            {/* 손님이 마무리를 제안하면 마무리 버튼을 크게 보여 준다. 대화를 이어 가도 된다 */}
            {turn.suggestEnd ? <PrimaryButton label="마무리하기" onPress={finish} /> : null}
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
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="보내기"
                    onPress={sendText}
                    style={[styles.send, CRAYON && plain, CRAYON && { boxShadow: '0 0 16px rgba(170,215,255,0.45)' }]}>
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
                {turn.choices.map((c) => (
                  <Pressable key={c.id} accessibilityRole="button" onPress={() => pick(c)} style={[styles.choice, CRAYON && plain]}>
                    {CRAYON ? <CrayonFrame fill="rgba(255,255,255,0.04)" stroke={crayonLine} strokeWidth={1.8} radius={24} seed={c.text.length} grainOpacity={0.08} grainTone="light" /> : null}
                    <Text style={styles.choiceText}>{c.text}</Text>
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
  )
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
