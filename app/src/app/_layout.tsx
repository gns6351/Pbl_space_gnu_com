import { Gaegu_400Regular, Gaegu_700Bold, useFonts } from '@expo-google-fonts/gaegu';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { ProfileProvider } from '@/state/profile';
import { SessionProvider } from '@/state/session';
import { C } from '@/theme/colors';

export default function RootLayout() {
  // 손글씨 글꼴을 다 읽기 전에는 화면을 그리지 않는다 (글꼴이 깜빡 바뀌는 것 방지)
  const [fontsLoaded] = useFonts({ Gaegu_400Regular, Gaegu_700Bold });
  if (!fontsLoaded) return null;

  return (
    <ProfileProvider>
    <SessionProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: C.bg }, animation: 'fade' }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="consent" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="character" />
        <Stack.Screen name="farewell" />
        <Stack.Screen name="archive" />
        <Stack.Screen name="worry" />
        <Stack.Screen name="guest" />
        <Stack.Screen name="talk" />
        <Stack.Screen name="mirror-pick" />
        <Stack.Screen name="mirror-reflect" options={{ gestureEnabled: false }} />
        <Stack.Screen name="mirror-compare" />
        <Stack.Screen name="closing" />
        <Stack.Screen name="safety" options={{ gestureEnabled: false }} />
      </Stack>
    </SessionProvider>
    </ProfileProvider>
  );
}
