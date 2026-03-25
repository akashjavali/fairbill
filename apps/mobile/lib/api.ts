import AsyncStorage from '@react-native-async-storage/async-storage'

const API_URL = process.env['EXPO_PUBLIC_API_URL'] ?? 'http://localhost:4000'

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = await AsyncStorage.getItem('accessToken')
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
  return res.json() as Promise<T>
}
