'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button, Input, Card, CardContent, CardHeader, CardTitle, CardDescription } from '@fairbill/ui'

const schema = z.object({ email: z.string().email() })
type FormData = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (_data: FormData) => {
    // TODO: call /api/auth/forgot-password
    setSent(true)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <Link href="/" className="mb-8 text-2xl font-bold text-brand-600">FairBill</Link>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Reset password</CardTitle>
          <CardDescription>We&apos;ll send a reset link to your email</CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="text-center text-sm text-success-600">
              Check your inbox for a password reset link.
              <br />
              <Link href="/login" className="mt-4 inline-block text-brand-600 hover:underline">Back to login</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <Input label="Email" type="email" placeholder="you@example.com" error={errors.email?.message} {...register('email')} />
              <Button type="submit" loading={isSubmitting} className="w-full">Send Reset Link</Button>
              <Link href="/login" className="text-center text-sm text-gray-500 hover:underline">Back to login</Link>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
