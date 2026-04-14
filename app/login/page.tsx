'use client';

import React, { useState } from 'react';
import { Music, Lock, User, Loader2, Sparkles } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('falwk@admin.local');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (res.ok) {
                window.location.href = '/';
            } else {
                const data = await res.json();
                setError(data.error || 'Access Denied');
            }
        } catch (err) {
            setError('Studio connection failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#020202] text-white flex items-center justify-center p-6 relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-pink-600/10 rounded-full blur-[120px] animate-pulse" />

            <div className="w-full max-w-md relative">
                {/* Logo Header */}
                <div className="flex flex-col items-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                    <div className="w-20 h-20 bg-gradient-to-tr from-purple-600 via-pink-500 to-orange-400 rounded-3xl flex items-center justify-center shadow-2xl shadow-purple-500/20 rotate-6 mb-6">
                        <Music className="text-white w-10 h-10" />
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter mb-2">
                        LYRIC<span className="text-purple-500">LAB</span>
                    </h1>
                    <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
                        <Sparkles size={12} className="text-yellow-500" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">V7 Studio Master</span>
                    </div>
                </div>

                {/* Login Form */}
                <form 
                    onSubmit={handleLogin}
                    className="bg-zinc-900/40 backdrop-blur-3xl border border-white/10 p-10 rounded-[2.5rem] shadow-2xl space-y-6 animate-in fade-in zoom-in duration-700 delay-200"
                >
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Access Email</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                            <input 
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                                placeholder="name@admin.local"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Studio Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                            <input 
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                                placeholder="••••••••••••"
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-medium text-center animate-shake">
                            {error}
                        </div>
                    )}

                    <button 
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-xl shadow-purple-500/20 transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3"
                    >
                        {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Unlock Studio'}
                    </button>
                    
                    <p className="text-center text-[9px] text-zinc-600 font-bold uppercase tracking-widest">
                        Protected Workspace &bull; Lyric Lab Enterprise
                    </p>
                </form>
            </div>
        </div>
    );
}
