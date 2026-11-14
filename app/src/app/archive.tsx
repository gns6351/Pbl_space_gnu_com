import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/buttons';
import { Screen } from '@/components/screen';
import { useProfile } from '@/state/profile';
import { C, glow } from '@/theme/colors';

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}

// 08 카드 보관함 (FR-14). 기기에만 저장된 카드를 보여 주고 지울 수 있다.
export default function ArchiveScreen() {
  const { cards, removeCard } = useProfile();

  return (
    <Screen
      step="카드 보관함"
      action="닫기"
      onAction={() => router.back()}
      glowAt="50% 10%"
      footer={<PrimaryButton label="새 상담 시작하기" onPress={() => router.replace('/')} />}>
      <View style={{ gap: 6 }}>
        <Text style={styles.title}>거울이 돌려준 말들</Text>
        <Text style={styles.body}>저장에 동의한 카드만 이 폰 안에 남아요. 서버에는 저장되지 않아요.</Text>
      </View>
      {cards.length === 0 ? (
        <Text style={[styles.body, { paddingVertical: 40, textAlign: 'center' }]}>아직 보관한 카드가 없어요.</Text>
      ) : (
        cards.map((c, i) => (
          <View key={c.id} style={[styles.card, i === 0 && styles.cardLatest]}>
            <View style={styles.meta}>
              <Text style={[styles.metaText, i === 0 && { color: '#3E5366' }]}>{formatDate(c.createdAt)}</Text>
              {c.decision ? <Text style={[styles.metaText, i === 0 && { color: '#3E5366' }]}>{c.decision}</Text> : null}
            </View>
            <Text style={[styles.text, i === 0 && { color: C.onGlass }]}>{c.text}</Text>
            <Text style={[styles.worry, i === 0 && { color: '#3E5366' }]} numberOfLines={1}>
              처음 걱정: {c.worry}
            </Text>
            <Pressable accessibilityRole="button" accessibilityLabel="이 카드 삭제" onPress={() => removeCard(c.id)} style={styles.delete}>
              <Text style={{ fontSize: 14, color: i === 0 ? '#8A3A2C' : C.danger }}>삭제</Text>
            </Pressable>
          </View>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: '700', color: C.text },
  body: { fontSize: 14, lineHeight: 22, color: C.muted },
  card: { padding: 18, borderRadius: 20, borderWidth: 1, borderColor: C.border, backgroundColor: 'rgba(255,255,255,0.06)', gap: 8 },
  cardLatest: { borderWidth: 0, backgroundColor: '#E3F0FC', backgroundImage: 'linear-gradient(160deg, #F6FBFF 0%, #D6E8F8 100%)', boxShadow: glow.soft },
  meta: { flexDirection: 'row', justifyContent: 'space-between' },
  metaText: { fontSize: 14, color: C.muted },
  text: { fontSize: 16, lineHeight: 26, fontWeight: '500', color: C.text },
  worry: { fontSize: 14, color: C.sub },
  delete: { alignSelf: 'flex-end', minHeight: 44, paddingHorizontal: 12, justifyContent: 'center' },
});
