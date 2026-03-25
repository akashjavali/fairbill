import { useEffect, useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { apiFetch } from '@/lib/api'
import { formatCurrency, formatRelativeTime, scoreToLabel } from '@fairbill/utils'
import type { APIResponse, AuditSummaryDTO } from '@fairbill/types'

export default function AuditsScreen() {
  const [audits, setAudits] = useState<AuditSummaryDTO[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiFetch<APIResponse<AuditSummaryDTO[]>>('/api/audits?limit=50')
      .then(r => setAudits(r.data ?? []))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <View style={styles.center}><ActivityIndicator color="#4f46e5" /></View>

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>My Audits</Text>
      <FlatList
        data={audits}
        keyExtractor={a => a.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No audits yet. Upload your first bill!</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => router.push(`/audit/${item.id}`)}>
            <View style={styles.cardTop}>
              <Text style={styles.cardTitle} numberOfLines={1}>{item.originalFilename ?? 'Untitled Bill'}</Text>
              {item.fairnessScore !== null && (
                <Text style={[styles.score, item.fairnessScore >= 80 ? styles.scoreGreen : item.fairnessScore >= 60 ? styles.scoreYellow : styles.scoreRed]}>
                  {item.fairnessScore}/100
                </Text>
              )}
            </View>
            <View style={styles.cardMeta}>
              <Text style={styles.meta}>{formatRelativeTime(item.createdAt)}</Text>
              {item.potentialSavings !== null && (
                <Text style={styles.savings}>Save {formatCurrency(item.potentialSavings)}</Text>
              )}
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '700', color: '#111827', padding: 16, paddingBottom: 8 },
  list: { padding: 16, gap: 12 },
  empty: { textAlign: 'center', color: '#6b7280', marginTop: 40 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardTitle: { flex: 1, fontSize: 15, fontWeight: '600', color: '#111827', marginRight: 8 },
  score: { fontWeight: '700', fontSize: 14 },
  scoreGreen: { color: '#16a34a' },
  scoreYellow: { color: '#d97706' },
  scoreRed: { color: '#ef4444' },
  cardMeta: { flexDirection: 'row', justifyContent: 'space-between' },
  meta: { fontSize: 13, color: '#6b7280' },
  savings: { fontSize: 13, fontWeight: '600', color: '#16a34a' },
})
