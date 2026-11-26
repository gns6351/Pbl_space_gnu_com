import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { errorMessage, game, newRequestId } from '@/api/game';
import { Mirror } from '@/components/mirror';
import { RetryCard } from '@/components/retry';
import { Screen } from '@/components/screen';
import { Waiting } from '@/components/waiting';
import { playerImage } from '@/data/players';
import { useProfile } from '@/state/profile';
import { useSession } from '@/state/session';
import { C } from '@/theme/colors';
import { HAND } from '@/theme/fonts';

// 05-2 거울이 고른 말을 비추는 중 (FR-08). 서버가 나에게 하는 말로 바꾸고 점검하는 동안 보이는 화면.
export default function MirrorReflectScreen() {
  const { s, set } = useSession();
  const { playerId } = useProfile();
  const pulse = useRef(new Animated.Value(0.7)).current;
  const rid = useRef(newRequestId()).current; // 다시 시도해도 같은 요청 번호 (FR-12)
  const started = useRef(false);
  const alive = useRef(true);
  const [failed, setFailed] = useState('');

  // 거울이 천천히 밝아졌다 어두워졌다 한다
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1100, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.7, duration: 1100, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const reflect = useCallback(async () => {
    if (!s.game || !s.pickedHighlightId) return;
    setFailed('');
    try {
      const v = await game.mirror(s.game.id, s.pickedHighlightId, rid);
      if (!alive.current) return; // 기다리는 중에 그만하기를 눌렀으면 넘어가지 않는다
      // returned가 null이면 점검을 통과하지 못한 것. 다음 화면에서 원래 했던 말을 비춘다
      set({ game: v, returned: v.mirror?.returned ?? null });
      router.replace('/mirror-compare');
    } catch (e) {
      if (alive.current) setFailed(errorMessage(e));
    }
  }, [s.game, s.pickedHighlightId, rid, set]);

  // 이 화면에 들어올 때 한 번만 부른다
  useEffect(() => {
    alive.current = true;
    if (!started.current) {
      started.current = true;
      reflect();
    }
    return () => {
      alive.current = false;
    };
  }, [reflect]);

  return (
    <Screen step="거울" glowAt="50% 40%">
      <View style={styles.center}>
        <Animated.View style={{ opacity: pulse }}>
          <Mirror width={240} height={320} reflection={playerImage(playerId)} reflectionOpacity={0.5} />
        </Animated.View>
        {failed ? (
          <RetryCard title="거울이 잠깐 흐려졌어요" message={failed} onRetry={reflect} />
        ) : (
          <>
            <Waiting text="거울이 그 말을 비추고 있어요" />
            <Text style={styles.said} numberOfLines={3}>"{s.highlight}"</Text>
            <Text style={styles.hint}>돌아올 말을 만드는 데 최대 20초 걸려요</Text>
          </>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', gap: 14, paddingTop: 32 },
  said: { fontSize: 18, lineHeight: 26, fontFamily: HAND, color: C.text, textAlign: 'center', paddingHorizontal: 8 },
  hint: { fontSize: 14, color: C.sub, textAlign: 'center' },
});
