'use client';

import React, { useState } from 'react';
import { Upload, FileText, Layout, Settings, Wand2 } from 'lucide-react';
import { Template } from '@/types';
import { STOCK_TEMPLATES } from '@/config/templates';

interface SidebarProps {
    onAlign: (audio: File, lyrics: string) => void;
    onTemplateChange: (template: Template) => void;
    isAligning: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ onAlign, onTemplateChange, isAligning }) => {
    const [audio, setAudio] = useState<File | null>(null);
    const [lyrics, setLyrics] = useState('');
    const [selectedTemplateId, setSelectedTemplateId] = useState(STOCK_TEMPLATES[0].id);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setAudio(e.target.files[0]);
        }
    };

    return (
        <aside className="w-96 border-r border-gray-800 bg-gray-950 flex flex-col h-full">
            <div className="p-6 flex flex-col gap-8 overflow-y-auto">
                {/* Audio Upload */}
                <section className="flex flex-col gap-4">
                    <div className="flex items-center gap-2 text-gray-300 font-medium">
                        <Upload size={18} />
                        <h2>Audio MP3</h2>
                    </div>
                    <label className="border-2 border-dashed border-gray-800 rounded-xl p-8 cursor-pointer hover:border-purple-600 hover:bg-purple-600/5 transition-all flex flex-col items-center gap-2">
                        <input type="file" accept="audio/mpeg" className="hidden" onChange={handleFileChange} />
                        <div className="bg-gray-800 p-3 rounded-full text-gray-400">
                            <Upload size={20} />
                        </div>
                        <span className="text-sm text-gray-400">
                            {audio ? audio.name : 'Upload MP3 file'}
                        </span>
                    </label>
                </section>

                {/* Lyrics Input */}
                <section className="flex flex-col gap-4">
                    <div className="flex items-center gap-2 text-gray-300 font-medium">
                        <FileText size={18} />
                        <h2>Complete Lyrics</h2>
                    </div>
                    <textarea 
                        className="w-full h-48 bg-gray-900 border border-gray-800 rounded-xl p-4 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600 resize-none"
                        placeholder="Paste lyrics here..."
                        value={lyrics}
                        onChange={(e) => setLyrics(e.target.value)}
                    />
                </section>

                {/* Template Selection */}
                <section className="flex flex-col gap-4">
                    <div className="flex items-center gap-2 text-gray-300 font-medium">
                        <Layout size={18} />
                        <h2>Template</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {['Default', 'Karaoke', 'Modern', 'Minimal'].map((name) => (
                            <button
                                key={name}
                                onClick={() => setSelectedTemplate(name.toLowerCase())}
                                className={`px-4 py-3 rounded-lg text-sm transition-all border ${
                                    selectedTemplate === name.toLowerCase() 
                                    ? 'border-purple-600 bg-purple-600 text-white shadow-lg shadow-purple-900/40' 
                                    : 'border-gray-800 bg-gray-900 text-gray-400 hover:border-gray-700'
                                }`}
                            >
                                {name}
                            </button>
                        ))}
                    </div>
                </section>

                {/* Generate Button */}
                <button 
                    disabled={!audio || !lyrics || isAligning}
                    onClick={() => audio && onAlign(audio, lyrics)}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-gray-800 disabled:to-gray-800 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-xl shadow-purple-900/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                    {isAligning ? (
                        <>
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/20 border-t-white" />
                            Aligning Lyrics...
                        </>
                    ) : (
                        <>
                            <Wand2 size={20} />
                            Generate Timeline
                        </>
                    )}
                </button>
            </div>
            
            <div className="mt-auto p-4 border-t border-gray-800">
                <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Final render via FFmpeg</span>
                    <Settings size={14} className="cursor-pointer hover:text-gray-300" />
                </div>
            </div>
        </aside>
    );
};
