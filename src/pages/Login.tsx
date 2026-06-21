import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import {
  CheckCircle2,
  Fingerprint,
  X,
  Shield,
  Building2,
  Phone,
  Mail,
  ShieldCheck,
  Users,
  UserCog,
} from 'lucide-react';
import { useUserStore } from '@/store/userStore';
import { cn } from '@/lib/utils';
import type { LoginType } from '@/types';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});
type LoginFormData = z.infer<typeof loginSchema>;

const PORTALS: { type: LoginType; label: string; icon: React.ElementType; color: string; activeColor: string; hint: string }[] = [
  {
    type: 'admin',
    label: 'Admin',
    icon: ShieldCheck,
    color: 'text-red-600',
    activeColor: 'border-red-600 bg-red-50',
    hint: 'admin@delhipolice.gov.in / Admin@1234',
  },
  {
    type: 'caretaker',
    label: 'Caretaker',
    icon: UserCog,
    color: 'text-emerald-600',
    activeColor: 'border-emerald-600 bg-emerald-50',
    hint: 'caretaker1@delhipolice.gov.in / Care@1234',
  },
  {
    type: 'officer',
    label: 'Officer Login',
    icon: Users,
    color: 'text-[#1A237E]',
    activeColor: 'border-[#1A237E] bg-blue-50',
    hint: 'cp@delhipolice.gov.in / CP@1234',
  },
];

function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(18)].map((_, i) => (
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

export default function Login() {
  const [activePortal, setActivePortal] = useState<LoginType>('officer');
  const [showAbout, setShowAbout] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  const navigate = useNavigate();
  const { login, isAuthenticated } = useUserStore();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema) as any,
    defaultValues: { email: '', password: '' },
  });

  useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true });
  }, [isAuthenticated, navigate]);

  const handlePortalSwitch = (type: LoginType) => {
    setActivePortal(type);
    setLoginError('');
    reset();
  };

  const onSubmit = async (data: LoginFormData) => {
    setLoginError('');
    setIsLoggingIn(true);
    await new Promise((r) => setTimeout(r, 1000));
    const result = login(data.email, data.password, activePortal);
    if (result.success) {
      setLoginSuccess(true);
      await new Promise((r) => setTimeout(r, 700));
      navigate('/', { replace: true });
    } else {
      setIsLoggingIn(false);
      setLoginError(result.error || 'Login failed. Please check your credentials.');
    }
  };

  const currentPortal = PORTALS.find((p) => p.type === activePortal)!;

  return (
    <div
      className="relative flex items-center justify-center min-h-screen"
      style={{
        backgroundImage: "url('https://ik.imagekit.io/qwzhnpeqg/_1572524008.avif')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-black/50" />
      <FloatingParticles />

      {/* About Us Button */}
      <button
        onClick={() => setShowAbout(true)}
        className="absolute top-4 right-4 z-20 border border-neutral-500/80 font-bold bg-white py-1 px-3 rounded-lg hover:bg-gray-200 transition text-sm"
      >
        About Us
      </button>

      {/* About Modal */}
      {showAbout && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-[480px] max-w-[90vw] overflow-hidden">
            <div className="bg-[#0f2344] px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src="https://ik.imagekit.io/qwzhnpeqg/delhi%20police/Screenshot_2026-06-10_194556-removebg-preview.png"
                  className="h-10 w-auto"
                  alt="Delhi Police"
                />
                <div>
                  <h2 className="text-white font-bold text-lg">Delhi <span className="text-[#c9a84c]">Police</span></h2>
                  <p className="text-blue-200/60 text-xs">Conference Hall Booking System</p>
                </div>
              </div>
              <button onClick={() => setShowAbout(false)} className="text-white/60 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <p className="text-sm text-slate-600 leading-relaxed">
                The <span className="font-semibold text-[#0f2344]">Delhi Police Conference Hall Booking System</span> is
                an official digital platform to streamline reservation and management of conference halls at PHQ, New Delhi.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Shield, label: 'Department', value: 'Delhi Police, PHQ' },
                  { icon: Building2, label: 'Location', value: 'ITO, New Delhi - 110002' },
                  { icon: Phone, label: 'Helpline', value: '011-23490000' },
                  { icon: Mail, label: 'Email', value: 'phq@delhipolice.gov.in' },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="p-1.5 rounded-full border border-neutral-500/30 shrink-0">
                      <Icon className="w-3.5 h-3.5 text-[#0f2344]" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">{label}</p>
                      <p className="text-xs font-semibold text-slate-700">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 rounded-xl bg-[#0f2344]/5 border border-[#0f2344]/10">
                <p className="text-xs text-slate-500 text-center">
                  © {new Date().getFullYear()} Delhi Police · All rights reserved · Authorized personnel only
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Login Card */}
      <div className="relative z-10 w-[420px] max-w-[95vw]">
        {/* Logo */}
        <div className="flex flex-col items-center mb-4">
          <img
            src="https://ik.imagekit.io/qwzhnpeqg/delhi%20police/Screenshot_2026-06-10_194556-removebg-preview.png"
            className="h-20 w-auto drop-shadow-lg"
            alt="Delhi Police"
          />
          <div className="text-center mt-1">
            <p className="text-white font-bold text-2xl drop-shadow">
              Delhi <span className="text-red-400">Police</span>
            </p>
            <p className="text-white/60 text-sm">Conference Hall Booking System</p>
          </div>
        </div>

        {/* Portal Selector */}
        <div className="bg-white/10 backdrop-blur-md rounded-t-xl p-1.5 flex gap-1 border border-white/20">
          {PORTALS.map((portal) => {
            const Icon = portal.icon;
            const isActive = activePortal === portal.type;
            return (
              <button
                key={portal.type}
                onClick={() => handlePortalSwitch(portal.type)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-semibold transition-all',
                  isActive
                    ? 'bg-white text-[#1A237E] shadow-sm'
                    : 'text-white/80 hover:bg-white/10'
                )}
              >
                <Icon className={cn('w-3.5 h-3.5', isActive ? portal.color : '')} />
                {portal.label}
              </button>
            );
          })}
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit as any)}
          className="bg-white rounded-b-xl px-6 py-5 shadow-2xl space-y-4"
        >
          {/* Portal heading */}
          <div className="flex items-center gap-2 pb-1 border-b border-neutral-100">
            {React.createElement(currentPortal.icon, { className: cn('w-4 h-4', currentPortal.color) })}
            <p className="font-semibold text-[#1A237E] text-sm">{currentPortal.label} Portal</p>
          </div>

          {/* Hint */}
          <div className="text-xs text-neutral-400 bg-neutral-50 border border-neutral-100 rounded-lg px-3 py-2">
            Demo: <span className="font-mono text-neutral-600">{currentPortal.hint}</span>
          </div>

          {/* Error */}
          {loginError && (
            <div className="p-3 rounded-md bg-red-50 border border-red-100 flex items-start gap-2">
              <span className="text-red-600 text-xs font-bold mt-0.5">!</span>
              <p className="text-sm text-red-700">{loginError}</p>
            </div>
          )}

          {/* Success */}
          {loginSuccess && (
            <div className="p-3 rounded-md bg-emerald-50 border border-emerald-100 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <p className="text-sm text-emerald-700 font-medium">Authentication successful! Redirecting...</p>
            </div>
          )}

          {/* Email */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-neutral-700">Email / Service ID</label>
            <input
              type="email"
              autoComplete="email"
              placeholder="name@delhipolice.gov.in"
              className={cn(
                'w-full border rounded-md px-3 py-2 text-sm outline-none transition',
                '[&:-webkit-autofill]:![background-color:white] [&:-webkit-autofill]:[box-shadow:0_0_0px_1000px_white_inset]',
                errors.email
                  ? 'border-red-400 focus:border-red-500'
                  : 'border-neutral-300 focus:border-[#1A237E]'
              )}
              {...register('email')}
            />
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-neutral-700">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                className={cn(
                  'w-full border rounded-md px-3 py-2 pr-10 text-sm outline-none transition',
                  '[&:-webkit-autofill]:![background-color:white] [&:-webkit-autofill]:[box-shadow:0_0_0px_1000px_white_inset]',
                  errors.password
                    ? 'border-red-400 focus:border-red-500'
                    : 'border-neutral-300 focus:border-[#1A237E]'
                )}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-[#1A237E] transition"
              >
                {showPassword ? <AiOutlineEyeInvisible size={18} /> : <AiOutlineEye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full mt-1 px-5 py-2.5 rounded-md bg-[#1A237E] text-white font-semibold hover:bg-[#151c6b] transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
          >
            {isLoggingIn ? (
              loginSuccess ? (
                <><CheckCircle2 className="w-4 h-4" /> Authenticated</>
              ) : (
                <><Fingerprint className="w-4 h-4 animate-pulse" /> Verifying...</>
              )
            ) : (
              `Sign In as ${currentPortal.label}`
            )}
          </button>

          <p className="text-center text-xs text-neutral-400">
            Authorized personnel only · Delhi Police PHQ
          </p>
        </form>
      </div>
    </div>
  );
}
