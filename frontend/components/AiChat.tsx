"use client";

import { useState } from 'react';
import { getApiUrl } from '@/lib/orientation-api';
import { Send, User, Bot, Loader2 } from 'lucide-react';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export function AiChat({ studentId }: { studentId: string }) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    const sendMessage = async () => {
        if (!input.trim() || loading) return;

        const userMsg: Message = { role: 'user', content: input };
        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setInput('');
        setLoading(true);

        try {
            const resp = await fetch(getApiUrl('/api/orientation/chat'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentId,
                    messages: newMessages
                })
            });

            const data = await resp.json();
            if (data.text) {
                setMessages([...newMessages, { role: 'assistant', content: data.text }]);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[500px] bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
            <div className="bg-slate-800/50 p-4 border-b border-slate-700 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center">
                    <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h3 className="text-white font-bold">Bideya AI Advisor</h3>
                    <p className="text-xs text-indigo-300">Online & Ready to help</p>
                </div>
            </div>

            <div className="flex-grow overflow-y-auto p-6 space-y-4 scrollbar-hide">
                {messages.length === 0 && (
                    <div className="text-center py-12 text-slate-500">
                        <p>Ask me anything about your recommendations or career paths in Tunisia!</p>
                    </div>
                )}
                {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-4 rounded-2xl flex gap-3 ${m.role === 'user'
                                ? 'bg-indigo-600 text-white rounded-tr-none'
                                : 'bg-slate-800 text-slate-200 rounded-tl-none'
                            }`}>
                            {m.role === 'assistant' && <Bot className="w-5 h-5 flex-shrink-0 mt-1 text-indigo-400" />}
                            <p className="text-sm leading-relaxed">{m.content}</p>
                            {m.role === 'user' && <User className="w-5 h-5 flex-shrink-0 mt-1 text-indigo-300" />}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-slate-800 p-4 rounded-2xl rounded-tl-none flex gap-2">
                            <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
                            <span className="text-sm text-slate-400">Advisor is thinking...</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4 bg-slate-950 border-t border-slate-800">
                <div className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && sendMessage()}
                        placeholder="Type your message..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-4 pr-12 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                    <button
                        onClick={sendMessage}
                        disabled={loading || !input.trim()}
                        className="absolute right-2 top-1.5 p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all disabled:opacity-50"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
