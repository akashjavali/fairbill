'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button, Input, Card, CardContent, CardHeader, CardTitle, CardDescription } from '@fairbill/ui'
import { api } from '@/lib/api'
import type { APIResponse, AuthTokens } from '@fairbill/types'

const schema = z.object({
  fullName: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})
type FormData = z.infer<typeof schema>

// Extend types for auth response
interface AuthTokensResponse {
  accessToken: string
  refreshToken: string
  user: unknown
}

export default function RegisterPage() {
  const router = useRouter()
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    try {
      const res = await api.post<APIResponse<AuthTokensResponse>>('/api/auth/register', data)
      if (!res.success) {
        setError('root', { message: res.error?.message ?? 'Registration failed' })
        return
      }
      router.push('/dashboard')
    } catch {
      setError('root', { message: 'Something went wrong. Please try again.' })
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <Link href="/" className="mb-8 text-2xl font-bold text-brand-600">FairBill</Link>

      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Create your account</CardTitle>
          <CardDescription>Free — 2 audits per month included</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Input label="Full Name" placeholder="Rahul Sharma" error={errors.fullName?.message} {...register('fullName')} />
            <Input label="Email" type="email" placeholder="you@example.com" error={errors.email?.message} {...register('email')} />
            <Input label="Password" type="password" placeholder="Min. 8 characters" error={errors.password?.message} hint="At least 8 characters" {...register('password')} />
            {errors.root && <p className="text-sm text-danger-500">{errors.root.message}</p>}
            <Button type="submit" loading={isSubmitting} className="w-full">Create Account</Button>
          </form>
          <p className="mt-4 text-center text-xs text-gray-500">
            By signing up, you agree to our Terms and Privacy Policy.
          </p>
          <div className="mt-4 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link href="/login" className="text-brand-600 hover:underline">Sign in</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
