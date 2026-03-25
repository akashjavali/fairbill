import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { router } from 'expo-router'

export default function SettingsScreen() {
  const handleLogout = async () => {
    await AsyncStorage.multiRemove(['accessToken', 'refreshToken'])
    router.replace('/(auth)/login')
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb', padding: 16 },
  title: { fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 24 },
  logoutBtn: { backgroundColor: '#fee2e2', borderRadius: 8, padding: 14, alignItems: 'center' },
  logoutText: { color: '#dc2626', fontWeight: '600' },
})
