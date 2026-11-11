import React, { useState } from 'react';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';
import { MessageSquare } from 'lucide-react';

const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text) return;
    const next: { role: 'user' | 'assistant'; content: string }[] = [...messages, { role: 'user', content: text }];
    setMessages(next);
    setInput('');
    setLoading(true);
    try {
      const base = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '/api/v1' : 'https://guides-nepal.onrender.com/api/v1');
      const resp = await fetch(`${base}/ai/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: next.map(m => ({ role: m.role, content: m.content })),
        }),
      });
      if (!resp.ok || !resp.body) throw new Error('Failed to get reply');
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let assistant = '';
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        assistant += chunk;
        setMessages(prev => {
          const copy = [...prev];
          const idx = copy.findIndex(m => m.role === 'assistant' && m.content === '');
          if (idx !== -1) {
            copy[idx] = { role: 'assistant', content: assistant };
          } else {
            copy[copy.length - 1] = { role: 'assistant', content: assistant };
          }
          return copy;
        });
      }
    } catch {
      try {
        const base = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '/api/v1' : 'https://guides-nepal.onrender.com/api/v1');
        const resp2 = await fetch(`${base}/ai/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: next.map(m => ({ role: m.role, content: m.content })),
          }),
        });
        if (resp2.ok) {
          const data2 = await resp2.json();
          setMessages(prev => [...prev, { role: 'assistant', content: data2.reply }]);
        } else {
          setMessages(prev => [...prev, { role: 'assistant', content: 'I’m here—tell me more and I’ll help plan or suggest places.' }]);
        }
      } catch {
        setMessages(prev => [...prev, { role: 'assistant', content: 'I’m here—tell me more and I’ll help plan or suggest places.' }]);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Header />
      
      <main id="main-content" className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto h-[600px] bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex">
          
          {/* Sidebar: Chat List */}
          <div className="w-1/3 border-r border-gray-100 flex flex-col">
            <div className="p-4 border-b border-gray-100">
              <h2 className="font-bold text-lg text-gray-900">Messages</h2>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {/* Empty State for Sidebar */}
              <div className="p-8 text-center text-gray-500">
                 <p className="text-sm">No conversations yet</p>
              </div>
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col bg-gray-50/50">
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center p-8">
                  <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center text-[#213448] mb-4">
                    <MessageSquare className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Ask Maila Dai</h3>
                  <p className="text-gray-500 max-w-xs">
                    Ask anything about Nepal travel, culture, food, or bookings.
                  </p>
                </div>
              ) : (
                messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${m.role === 'user' ? 'bg-[#213448] text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm'}`}>
                      {m.content}
                    </div>
                  </div>
                ))
              )}
              {loading && (
                <div className="flex justify-start">
                  <div className="px-4 py-2 rounded-2xl text-sm bg-gray-100 text-gray-500 animate-pulse">Typing…</div>
                </div>
              )}
            </div>
            <div className="border-t border-gray-100 p-4 flex items-center gap-3">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') sendMessage(); }}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#213448] focus:border-[#213448] text-sm"
                placeholder="Type your message to Maila Dai…"
              />
              <button
                onClick={sendMessage}
                disabled={loading}
                className="px-5 py-3 rounded-xl bg-[#213448] hover:bg-[#1a2a3a] text-white font-bold text-sm disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </div>

        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ChatPage;
