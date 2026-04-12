import React from 'react';
import { Music, Video } from 'lucide-react';

export const Navbar = () => {
    return (
        <nav className="h-16 border-b border-gray-800 bg-black flex items-center justify-between px-6 sticky top-0 z-50">
            <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                    <Music className="text-white w-6 h-6" />
                </div>
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                    Lyric Template Generator
                </h1>
            </div>
            
            <div className="flex items-center gap-4">
                <span className="text-xs text-gray-400 border border-gray-700 px-2 py-1 rounded bg-gray-900">
                    MVP v1.0
                </span>
            </div>
        </nav>
    );
};
