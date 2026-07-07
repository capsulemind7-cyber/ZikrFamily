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
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [familyId, childId]);

  async function sendMessage(sender: SenderType, text: string) {
    if (!familyId || !childId || !text.trim()) return;
    await supabase.from('messages').insert({
      family_id: familyId,
      child_id: childId,
      sender_type: sender,
      message_text: text.trim(),
    });
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
