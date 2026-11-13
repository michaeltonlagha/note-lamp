import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { BookOpenText, ArrowRight, Mail, Lock, Eye, EyeOff, ArrowLeft, UserPlus, LogIn } from 'lucide-react';

const SPLASH_IMG = 'https://images.pexels.com/photos/29756525/pexels-photo-29756525.jpeg?auto=compress&cs=tinysrgb&h=1200';

type Mode = 'splash' | 'signin' | 'signup';

export function SplashScreen() {
  const { signIn, signUp } = useApp();
  const [mode, setMode] = useState<Mode>('splash');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@') || password.length < 6) {
      setError('Enter a valid email and a password of at least 6 characters.');
      return;
    }
    setLoading(true);
    setError('');

    if (mode === 'signup') {
      const result = await signUp(email, password);
      if (result.error) {
        setError(result.error);
        setLoading(false);
        return;
      }
      // Auto sign-in after signup
      const signInResult = await signIn(email, password);
      if (signInResult.error) {
        setError(signInResult.error);
        setLoading(false);
      }
    } else {
      const result = await signIn(email, password);
      if (result.error) {
        setError(result.error);
        setLoading(false);
      }
    }
  };

  if (mode === 'signin' || mode === 'signup') {
    const isSignUp = mode === 'signup';
    return (
      <div className="fixed inset-0 z-50 bg-midnight-400 flex flex-col">
        <div className="absolute inset-0 bg-gradient-to-b from-midnight-400/80 to-midnight-400">
          <img src={SPLASH_IMG} alt="" className="w-full h-full object-cover opacity-30" />
        </div>
        <div className="relative flex-1 flex flex-col px-6 pt-12 pb-8">
          <button onClick={() => setMode('splash')} className="flex items-center gap-2 text-white/80 hover:text-white mb-8">
            <ArrowLeft size={20} /> <span className="text-sm font-medium">Back</span>
          </button>
          <div className="flex-1 flex flex-col justify-center max-w-sm w-full mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-royal shadow-indigo">
                <BookOpenText size={26} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-white">NoteLamp</h1>
                <p className="text-xs text-white/60">{isSignUp ? 'Create your account' : 'Welcome back'}</p>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/50" />
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  placeholder="Email address"
                  className="w-full bg-white/10 border border-white/20 rounded-xl pl-10 pr-4 py-3.5 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                />
              </div>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/50" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder="Password (min 6 characters)"
                  className="w-full bg-white/10 border border-white/20 rounded-xl pl-10 pr-11 py-3.5 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                />
                <button type="button" onClick={() => setShowPwd(s => !s)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/50 hover:text-white">
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {error && <p className="text-sm text-coral-400">{error}</p>}
              <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60">
                {loading ? 'Please wait...' : (
                  <>
                    {isSignUp ? <><UserPlus size={18} /> Create Account</> : <><LogIn size={18} /> Sign In</>}
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
            <p className="text-center text-sm text-white/50 mt-6">
              {isSignUp ? 'Already have an account? ' : 'New here? '}
              <button
                onClick={() => { setMode(isSignUp ? 'signin' : 'signup'); setError(''); }}
                className="text-indigo-300 font-semibold hover:text-indigo-200"
              >
                {isSignUp ? 'Sign In' : 'Create an account'}
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-midnight-400 flex flex-col">
      <div className="absolute inset-0">
        <img src={SPLASH_IMG} alt="Open Bible in a peaceful setting" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-midnight-400/60 via-midnight-400/55 to-midnight-400/85" />
      </div>
      <div className="relative flex-1 flex flex-col justify-between px-6 pt-16 pb-10">
        <div className="flex flex-col items-center text-center mt-6">
          <div className="flex items-center justify-center w-20 h-20 rounded-3xl bg-indigo-royal shadow-indigo mb-5 ring-4 ring-white/10">
            <BookOpenText size={42} className="text-white" />
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">NoteLamp</h1>
          <p className="text-base text-white/80 mt-3 max-w-xs leading-relaxed">
            Study deeper. Preach clearer. Stay in the Word.
          </p>
        </div>

        <div className="space-y-3">
          <button onClick={() => setMode('signup')} className="btn-primary w-full flex items-center justify-center gap-2 text-base">
            Get Started <ArrowRight size={20} />
          </button>
          <button onClick={() => setMode('signin')} className="w-full text-center text-white/90 font-medium py-2 hover:text-white transition">
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
