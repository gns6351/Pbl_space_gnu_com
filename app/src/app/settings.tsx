import { router } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { SecondaryButton } from '@/components/buttons';
import { ConsentNotice } from '@/components/consent-notice';
import { Screen } from '@/components/screen';
import { playerImage } from '@/data/players';
import { useProfile } from '@/state/profile';
import { C } from '@/theme/colors';

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

// 설정: 내 캐릭터, 동의 상태 변경·철회, 보관한 카드 전체 삭제 (FR-01, FR-11, FR-13, FR-14)
export default function SettingsScreen() {
  const { playerId, consent, setSaveCards, withdraw, cards, clearCards } = useProfile();
  const [confirm, setConfirm] = useState<'withdraw' | 'clear' | null>(null);

  return (
    <Screen step="설정" action="닫기" onAction={() => router.back()} glowAt="50% -20%">
      {/* 내 캐릭터 */}
      <Section title="내 캐릭터">
        <Pressable accessibilityRole="button" onPress={() => router.push('/character')} style={styles.row}>
          <View style={styles.avatar}>
            <Image source={playerImage(playerId)} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
          </View>
          <Text style={[styles.rowText, { flex: 1 }]}>거울에 비칠 캐릭터 바꾸기</Text>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
      </Section>

      {/* 동의 */}
      <Section title="개인정보 동의">
        {consent ? (
          <>
            <Text style={styles.body}>{formatDate(consent.agreedAt)}에 동의했어요. 새 상담을 시작할 때 다시 묻지 않아요.</Text>
            <View style={styles.row}>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={styles.rowText}>돌려받은 문장 카드 저장</Text>
                <Text style={styles.small}>켜 두면 상담이 끝날 때 카드가 이 폰에 저장돼요.</Text>
              </View>
              <Switch
                value={consent.saveCards}
                onValueChange={setSaveCards}
                accessibilityLabel="돌려받은 문장 카드 저장"
                trackColor={{ false: C.borderStrong, true: C.ice }}
                thumbColor={C.text}
              />
            </View>
            <ConsentNotice />
            {confirm === 'withdraw' ? (
              <View style={styles.confirm}>
                <Text style={styles.body}>동의를 철회하면 다음 상담을 시작할 때 다시 동의를 물어요. 보관한 카드는 그대로 남아요.</Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <View style={{ flex: 1 }}><SecondaryButton label="취소" onPress={() => setConfirm(null)} /></View>
                  <View style={{ flex: 1 }}><SecondaryButton label="철회하기" tone="danger" onPress={async () => { await withdraw(); setConfirm(null); }} /></View>
                </View>
              </View>
            ) : (
              <SecondaryButton label="동의 철회하기" tone="danger" onPress={() => setConfirm('withdraw')} />
            )}
          </>
        ) : (
          <Text style={styles.body}>아직 동의하지 않았어요. 다음 상담을 시작할 때 동의 화면이 나와요.</Text>
        )}
      </Section>

      {/* 카드 보관함 */}
      <Section title="카드 보관함">
        <Text style={styles.body}>이 폰에 보관한 카드 {cards.length}장</Text>
        {confirm === 'clear' ? (
          <View style={styles.confirm}>
            <Text style={styles.body}>보관한 카드를 모두 지울까요? 되돌릴 수 없어요.</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <View style={{ flex: 1 }}><SecondaryButton label="취소" onPress={() => setConfirm(null)} /></View>
              <View style={{ flex: 1 }}><SecondaryButton label="모두 삭제" tone="danger" onPress={async () => { await clearCards(); setConfirm(null); }} /></View>
            </View>
          </View>
        ) : (
          <SecondaryButton label="보관한 카드 모두 삭제" tone="danger" disabled={cards.length === 0} onPress={() => setConfirm('clear')} />
        )}
      </Section>
    </Screen>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 12, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: C.line },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: C.ice },
  row: { minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowText: { fontSize: 15, color: C.text },
  chevron: { fontSize: 22, color: C.sub },
  avatar: { width: 40, height: 52, borderRadius: 26, borderWidth: 2, borderColor: '#F2F8FF', backgroundColor: '#DCEBF8', overflow: 'hidden' },
  body: { fontSize: 14, lineHeight: 22, color: C.muted },
  small: { fontSize: 14, lineHeight: 20, color: C.sub },
  confirm: { gap: 10, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: C.borderStrong, backgroundColor: C.panel },
});
