import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { ProfileProvider } from '@/state/profile';
import { SessionProvider } from '@/state/session';
import { C } from '@/theme/colors';

export default function RootLayout() {
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
        <Stack.Screen name="mirror-compare" />
        <Stack.Screen name="closing" />
        <Stack.Screen name="safety" options={{ gestureEnabled: false }} />
      </Stack>
    </SessionProvider>
    </ProfileProvider>
  );
}
