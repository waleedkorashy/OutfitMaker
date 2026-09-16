import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Gender } from '../types';
import { SparkleIcon } from '../components/ui/Icons';

type Mode = 'login' | 'register' | 'confirm';

interface AuthForm {
  name: string;
  email: string;
  phoneNumber: string;
  gender: Gender;
  password: string;
  confirmPassword: string;
}

export function AuthPage() {
  const { login, register, confirmEmail, resendEmailCode, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from || '/';

  const [mode, setMode] = useState<Mode>('login');
  const [form, setForm] = useState<AuthForm>({
    name: '',
    email: '',
    phoneNumber: '',
    gender: 0,
    password: '',
    confirmPassword: '',
  });
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (isAuthenticated) {
    navigate(from, { replace: true });
    return null;
  }

  function update<K extends keyof AuthForm>(key: K, value: AuthForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function extractMessage(e: unknown): string {
    if (e && typeof e === 'object' && 'message' in e) {
      const msg = (e as { message: unknown }).message;
      if (typeof msg === 'string' && msg.trim()) return msg;
    }
    if (e && typeof e === 'object' && 'response' in e) {
      const r = (e as { response?: { data?: { message?: string } } }).response;
      if (r?.data?.message) {
        const msg = r.data.message.replace(/^Fail\s*/, '').trim();
        if (msg) return msg;
      }
    }
    return 'Something went wrong. Please try again.';
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);

    if (mode === 'register') {
      const words = form.name.trim().split(/\s+/).filter(Boolean);
      if (words.length < 2) {
        setError('Please enter your full name (first and last name).');
        return;
      }
      if (form.password !== form.confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }

    setBusy(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
        navigate(from, { replace: true });
      } else if (mode === 'register') {
        await register({
          name: form.name.trim(),
          phoneNumber: form.phoneNumber,
          gender: form.gender,
          email: form.email,
          password: form.password,
          confirmPassword: form.confirmPassword,
        });
        setMode('confirm');
      } else {
        await confirmEmail(form.email, verificationCode.trim());
        setNotice('Your email is verified. You can sign in now.');
        setMode('login');
      }
    } catch (e: unknown) {
      setError(extractMessage(e));
    } finally {
      setBusy(false);
    }
  }

  async function handleResend() {
    setError(null);
    setNotice(null);
    setBusy(true);
    try {
      await resendEmailCode(form.email);
      setNotice('A new verification code has been sent to your email.');
    } catch (e: unknown) {
      setError(extractMessage(e));
    } finally {
      setBusy(false);
    }
  }

  const inputClass =
    'mt-1 w-full rounded-xl border border-line bg-ivory px-4 py-3 text-sm text-ink placeholder:text-slate-faint focus:border-burgundy/50 focus:outline-none';

  return (
    <div className="container-fit flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-burgundy text-ivory">
            <SparkleIcon className="h-6 w-6" />
          </span>
          <h1 className="mt-4 font-serif text-3xl font-semibold text-ink">
            {mode === 'login' && 'Welcome back'}
            {mode === 'register' && 'Create your account'}
            {mode === 'confirm' && 'Verify your email'}
          </h1>
          <p className="mt-2 text-sm text-slate-soft">
            {mode === 'login' && 'Sign in to save favorites and check out.'}
            {mode === 'register' && 'Join OutFitMaker to shop smarter.'}
            {mode === 'confirm' && 'Enter the code we sent to your inbox.'}
          </p>
        </div>

        <div className="rounded-3xl border border-line bg-white/70 p-7 shadow-sm">
          {mode !== 'confirm' && (
            <div className="mb-6 flex rounded-full bg-cream p-1">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                  setNotice(null);
                }}
                className={`flex-1 rounded-full py-2.5 text-sm font-semibold transition ${
                  mode === 'login' ? 'bg-white text-ink shadow-sm' : 'text-slate-soft'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError(null);
                  setNotice(null);
                }}
                className={`flex-1 rounded-full py-2.5 text-sm font-semibold transition ${
                  mode === 'register' ? 'bg-white text-ink shadow-sm' : 'text-slate-soft'
                }`}
              >
                Sign Up
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label htmlFor="name" className="text-sm font-medium text-ink">Full name</label>
                <input id="name" required value={form.name} onChange={(e) => update('name', e.target.value)} className={inputClass} placeholder="Jane Doe" />
              </div>
            )}

            {mode !== 'confirm' ? (
              <>
                <div>
                  <label htmlFor="email" className="text-sm font-medium text-ink">Email</label>
                  <input id="email" type="email" required value={form.email} onChange={(e) => update('email', e.target.value)} className={inputClass} placeholder="you@example.com" />
                </div>

                {mode === 'register' && (
                  <>
                    <div>
                      <label htmlFor="phone" className="text-sm font-medium text-ink">Phone number</label>
                      <input id="phone" required value={form.phoneNumber} onChange={(e) => update('phoneNumber', e.target.value)} className={inputClass} placeholder="01234567890" />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-ink">Gender</span>
                      <div className="mt-1 grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => update('gender', 0)}
                          aria-pressed={form.gender === 0}
                          className={`rounded-full border py-2.5 text-sm font-medium transition ${form.gender === 0 ? 'border-ink bg-ink text-ivory' : 'border-line bg-white text-charcoal'}`}
                        >
                          Male
                        </button>
                        <button
                          type="button"
                          onClick={() => update('gender', 1)}
                          aria-pressed={form.gender === 1}
                          className={`rounded-full border py-2.5 text-sm font-medium transition ${form.gender === 1 ? 'border-ink bg-ink text-ivory' : 'border-line bg-white text-charcoal'}`}
                        >
                          Female
                        </button>
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label htmlFor="password" className="text-sm font-medium text-ink">Password</label>
                  <input id="password" type="password" required minLength={6} value={form.password} onChange={(e) => update('password', e.target.value)} className={inputClass} placeholder="••••••••" />
                </div>

                {mode === 'register' && (
                  <div>
                    <label htmlFor="confirm" className="text-sm font-medium text-ink">Confirm password</label>
                    <input id="confirm" type="password" required minLength={6} value={form.confirmPassword} onChange={(e) => update('confirmPassword', e.target.value)} className={inputClass} placeholder="••••••••" />
                  </div>
                )}
              </>
            ) : (
              <>
                <p className="rounded-xl bg-cream px-4 py-3 text-sm text-ink">
                  We sent a 4-digit verification code to <span className="font-semibold">{form.email}</span>.
                  Enter it below to activate your account.
                </p>
                <div>
                  <label htmlFor="code" className="text-sm font-medium text-ink">Verification code</label>
                  <input
                    id="code"
                    required
                    inputMode="numeric"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                    maxLength={4}
                    className={`${inputClass} text-center text-lg tracking-[0.5em]`}
                    placeholder="••••"
                    autoFocus
                  />
                </div>
                <button type="button" onClick={handleResend} disabled={busy} className="text-sm font-medium text-burgundy hover:underline disabled:opacity-50">
                  Didn't receive a code? Resend
                </button>
                <p className="rounded-xl bg-gold/15 px-4 py-3 text-xs text-charcoal">
                  Tip: check your spam or junk folder — verification emails sometimes land there.
                </p>
              </>
            )}

            {error && <p className="rounded-xl bg-burgundy/10 px-3 py-2 text-sm text-burgundy">{error}</p>}
            {notice && <p className="rounded-xl bg-gold/15 px-3 py-2 text-sm text-charcoal">{notice}</p>}

            <button type="submit" disabled={busy} className="btn-primary w-full">
              {busy
                ? 'Please wait…'
                : mode === 'login'
                  ? 'Sign In'
                  : mode === 'register'
                    ? 'Create Account'
                    : 'Verify & Continue'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}