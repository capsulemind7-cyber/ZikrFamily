import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Message, SenderType } from '../types';

export function useChat(familyId: string | undefined, childId: string | undefined) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!familyId || !childId) return;
    setLoading(true);
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('family_id', familyId)
      .eq('child_id', childId)
      .order('created_at', { ascending: true });
    setMessages((data as Message[]) ?? []);
    setLoading(false);
  }, [familyId, childId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!familyId || !childId) return;
    const channel = supabase
      .channel(`messages-${childId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `child_id=eq.${childId}`,
        },
        (payload) => {
          const incoming = payload.new as Message;
          setMessages((prev) => {
            if (prev.some((m) => m.id === incoming.id)) return prev;
            return [...prev, incoming];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [familyId, childId]);

  async function sendMessage(sender: SenderType, text: string) {
    if (!familyId || !childId || !text.trim()) return;
    const { data, error } = await supabase
      .from('messages')
      .insert({
        family_id: familyId,
        child_id: childId,
        sender_type: sender,
        message_text: text.trim(),
      })
      .select()
      .single();

    if (!error && data) {
      const inserted = data as Message;
      setMessages((prev) => {
        if (prev.some((m) => m.id === inserted.id)) return prev;
        return [...prev, inserted];
      });
    } else if (error) {
      // eslint-disable-next-line no-console
      console.error('Xabar yuborishda xatolik:', error.message);
    }
  }

  return { messages, loading, sendMessage, reload: load };
}

/** Har bir farzand uchun o'qilmagan (ota-ona tomonidan) xabarlar sonini hisoblaydi. */
export async function fetchUnreadCounts(familyId: string, childIds: string[]) {
  const counts: Record<string, number> = {};
  for (const id of childIds) {
    const { count } = await supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('family_id', familyId)
      .eq('child_id', id)
      .eq('sender_type', 'child')
      .is('read_at', null);
    counts[id] = count ?? 0;
  }
  return counts;
}

export async function markMessagesRead(childId: string, sender: SenderType) {
  await supabase
    .from('messages')
    .update({ read_at: new Date().toISOString() })
    .eq('child_id', childId)
    .eq('sender_type', sender)
    .is('read_at', null);
}
