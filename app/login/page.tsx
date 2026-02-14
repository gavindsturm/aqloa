'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('isAuthenticated', 'true')
        localStorage.setItem('userEmail', email)
      }
      router.push('/dashboard')
    }, 500)
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <div className="p-6">
        <Link href="/">
          <button className="flex items-center text-neutral-600 hover:text-neutral-900">
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span className="font-medium">Back to Home</span>
          </button>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-neutral-600">
              {isLogin 
                ? 'Sign in to access your dashboard' 
                : 'Get started with Aqloa today'}
            </p>
          </div>

          <div className="card">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-neutral-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input pl-12"
                    placeholder="you@company.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-neutral-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input pl-12 pr-12"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {isLogin && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember"
                      type="checkbox"
                      className="h-4 w-4 rounded border-neutral-300"
                    />
                    <label htmlFor="remember" className="ml-2 block text-sm text-neutral-700">
                      Remember me
                    </label>
                  </div>
                  <button 
                    type="button"
                    onClick={() => alert('Password reset email sent!')}
                    className="text-sm font-semibold text-neutral-900 hover:text-neutral-700"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full text-lg"
              >
                {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-neutral-600 hover:text-neutral-900 font-medium"
              >
                {isLogin 
                  ? "Don't have an account? Sign up" 
                  : 'Already have an account? Sign in'}
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-neutral-500">
              🎉 <span className="font-semibold">Demo Mode:</span> Use any email/password to access the dashboard
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
