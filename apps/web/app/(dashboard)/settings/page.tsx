'use client'

import { useAuth } from '@fairbill/hooks'
import { useUsageLimit } from '@fairbill/hooks'
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '@fairbill/ui'
import { useForm } from 'react-hook-form'

export default function SettingsPage() {
  const { user } = useAuth()
  const { usage } = useUsageLimit()

  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    defaultValues: { fullName: user?.fullName ?? '' },
  })

  const onSave = async (data: { fullName: string }) => {
    // TODO: call PATCH /api/users/me
    console.warn('Saving profile:', data)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>

      {/* Profile */}
      <Card>
        <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSave)} className="flex flex-col gap-4">
            <Input label="Full Name" {...register('fullName')} />
            <Input label="Email" value={user?.email ?? ''} disabled hint="Email cannot be changed" />
            <div className="flex justify-end">
              <Button type="submit" size="sm" loading={isSubmitting}>Save Changes</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Plan */}
      <Card>
        <CardHeader><CardTitle>Plan & Usage</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white capitalize">{usage?.plan ?? 'free'} Plan</p>
              <p className="text-sm text-gray-500">
                {usage?.auditsUsedThisMonth ?? 0} / {usage?.plan === 'pro' ? '∞' : (usage?.auditsLimit ?? 2)} audits used this month
              </p>
            </div>
            {usage?.plan === 'free' && (
              <Button size="sm">Upgrade to Pro — ₹499</Button>
            )}
          </div>
          {usage?.plan === 'free' && (
            <div className="rounded-lg bg-brand-50 p-4 dark:bg-brand-950">
              <p className="text-sm font-medium text-brand-800 dark:text-brand-200">Pro Plan includes:</p>
              <ul className="mt-2 space-y-1 text-sm text-brand-700 dark:text-brand-300">
                <li>✓ Unlimited audits</li>
                <li>✓ Negotiation scripts</li>
                <li>✓ PDF reports</li>
                <li>✓ Priority support</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="border-danger-200 dark:border-danger-800">
        <CardHeader><CardTitle className="text-danger-600">Danger Zone</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Delete Account</p>
              <p className="text-sm text-gray-500">Permanently delete your account and all audit data</p>
            </div>
            <Button variant="destructive" size="sm">Delete Account</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
