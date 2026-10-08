import { useEffect, useRef, useState, useCallback } from 'react';
import { Send, X, ChevronDown, ChevronUp, GripVertical } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import './MailaDaiWidget.css';

interface Message {
  id: string;
  sender: 'user' | 'marvin';
  text: string;
  timestamp: Date;
}

type WidgetState = 'closed' | 'open' | 'minimized';

export default function MailaDaiWidget() {
  const [state, setState] = useState<WidgetState>('closed');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'marvin',
      text: "Namaste! I'm Maila Dai. First, I need to know where you want to go. Got any dream destinations in mind, or should I throw some ideas your way?",
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [height, setHeight] = useState(420);
  const [isDragging, setIsDragging] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const resizeHandleRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef(0);
  const startHeightRef = useRef(0);

  // Scroll to bottom when messages change
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  // Close on Escape
  useEffect(() => {
    if (state === 'closed') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (state === 'minimized') {
          setState('closed');
        } else {
          setState('closed');
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [state]);

  // Hide widget when booking sheet is open
  const isBookingSheetOpen = useUIStore((s) => s.isBookingSheetOpen);
  useEffect(() => {
    if (isBookingSheetOpen) setState('closed');
  }, [isBookingSheetOpen]);

  // Resize handling
  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    startYRef.current = e.clientY;
    startHeightRef.current = height;
    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
  };

  const handleResizeMove = (e: MouseEvent) => {
    if (!isDragging) return;
    const delta = startYRef.current - e.clientY;
    const newHeight = Math.max(300, Math.min(600, startHeightRef.current + delta));
    setHeight(newHeight);
  };

  const handleResizeEnd = () => {
    setIsDragging(false);
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeEnd);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputText,
      timestamp: new Date(),
    };

    const next = [...messages, userMsg];
    setMessages(next);
    setInputText('');
    setIsTyping(true);

    try {
      const base =
        import.meta.env.VITE_API_URL ||
        (import.meta.env.DEV ? '/api/v1' : 'https://guides-nepal.onrender.com/api/v1');
      const resp = await fetch(`${base}/ai/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: next.map((m) => ({
            role: m.sender === 'user' ? 'user' : 'assistant',
            content: m.text,
          })),
        }),
      });
      if (!resp.ok || !resp.body) throw new Error('Failed to get reply');
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let text = '';
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), sender: 'marvin', text: '', timestamp: new Date() },
      ]);
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        text += chunk;
        setMessages((prev) => {
          const copy = [...prev];
          const idx = copy.findIndex((m) => m.sender === 'marvin' && m.text === '');
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
        const base =
          import.meta.env.VITE_API_URL ||
          (import.meta.env.DEV ? '/api/v1' : 'https://guides-nepal.onrender.com/api/v1');
        const resp2 = await fetch(`${base}/ai/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: next.map((m) => ({
              role: m.sender === 'user' ? 'user' : 'assistant',
              content: m.text,
            })),
          }),
        });
        if (resp2.ok) {
          const data2 = await resp2.json();
          const marvinMsg: Message = {
            id: (Date.now() + 1).toString(),
            sender: 'marvin',
            text: data2.reply,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, marvinMsg]);
        } else {
          const marvinMsg: Message = {
            id: (Date.now() + 1).toString(),
            sender: 'marvin',
            text: 'I\'m here—tell me more and I\'ll help plan or suggest places.',
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, marvinMsg]);
        }
      } catch {
        const marvinMsg: Message = {
          id: (Date.now() + 1).toString(),
          sender: 'marvin',
          text: 'I\'m here—tell me more and I\'ll help plan or suggest places.',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, marvinMsg]);
      }
    } finally {
      setIsTyping(false);
    }
  };

  const toggleMinimize = () => {
    setState((prev) => (prev === 'minimized' ? 'open' : 'minimized'));
  };

  if (isBookingSheetOpen) return null;

  return (
    <div
      className={`maildai-widget ${state}`}
      style={{ height: state === 'open' ? height : undefined }}
      ref={panelRef}
    >
      {(state === 'open' || state === 'minimized') && (
        <div className="maildai-panel" role="dialog" aria-label="Chat with Maila Dai">
          <div className="maildai-panel-header">
            <div className="maildai-header-left">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100&q=80"
                  alt="Marvin"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="maildai-title">Maila Dai</h3>
                <p className="maildai-status">Online</p>
              </div>
            </div>
            <div className="maildai-header-actions">
              <button
                type="button"
                className="maildai-btn"
                aria-label={state === 'minimized' ? 'Expand chat' : 'Minimize chat'}
                onClick={toggleMinimize}
              >
                {state === 'minimized' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
              <button
                type="button"
                className="maildai-btn"
                aria-label="Close chat"
                onClick={() => setState('closed')}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {state === 'open' && (
            <>
              <div
                className="maildai-messages"
                style={{ maxHeight: `calc(${height}px - 160px)` }}
              >
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`maildai-message-row ${msg.sender === 'user' ? 'user' : ''}`}
                  >
                    <div className="maildai-message-wrapper">
                      <div className="maildai-avatar">
                        {msg.sender === 'marvin' ? (
                          <img
                            src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100&q=80"
                            alt="Maila Dai"
                          />
                        ) : (
                          <span>You</span>
                        )}
                      </div>
                      <div className={`maildai-bubble ${msg.sender}`}>
                        {msg.text}
                      </div>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="maildai-message-row">
                    <div className="maildai-message-wrapper">
                      <div className="maildai-avatar">
                        <img
                          src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100&q=80"
                          alt="Maila Dai"
                        />
                      </div>
                      <div className="maildai-bubble marvin maildai-typing">
                        <div className="maildai-typing-dots">
                          <span></span><span></span><span></span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Resize Handle */}
              <div
                ref={resizeHandleRef}
                className="maildai-resize-handle"
                onMouseDown={handleResizeStart}
                role="separator"
                aria-label="Resize chat window"
                aria-orientation="horizontal"
              >
                <GripVertical className="w-5 h-5" />
              </div>

              {/* Input Area */}
              <form className="maildai-input-area" onSubmit={handleSendMessage}>
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type your message..."
                  className="maildai-input"
                  autoFocus
                  disabled={isTyping}
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || isTyping}
                  className="maildai-send"
                  aria-label="Send message"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </>
          )}
        </div>
      )}

      {state === 'closed' && (
        <button
          type="button"
          className="maildai-fab"
          aria-label="Chat with Maila Dai"
          title="Chat with Maila Dai"
          onClick={() => setState('open')}
        >
          <svg
            viewBox="0 0 24 24"
            width="26"
            height="26"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="8" r="5" />
            <path d="M20 21a8 8 0 0 0-16 0" />
            <path d="M8 21h8" />
          </svg>
        </button>
      )}
    </div>
  );
}