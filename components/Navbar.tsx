'use client';

import React from 'react';
import { Music, Video, Plus, Layers, Settings, User } from 'lucide-react';

export const Navbar = () => {
    return (
        <nav className="h-16 border-b border-white/10 bg-black/50 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-50">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gradient-to-tr from-purple-600 via-pink-500 to-orange-400 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20 rotate-3 hover:rotate-0 transition-transform duration-300">
                    <Music className="text-white w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-lg font-black tracking-tight text-white leading-none">
                        LYRIC<span className="text-purple-500">LAB</span>
                    </h1>
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Enterprise Edition</span>
                </div>
            </div>
            
            <div className="flex items-center gap-6">
                <div className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-400">
                    <a href="#" className="hover:text-white transition-colors">Templates</a>
                    <a href="#" className="hover:text-white transition-colors">Library</a>
                    <a href="#" className="hover:text-white transition-colors">Docs</a>
                </div>
                
                <div className="h-6 w-[1px] bg-zinc-800 mx-2" />
                
                <div className="flex items-center gap-3">
                    <button className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-400 hover:text-white">
                        <Settings size={20} />
                    </button>
                    <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-500">
                        <User size={18} />
                    </div>
                </div>
            </div>
        </nav>
    );
};
