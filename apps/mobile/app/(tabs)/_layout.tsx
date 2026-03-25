import { Tabs } from 'expo-router'

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#4f46e5', headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: () => null }} />
      <Tabs.Screen name="audits" options={{ title: 'Audits', tabBarIcon: () => null }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings', tabBarIcon: () => null }} />
    </Tabs>
  )
}
