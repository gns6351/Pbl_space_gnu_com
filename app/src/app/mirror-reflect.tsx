import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { api } from '@/api';
import { Mirror } from '@/components/mirror';
import { Screen } from '@/components/screen';
import { Waiting } from '@/components/waiting';
import { playerImage } from '@/data/players';
import { useProfile } from '@/state/profile';
import { useSession } from '@/state/session';
import { C } from '@/theme/colors';
import { HAND } from '@/theme/fonts';

// 05-2 거울이 고른 말을 비추는 중 (FR-09). 반환 API를 기다리는 동안만 보이는 화면.
export default function MirrorReflectScreen() {
  const { s, set } = useSession();
  const { playerId } = useProfile();
  const pulse = useRef(new Animated.Value(0.7)).current;
  const started = useRef(false);
  const alive = useRef(true);

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

  useEffect(() => {
    alive.current = true;
    if (started.current) return;
    started.current = true;
    (async () => {
      let returned: string | null = null;
      try {
        // 반환 API: 나에게 돌려줄 문장으로 바꾸고 점검한다. 점검 실패 시 null
        returned = (await api.reflect(s.sessionId ?? '', s.highlight ?? '')).returned;
      } catch {
        // 오래 걸리거나 실패하면 새 문장 없이 원래 했던 말을 비춘다 (FR-09). 다음 화면에서 안내한다
        returned = null;
      }
      if (!alive.current) return; // 기다리는 중에 그만하기를 눌렀으면 넘어가지 않는다
      set({ returned });
      router.replace('/mirror-compare');
    })();
    return () => {
      alive.current = false;
    };
    // 이 화면에 들어올 때 한 번만 부른다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Screen step="거울" glowAt="50% 40%">
      <View style={styles.center}>
        <Animated.View style={{ opacity: pulse }}>
          <Mirror width={240} height={320} reflection={playerImage(playerId)} reflectionOpacity={0.5} />
        </Animated.View>
        <Waiting text="거울이 그 말을 비추고 있어요" />
        <Text style={styles.said} numberOfLines={3}>"{s.highlight}"</Text>
        <Text style={styles.hint}>돌아올 말을 만드는 데 최대 20초 걸려요</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', gap: 14, paddingTop: 32 },
  said: { fontSize: 18, lineHeight: 26, fontFamily: HAND, color: C.text, textAlign: 'center', paddingHorizontal: 8 },
  hint: { fontSize: 14, color: C.sub, textAlign: 'center' },
});
