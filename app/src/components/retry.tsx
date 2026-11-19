import { StyleSheet, Text, View } from 'react-native';

import { PrimaryButton, SecondaryButton } from '@/components/buttons';
import { CrayonFrame, plain } from '@/components/crayon';
import { C } from '@/theme/colors';
import { CRAYON, HAND } from '@/theme/fonts';

type Props = {
  title: string;
  message: string;
  onRetry: () => void;
  retryLabel?: string;
  /** 다시 시도 대신 빠져나가는 길 (예: 처음으로) */
  onQuit?: () => void;
  quitLabel?: string;
};

// 서버 응답이 실패했을 때의 안내 카드. 겁주지 않고, 다시 시도할 길과 빠져나갈 길을 함께 준다.
export function RetryCard({ title, message, onRetry, retryLabel = '다시 시도하기', onQuit, quitLabel = '처음으로' }: Props) {
  return (
    <View style={[styles.card, CRAYON && plain]} accessibilityRole="alert">
      {CRAYON ? <CrayonFrame fill="rgba(242,169,156,0.07)" stroke={C.danger} strokeWidth={1.6} radius={16} seed={17} grainOpacity={0.06} grainTone="light" /> : null}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      <View style={{ gap: 8, marginTop: 6 }}>
        <PrimaryButton label={retryLabel} onPress={onRetry} />
        {onQuit ? <SecondaryButton label={quitLabel} onPress={onQuit} /> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, borderRadius: 16, borderWidth: 1, borderColor: C.danger, backgroundColor: 'rgba(242,169,156,0.07)', gap: 4 },
  title: { fontSize: 20, fontFamily: HAND, color: C.text },
  message: { fontSize: 14, lineHeight: 21, color: C.muted },
});
