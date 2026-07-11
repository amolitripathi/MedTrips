import React, { useState } from 'react';
import { auth, googleProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from '../lib/firebase';
import { User, LogIn, Mail, Lock, UserPlus, Sparkles, X } from 'lucide-react';
import { motion } from 'motion/react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      onClose();
    } catch (err: any) {
      let msg = err.message || 'Failed to sign in with Google';
      if (err.code === 'auth/popup-closed-by-user') {
        msg = 'Sign-in popup was closed before completion.';
      } else if (err.code === 'auth/unauthorized-domain') {
        msg = 'This domain is not authorized for Google sign-in. Please add your published app domain to Firebase Console -> Authentication -> Settings -> Authorized domains.';
      } else if (err.code === 'auth/popup-blocked') {
        msg = 'Popup was blocked by your browser. Please allow popups for this site.';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onClose();
    } catch (err: any) {
      let msg = err.message || 'Authentication failed';
      if (err.code === 'auth/operation-not-allowed') {
        msg = 'Email/Password sign-in is disabled in your Firebase Console. Please open Firebase Console -> Authentication -> Sign-in method, and enable "Email/Password".';
      } else if (err.code === 'auth/unauthorized-domain') {
        msg = 'This domain is not authorized in your Firebase project. Please add your domain to Firebase Console -> Authentication -> Settings -> Authorized domains.';
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        msg = 'Invalid email or password. Please verify your credentials or sign up.';
      } else if (err.code === 'auth/email-already-in-use') {
        msg = 'An account with this email already exists. Please sign in instead.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Password should be at least 6 characters long.';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-white relative"
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mx-auto mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            {isSignUp ? 'Create MedTrips Account' : 'Sign in to MedTrips'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Sync your study hours across devices, make friends, and compete on leaderboards.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full mb-4 bg-white hover:bg-slate-100 text-slate-900 font-semibold py-3 px-4 rounded-xl transition flex items-center justify-center space-x-3 shadow-lg cursor-pointer disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span className="text-sm">Continue with Google</span>
        </button>

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-slate-800"></div>
          <span className="flex-shrink mx-4 text-xs text-slate-500 uppercase">or email</span>
          <div className="flex-grow border-t border-slate-800"></div>
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-4 mt-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 rounded-xl transition shadow-lg shadow-indigo-600/30 cursor-pointer disabled:opacity-50 text-sm flex items-center justify-center space-x-2"
          >
            {isSignUp ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
            <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
          </button>
        </form>

        <div className="mt-6 text-center space-y-3">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs text-indigo-400 hover:text-indigo-300 transition cursor-pointer block w-full"
          >
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>

          <div className="pt-2 border-t border-slate-800">
            <button
              onClick={onClose}
              className="text-xs text-slate-400 hover:text-white transition cursor-pointer underline underline-offset-4"
            >
              Continue as Guest / Local Mode (No login required)
            </button>
          </div>
        </div>

        <div className="mt-4 p-3 bg-slate-800/50 rounded-2xl border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
          <span className="font-semibold text-slate-300">Why "Unauthorized Domain"?</span> Firebase restricts sign-in popups by domain. To use Google Sign-in on this published URL, add your app domain to your <span className="text-indigo-400 font-medium">Firebase Console &gt; Authentication &gt; Settings &gt; Authorized domains</span>. Alternatively, use <span className="text-white font-medium">Guest Mode</span> above to use the app instantly!
        </div>
      </motion.div>
    </div>
  );
};
