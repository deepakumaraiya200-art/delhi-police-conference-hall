import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { CheckCircle2, Fingerprint } from 'lucide-react';
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
    <div className='flex  items-center justify-center min-h-screen bg-[#F5F7FA]'>
      <div className='flex  flex-row justify-between items-center justify-center px-5 rounded-lg py-5 '>

 <form
        onSubmit={handleSubmit(onSubmit as any)}
        className='bg-white  h-auto w-[380px] p-6 flex flex-col gap-3 shadow-sm rounded-md'
      >
        {/* Logo + Title */}
        <div className='flex flex-col items-center'>
          <img
            src='https://ik.imagekit.io/qwzhnpeqg/delhi%20police/Screenshot_2026-06-10_194556-removebg-preview.png'
            className='h-22 w-auto'
            alt='Delhi Police'
          />
          <div className='flex flex-col leading-snug items-center mt-1'>
            <span className='text-[#1A237E] font-bold text-2xl'>
              Delhi <span className='text-red-500 font-bold text-2xl'>Police</span>
            </span>
            <div className='text-neutral-500 text-sm mb-4'>Conference Hall Booking System</div>
          </div>
        </div>

        {/* Heading */}
        <div className='flex flex-col gap-0.5 items-start text-left'>
          <p className='text-black font-bold text-lg'>Login to your account</p>
          <p className='text-sm text-neutral-500/50'>Enter your email below to login to your account</p>
        </div>

        {/* Error Alert */}
        {loginError && (
          <div className='p-3 rounded-md bg-red-50 border border-red-100 flex items-start gap-2'>
            <span className='text-red-600 text-xs font-bold mt-0.5'>!</span>
            <p className='text-sm text-red-700'>{loginError}</p>
          </div>
        )}

        {/* Success */}
        {loginSuccess && (
          <div className='p-3 rounded-md bg-emerald-50 border border-emerald-100 flex items-center gap-2'>
            <CheckCircle2 className='w-4 h-4 text-emerald-600 shrink-0' />
            <p className='text-sm text-emerald-700 font-medium'>Authentication successful! Redirecting...</p>
          </div>
        )}

        {/* Email */}
        <div className='flex flex-col gap-1'>
          <label className='text-sm font-medium text-black text-left'>Email</label>
          <input
            id='email'
            type='email'
            autoComplete='email'
            placeholder='m@example.com'
            className={cn(
              'border rounded-md px-3 py-2 text-sm outline-none transition',
              'autofill:bg-white [&:-webkit-autofill]:![background-color:white] [&:-webkit-autofill]:[box-shadow:0_0_0px_1000px_white_inset]',
              errors.email ? 'border-red-400 focus:border-red-500' : 'border-neutral-500/30 focus:border-[#1A237E]'
            )}
            {...register('email')}
          />
          {errors.email && (
            <p className='text-xs text-red-500 flex items-center gap-1'>
              <span className='w-1 h-1 rounded-full bg-red-500' />
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div className='flex flex-col gap-1'>
          <div className='flex items-center justify-between'>
            <label className='text-sm font-medium text-neutral-700'>Password</label>
            <a href='#' className='text-xs text-[#1A237E] hover:underline'>Forgot your password?</a>
          </div>
          <div className='relative'>
            <input
              id='password'
              type={showPassword ? 'text' : 'password'}
              autoComplete='current-password'
              placeholder='••••••••'
              className={cn(
                'w-full border rounded-md px-3 py-2 pr-10 text-sm outline-none transition',
                '[&:-webkit-autofill]:![background-color:white] [&:-webkit-autofill]:[box-shadow:0_0_0px_1000px_white_inset]',
                errors.password ? 'border-red-400 focus:border-red-500' : 'border-neutral-500/30 focus:border-[#1A237E]'
              )}
              {...register('password')}
            />
            <button
              type='button'
              onClick={() => setShowPassword((prev) => !prev)}
              className='absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500/60 hover:text-[#1A237E] transition'
            >
              {showPassword ? <AiOutlineEyeInvisible size={18} /> : <AiOutlineEye size={18} />}
            </button>
          </div>
          {errors.password && (
            <p className='text-xs text-red-500 flex items-center gap-1'>
              <span className='w-1 h-1 rounded-full bg-red-500' />
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          type='submit'
          disabled={isLoggingIn}
          className='mt-1 px-5 py-2 rounded-sm bg-[#1A237E]/90 text-white font-medium hover:bg-[#151c6b] transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2'
        >
          {isLoggingIn ? (
            loginSuccess ? (
              <><CheckCircle2 className='w-4 h-4' /> Authenticated</>
            ) : (
              <><Fingerprint className='w-4 h-4 animate-pulse' /> Verifying...</>
            )
          ) : (
            'Login'
          )}
        </button>

        <p className='text-center text-sm text-neutral-500'>
          Don't have an account?{' '}
          <a href='/signup' className='text-[#1A237E] font-medium hover:underline'>Sign up</a>
        </p>
      </form>
      </div>
    </div>
  );
}
