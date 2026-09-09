import React, { useState, useRef, useEffect } from 'react';
import { Send, ArrowLeft, MoreHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Message {
  id: string;
  sender: 'user' | 'marvin';
  text: string;
  timestamp: Date;
}

const MailaDaiChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'marvin',
      text: "Namaste! I'm Maila Dai. First, I need to know where you want to go. Got any dream destinations in mind, or should I throw some ideas your way?",
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    // Add user message
    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputText,
      timestamp: new Date()
    };

    const next = [...messages, userMsg];
    setMessages(next);
    setInputText('');
    setIsTyping(true);

    const send = async () => {
      try {
        const base = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '/api/v1' : 'https://guides-nepal.onrender.com/api/v1');
        const resp = await fetch(`${base}/ai/chat/stream`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: next.map(m => ({
              role: m.sender === 'user' ? 'user' : 'assistant',
              content: m.text
            }))
          })
        });
        if (!resp.ok || !resp.body) throw new Error('Failed to get reply');
        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let text = '';
        setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), sender: 'marvin', text: '', timestamp: new Date() }]);
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          text += chunk;
          setMessages(prev => {
            const copy = [...prev];
            const idx = copy.findIndex(m => m.sender === 'marvin' && m.text === '');
            if (idx !== -1) {
              copy[idx] = { ...copy[idx], text };
            } else {
              copy[copy.length - 1] = { ...copy[copy.length - 1], text };
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
              messages: next.map(m => ({
                role: m.sender === 'user' ? 'user' : 'assistant',
                content: m.text
              }))
            })
          });
          if (resp2.ok) {
            const data2 = await resp2.json();
            const marvinMsg: Message = {
              id: (Date.now() + 1).toString(),
              sender: 'marvin',
              text: data2.reply,
              timestamp: new Date()
            };
            setMessages(prev => [...prev, marvinMsg]);
          } else {
            const marvinMsg: Message = {
              id: (Date.now() + 1).toString(),
              sender: 'marvin',
              text: 'I’m here—tell me more and I’ll help plan or suggest places.',
              timestamp: new Date()
            };
            setMessages(prev => [...prev, marvinMsg]);
          }
        } catch {
          const marvinMsg: Message = {
            id: (Date.now() + 1).toString(),
            sender: 'marvin',
            text: 'I’m here—tell me more and I’ll help plan or suggest places.',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, marvinMsg]);
        }
      } finally {
        setIsTyping(false);
      }
    };
    send();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Minimal Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Link to="/" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white overflow-hidden">
               <img 
                 src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&h=100&q=80" 
                 alt="Marvin" 
                 className="w-full h-full object-cover"
               />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 text-sm leading-tight">Maila Dai</h1>
              <p className="text-xs text-green-500 font-medium leading-tight">Online</p>
            </div>
          </div>
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-full text-gray-400">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </header>

      {/* Chat Area */}
      <main className="flex-grow flex flex-col max-w-2xl mx-auto w-full p-4 pb-24">
        <div className="space-y-6 flex-grow">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex max-w-[80%] md:max-w-[70%] gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                <div className="flex-shrink-0 mt-auto">
                  {msg.sender === 'marvin' ? (
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-100 shadow-sm">
                      <img 
                        src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&h=100&q=80" 
                        alt="Marvin" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs font-bold">
                      You
                    </div>
                  )}
                </div>

                {/* Message Bubble */}
                <div 
                  className={`p-4 rounded-2xl shadow-sm text-[15px] leading-relaxed ${
                    msg.sender === 'user' 
                      ? 'bg-primary text-white rounded-tr-none' 
                      : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex w-full justify-start">
              <div className="flex max-w-[80%] gap-3">
                <div className="flex-shrink-0 mt-auto">
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-100 shadow-sm">
                    <img 
                      src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&h=100&q=80" 
                      alt="Marvin" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-tl-none shadow-sm">
                  <div className="flex gap-1.5 items-center h-5">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4">
        <div className="max-w-2xl mx-auto w-full">
          <form onSubmit={handleSendMessage} className="relative flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your message..."
              className="flex-grow bg-gray-100 text-gray-900 placeholder-gray-500 rounded-full px-6 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              autoFocus
            />
            <button 
              type="submit"
              disabled={!inputText.trim()}
              className="bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:hover:bg-primary text-white p-3.5 rounded-full transition-colors shadow-sm flex-shrink-0"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
          <div className="text-center mt-2">
             <p className="text-[10px] text-gray-400">Maila Dai can make mistakes. Check important info.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MailaDaiChatPage;
