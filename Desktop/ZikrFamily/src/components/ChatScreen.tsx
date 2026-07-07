import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Send } from 'lucide-react';
import { useChat, markMessagesRead } from '../hooks/useChat';
import { SenderType } from '../types';

export default function ChatScreen({
  familyId,
  childId,
  asRole,
  title,
  onBack,
}: {
  familyId: string;
  childId: string;
  asRole: SenderType;
  title: string;
  onBack: () => void;
}) {
  const { messages, loading, sendMessage } = useChat(familyId, childId);
  const [text, setText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Qarama-qarshi tomon yozgan xabarlarni "o'qildi" deb belgilash
    const otherSender: SenderType = asRole === 'parent' ? 'child' : 'parent';
    markMessagesRead(childId, otherSender);
  }, [childId, asRole]);

  function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
  }

  async function handleSend() {
    if (!text.trim()) return;
    const value = text;
    setText('');
    await sendMessage(asRole, value);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex items-center gap-3 px-5 py-4 card-surface border-b border-white/5">
        <button onClick={onBack} className="text-slate-400">
          <ArrowLeft size={20} />
        </button>
        <div className="font-semibold">{title}</div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {loading && <p className="text-slate-400 text-sm text-center">Yuklanmoqda...</p>}
        {!loading && messages.length === 0 && (
          <p className="text-slate-400 text-sm text-center mt-10">
            Hali xabar yo'q. Birinchi xabarni yozing!
          </p>
        )}
        {messages.map((m) => {
          const isMine = m.sender_type === asRole;
          return (
            <div key={m.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                  isMine ? 'bg-accent text-ink rounded-br-sm' : 'card-surface rounded-bl-sm'
                }`}
              >
                <div className="text-sm whitespace-pre-wrap break-words">{m.message_text}</div>
                <div
                  className={`text-[10px] mt-1 ${isMine ? 'text-ink/60' : 'text-slate-500'}`}
                >
                  {formatTime(m.created_at)}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="px-4 py-3 card-surface border-t border-white/5 flex items-center gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend();
          }}
          placeholder="Xabar yozing..."
          className="flex-1 bg-white/5 rounded-full px-4 py-2 outline-none border border-white/10 focus:border-accent"
        />
        <button
          onClick={handleSend}
          disabled={!text.trim()}
          className="w-10 h-10 rounded-full bg-accent text-ink flex items-center justify-center disabled:opacity-40 shrink-0"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
