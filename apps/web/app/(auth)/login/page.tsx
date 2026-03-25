'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@fairbill/hooks'
import { Button, Input, Card, CardContent, CardHeader, CardTitle, CardDescription } from '@fairbill/ui'

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})
type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    try {
      await login(data.email, data.password)
      router.push('/dashboard')
    } catch (e) {
      setError('root', { message: e instanceof Error ? e.message : 'Login failed' })
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      {/* Logo */}
      <Link href="/" className="mb-8 text-2xl font-bold text-brand-600">FairBill</Link>

      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Welcome back</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />
            {errors.root && (
              <p className="text-sm text-danger-500">{errors.root.message}</p>
            )}
            <div className="flex justify-end">
              <Link href="/forgot-password" className="text-xs text-brand-600 hover:underline">Forgot password?</Link>
            </div>
            <Button type="submit" loading={isSubmitting} className="w-full">Sign In</Button>
          </form>

          <div className="mt-4 text-center text-sm text-gray-500">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-brand-600 hover:underline">Sign up free</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
