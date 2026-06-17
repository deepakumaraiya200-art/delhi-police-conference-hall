import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Eye,
  EyeOff,
  Shield,
  Lock,
  Mail,
  Building2,
  ArrowRight,
  CheckCircle2,
  Fingerprint,
} from 'lucide-react';
import { useUserStore } from '@/store/userStore';
import { cn } from '@/lib/utils';

// ── Validation Schema ─────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email / Service ID is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required'),
  rememberMe: z.boolean().default(false),
});

type LoginFormData = z.infer<typeof loginSchema>;

// ── Animated Background Particles ─────────────────────────────────────────────

function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full opacity-10 animate-float"
          style={{
            width: `${Math.random() * 6 + 2}px`,
            height: `${Math.random() * 6 + 2}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            backgroundColor: i % 3 === 0 ? '#c9a84c' : '#ffffff',
            animationDuration: `${Math.random() * 15 + 10}s`,
            animationDelay: `${Math.random() * 5}s`,
          }}
        />
      ))}
    </div>
  );
}

// ── Main Login Page ───────────────────────────────────────────────────────────

export default function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useUserStore();
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema) as any,
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data: LoginFormData) => {
    setLoginError('');
    setIsLoggingIn(true);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const result = login(data.email, data.password);

    if (result.success) {
      setLoginSuccess(true);
      // Animate success then navigate
      await new Promise((resolve) => setTimeout(resolve, 800));
      navigate('/', { replace: true });
    } else {
      setIsLoggingIn(false);
      setLoginError(result.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left Panel: Branding ────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden">
        {/* Dark navy gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-[#0f2344] to-[#0a1628]" />

        {/* Subtle grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />

        {/* Gold accent lines */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#c9a84c] to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#c9a84c] to-transparent" />
        <div className="absolute top-0 left-0 h-full w-1 bg-gradient-to-b from-transparent via-[#c9a84c]/30 to-transparent" />

        <FloatingParticles />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full px-12">
          {/* Delhi Police Emblem */}
          <div className="mb-8 relative">
            <div className="absolute inset-0 blur-3xl bg-[#c9a84c]/10 rounded-full scale-150" />
            <img
              src="/delhi-police-emblem.png"
              alt="Delhi Police Emblem"
              className="w-44 h-44 object-contain relative z-10 drop-shadow-2xl"
            />
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold text-white tracking-tight text-center mb-2">
            Delhi Police
          </h1>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#c9a84c]" />
            <span className="text-[#c9a84c] text-sm font-semibold tracking-[0.3em] uppercase">
              शान्ति सेवा न्याय
            </span>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#c9a84c]" />
          </div>
          <p className="text-blue-200/60 text-sm tracking-wider uppercase mb-12">
            Peace · Service · Justice
          </p>

          {/* System Title */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-6">
              <Building2 className="w-4 h-4 text-[#c9a84c]" />
              <span className="text-white/80 text-sm font-medium">Conference Room Management</span>
            </div>
            <h2 className="text-2xl font-semibold text-white/90 mb-3">
              ConferenceHub
            </h2>
            <p className="text-blue-200/50 text-sm max-w-sm leading-relaxed">
              Centralized booking system for conference halls across
              Police Headquarters — Tower I, Tower II & Bridge Tower
            </p>
          </div>

          {/* Stats row */}
          <div className="mt-12 flex items-center gap-8">
            {[
              { value: '14', label: 'Conference Halls' },
              { value: '3', label: 'Towers' },
              { value: '24/7', label: 'Availability' },
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <p className="text-2xl font-bold text-[#c9a84c]">{stat.value}</p>
                <p className="text-xs text-blue-200/40 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="absolute bottom-8 left-0 right-0 text-center">
            <p className="text-blue-200/30 text-xs">
              © {new Date().getFullYear()} Delhi Police Headquarters · PHQ New Delhi
            </p>
          </div>
        </div>
      </div>

      {/* ── Right Panel: Login Form ─────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-gradient-to-br from-slate-50 to-blue-50/30">
        <div className="w-full max-w-md">
          {/* Mobile header (visible only on mobile) */}
          <div className="lg:hidden text-center mb-8">
            <img
              src="/delhi-police-emblem.png"
              alt="Delhi Police"
              className="w-20 h-20 mx-auto mb-4 object-contain"
            />
            <h1 className="text-xl font-bold text-slate-800">Delhi Police</h1>
            <p className="text-xs text-[#8b7332] font-medium tracking-wider mt-1">
              शान्ति सेवा न्याय
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
            {/* Card header with gold accent */}
            <div className="bg-gradient-to-r from-[#0f2344] to-[#1a3a6e] px-8 py-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#c9a84c]/20 border border-[#c9a84c]/30">
                  <Shield className="w-5 h-5 text-[#c9a84c]" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Secure Login</h2>
                  <p className="text-blue-200/60 text-xs">
                    Conference Room Booking System
                  </p>
                </div>
              </div>
            </div>

            {/* Form body */}
            <div className="px-8 py-8">
              {/* Error Alert */}
              {loginError && (
                <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-100 flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-red-600 text-xs font-bold">!</span>
                  </div>
                  <p className="text-sm text-red-700 leading-relaxed">{loginError}</p>
                </div>
              )}

              {/* Success State */}
              {loginSuccess && (
                <div className="mb-6 p-3.5 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <p className="text-sm text-emerald-700 font-medium">
                    Authentication successful! Redirecting...
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-5">
                {/* Email Field */}
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="text-sm font-medium text-slate-700 flex items-center gap-1.5"
                  >
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    Service Email / ID
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="name@delhipolice.gov.in"
                      className={cn(
                        'w-full h-11 px-4 rounded-xl border text-sm transition-all duration-200',
                        'bg-slate-50/50 focus:bg-white',
                        'placeholder:text-slate-300',
                        'focus:outline-none focus:ring-2 focus:ring-[#0f2344]/20 focus:border-[#0f2344]',
                        errors.email
                          ? 'border-red-300 focus:ring-red-200 focus:border-red-400'
                          : 'border-slate-200'
                      )}
                      {...register('email')}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-red-500" />
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="text-sm font-medium text-slate-700 flex items-center gap-1.5"
                    >
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                      Password
                    </label>
                    <button
                      type="button"
                      className="text-xs text-[#0f2344]/70 hover:text-[#0f2344] font-medium transition-colors"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      className={cn(
                        'w-full h-11 px-4 pr-11 rounded-xl border text-sm transition-all duration-200',
                        'bg-slate-50/50 focus:bg-white',
                        'placeholder:text-slate-300',
                        'focus:outline-none focus:ring-2 focus:ring-[#0f2344]/20 focus:border-[#0f2344]',
                        errors.password
                          ? 'border-red-300 focus:ring-red-200 focus:border-red-400'
                          : 'border-slate-200'
                      )}
                      {...register('password')}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-red-500" />
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Remember Me */}
                <div className="flex items-center gap-2.5">
                  <input
                    id="rememberMe"
                    type="checkbox"
                    className="w-4 h-4 rounded border-slate-300 text-[#0f2344] focus:ring-[#0f2344]/20 cursor-pointer"
                    {...register('rememberMe')}
                  />
                  <label
                    htmlFor="rememberMe"
                    className="text-sm text-slate-600 cursor-pointer select-none"
                  >
                    Keep me signed in
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className={cn(
                    'w-full h-12 rounded-xl font-semibold text-sm transition-all duration-300',
                    'flex items-center justify-center gap-2',
                    'shadow-lg shadow-[#0f2344]/25',
                    loginSuccess
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gradient-to-r from-[#0f2344] to-[#1a3a6e] text-white hover:from-[#0a1a38] hover:to-[#15325e]',
                    'disabled:opacity-60 disabled:cursor-not-allowed',
                    'active:scale-[0.98]'
                  )}
                >
                  {isLoggingIn ? (
                    loginSuccess ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 animate-scale-in" />
                        Authenticated
                      </>
                    ) : (
                      <>
                        <Fingerprint className="w-5 h-5 animate-pulse" />
                        Verifying Credentials...
                      </>
                    )
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Demo Hint */}
              <div className="mt-6 p-3.5 rounded-xl bg-blue-50/50 border border-blue-100/50">
                <p className="text-xs text-blue-600/70 font-medium mb-2">
                  Demo Credentials
                </p>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Email:</span>
                    <code className="text-xs bg-white px-2 py-0.5 rounded font-mono text-slate-700 border border-slate-100">
                      rajesh.kumar@delhipolice.gov.in
                    </code>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Password:</span>
                    <code className="text-xs bg-white px-2 py-0.5 rounded font-mono text-slate-700 border border-slate-100">
                      any password
                    </code>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Security Notice */}
          <div className="mt-6 text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-slate-400">
              <Lock className="w-3 h-3" />
              <span className="text-xs">
                Secured with end-to-end encryption
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Authorized personnel only · Unauthorized access is punishable
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
