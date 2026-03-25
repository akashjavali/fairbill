import { useEffect, useState } from 'react'
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams } from 'expo-router'
import { apiFetch } from '@/lib/api'
import { formatCurrency, scoreToLabel } from '@fairbill/utils'
import type { APIResponse, AuditDTO } from '@fairbill/types'

export default function AuditDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const [audit, setAudit] = useState<AuditDTO | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    const poll = setInterval(async () => {
      const res = await apiFetch<APIResponse<AuditDTO>>(`/api/audits/${id}`)
      if (res.data) {
        setAudit(res.data)
        setLoading(false)
        if (res.data.status === 'completed' || res.data.status === 'failed') {
          clearInterval(poll)
        }
      }
    }, 3000)
    return () => clearInterval(poll)
  }, [id])

  if (loading || !audit || audit.status === 'pending' || audit.status === 'processing') {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text style={styles.analyzing}>Analyzing your bill...</Text>
      </View>
    )
  }

  const scoreColor = audit.fairnessScore !== null
    ? audit.fairnessScore >= 80 ? '#16a34a' : audit.fairnessScore >= 60 ? '#d97706' : '#ef4444'
    : '#6b7280'

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Score */}
      <View style={styles.scoreCard}>
        <Text style={[styles.scoreNum, { color: scoreColor }]}>{audit.fairnessScore ?? '—'}</Text>
        <Text style={styles.scoreLabel}>{audit.fairnessScore !== null ? scoreToLabel(audit.fairnessScore) : 'Unknown'}</Text>
      </View>

      {/* Stats */}
      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Fair Total</Text>
          <Text style={[styles.statValue, { color: '#4f46e5' }]}>{audit.estimatedFairTotal !== null ? formatCurrency(audit.estimatedFairTotal) : '—'}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Savings</Text>
          <Text style={[styles.statValue, { color: '#16a34a' }]}>{audit.potentialSavings !== null ? formatCurrency(audit.potentialSavings) : '—'}</Text>
        </View>
      </View>

      {/* Explanation */}
      {audit.explanation && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <Text style={styles.explanation}>{audit.explanation}</Text>
        </View>
      )}

      {/* Line items */}
      {audit.lineItems.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Line Items</Text>
          {audit.lineItems.map(item => (
            <View key={item.id} style={styles.lineItem}>
              <View style={styles.lineItemTop}>
                <Text style={styles.lineItemDesc} numberOfLines={2}>{item.description}</Text>
                <Text style={[styles.lineItemStatus,
                  item.status === 'fair' ? styles.fair : item.status === 'high' ? styles.high : styles.overcharged
                ]}>
                  {item.status.toUpperCase()}
                </Text>
              </View>
              <View style={styles.lineItemAmounts}>
                <Text style={styles.charged}>Charged: {formatCurrency(item.chargedAmount)}</Text>
                <Text style={styles.fairAmt}>Fair: {formatCurrency(item.fairAmount)}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 16, gap: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  analyzing: { color: '#6b7280', fontSize: 16 },
  scoreCard: { backgroundColor: '#fff', borderRadius: 16, padding: 24, alignItems: 'center' },
  scoreNum: { fontSize: 56, fontWeight: '800' },
  scoreLabel: { fontSize: 16, fontWeight: '600', color: '#6b7280', marginTop: 4 },
  stats: { flexDirection: 'row', gap: 12 },
  stat: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 16 },
  statLabel: { fontSize: 12, color: '#6b7280', marginBottom: 4 },
  statValue: { fontSize: 18, fontWeight: '700' },
  section: { backgroundColor: '#fff', borderRadius: 12, padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12 },
  explanation: { fontSize: 14, color: '#374151', lineHeight: 22 },
  lineItem: { borderBottomWidth: 1, borderBottomColor: '#f3f4f6', paddingVertical: 12 },
  lineItemTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  lineItemDesc: { flex: 1, fontSize: 14, color: '#111827', marginRight: 8 },
  lineItemStatus: { fontSize: 11, fontWeight: '700', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  fair: { color: '#16a34a', backgroundColor: '#f0fdf4' },
  high: { color: '#d97706', backgroundColor: '#fffbeb' },
  overcharged: { color: '#ef4444', backgroundColor: '#fef2f2' },
  lineItemAmounts: { flexDirection: 'row', gap: 16 },
  charged: { fontSize: 13, color: '#6b7280', textDecorationLine: 'line-through' },
  fairAmt: { fontSize: 13, color: '#16a34a', fontWeight: '600' },
})
