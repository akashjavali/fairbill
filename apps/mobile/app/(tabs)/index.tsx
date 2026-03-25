import { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as DocumentPicker from 'expo-document-picker'
import { router } from 'expo-router'
import { apiFetch } from '@/lib/api'
import type { APIResponse, BillDTO, AuditDTO } from '@fairbill/types'

export default function HomeScreen() {
  const [uploading, setUploading] = useState(false)

  const handleUpload = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/png', 'image/jpeg', 'image/webp'],
      copyToCacheDirectory: true,
    })
    if (result.canceled) return

    setUploading(true)
    try {
      const file = result.assets[0]
      if (!file) return

      const formData = new FormData()
      formData.append('file', { uri: file.uri, name: file.name, type: file.mimeType } as any)
      formData.append('billType', 'medical')
      formData.append('currency', 'INR')

      const billRes = await fetch(`${process.env['EXPO_PUBLIC_API_URL'] ?? 'http://localhost:4000'}/api/bills/upload`, {
        method: 'POST',
        body: formData,
      })
      const billData = await billRes.json() as APIResponse<BillDTO>
      if (!billData.success || !billData.data) {
        Alert.alert('Upload failed', billData.error?.message)
        return
      }

      const auditRes = await apiFetch<APIResponse<AuditDTO>>('/api/audits', {
        method: 'POST',
        body: JSON.stringify({ billId: billData.data.id }),
      })
      if (auditRes.data) {
        router.push(`/audit/${auditRes.data.id}`)
      }
    } catch {
      Alert.alert('Error', 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.logo}>FairBill</Text>
        <Text style={styles.subtitle}>AI-powered bill auditing</Text>

        <TouchableOpacity style={[styles.uploadBtn, uploading && styles.disabled]} onPress={handleUpload} disabled={uploading}>
          {uploading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.uploadIcon}>📄</Text>
              <Text style={styles.uploadText}>Upload a Bill</Text>
              <Text style={styles.uploadHint}>PDF, PNG, JPG — up to 10MB</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.features}>
          {['Line-by-line audit', 'Fairness score', 'Potential savings', 'Plain-English explanation'].map(f => (
            <View key={f} style={styles.feature}>
              <Text style={styles.featureCheck}>✓</Text>
              <Text style={styles.featureText}>{f}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 24, alignItems: 'center' },
  logo: { fontSize: 32, fontWeight: '800', color: '#4f46e5', marginBottom: 4 },
  subtitle: { fontSize: 16, color: '#6b7280', marginBottom: 32 },
  uploadBtn: { width: '100%', backgroundColor: '#4f46e5', borderRadius: 16, padding: 32, alignItems: 'center', marginBottom: 32 },
  disabled: { opacity: 0.6 },
  uploadIcon: { fontSize: 40, marginBottom: 12 },
  uploadText: { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 4 },
  uploadHint: { fontSize: 13, color: '#c7d2fe' },
  features: { width: '100%', gap: 12 },
  feature: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  featureCheck: { color: '#16a34a', fontWeight: '700' },
  featureText: { color: '#374151', fontSize: 15 },
})
