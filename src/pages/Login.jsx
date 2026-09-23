import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Flame, Lock, Mail, Eye, EyeOff, ShieldCheck, CheckSquare, Square } from 'lucide-react';

export default function Login() {
  const { login, addToast } = useApp();

  const [email, setEmail] = useState('admin@utsav.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    login(email, password);
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    addToast('Password reset link sent to admin@utsav.com', 'info');
  };

  return (
    <div className="min-h-screen bg-festive-pattern flex items-center justify-center p-4 sm:p-6 select-none">
      
      <div className="max-w-md w-full bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-amber-200/80 overflow-hidden relative animate-fade-in">
        
        {/* Top Decorative Festival Header Bar */}
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-rose-900 p-8 text-center text-white relative overflow-hidden">
          {/* Subtle Background Pattern Accent */}
          <div className="absolute inset-0 bg-white/5 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-2 shadow-lg flex items-center justify-center mb-3">
              <Flame className="w-10 h-10 text-amber-300 fill-amber-400/40" />
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Utsav Vargani
            </h1>
            
            <p className="text-xs font-semibold text-amber-200 mt-1 uppercase tracking-widest">
              Simple • Transparent • Organized
            </p>

            <div className="mt-3 px-3 py-1 bg-white/10 backdrop-blur-xs rounded-full text-[11px] font-medium text-amber-100 border border-white/10">
              गणपती • दहीहंडी • नवरात्र Collection Portal
            </div>
          </div>
        </div>

        {/* Login Form Container */}
        <div className="p-6 sm:p-8">
          
          {/* Dummy Credentials Callout */}
          <div className="mb-6 p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-start space-x-2.5">
            <ShieldCheck className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-bold block">Demo Credentials:</span>
              <span className="font-mono text-[11px]">Email: admin@utsav.com</span> | <span className="font-mono text-[11px]">Pass: admin123</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@utsav.com"
                  className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all font-medium text-stone-900"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all font-medium text-stone-900"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-stone-400 hover:text-stone-700 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs py-1">
              <label
                onClick={() => setRememberMe(!rememberMe)}
                className="flex items-center space-x-2 text-stone-700 font-semibold cursor-pointer"
              >
                {rememberMe ? (
                  <CheckSquare className="w-4 h-4 text-amber-600 fill-amber-100" />
                ) : (
                  <Square className="w-4 h-4 text-stone-400" />
                )}
                <span>Remember me</span>
              </label>

              <button
                type="button"
                onClick={handleForgotPassword}
                className="font-bold text-amber-700 hover:text-amber-800 transition-colors"
              >
                Forgot Password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-amber-600 via-orange-600 to-rose-900 hover:from-amber-700 hover:to-rose-950 text-white font-extrabold text-sm rounded-xl shadow-md shadow-amber-600/20 hover:shadow-lg transition-all duration-200 transform active:scale-[0.99]"
            >
              Sign In to Dashboard
            </button>
          </form>

          {/* Footer Note */}
          <div className="mt-8 pt-4 border-t border-stone-100 text-center text-stone-400 text-xs">
            Shree Ganesh Utsav Mandal Collection Portal © {new Date().getFullYear()}
          </div>

        </div>

      </div>
    </div>
  );
}
