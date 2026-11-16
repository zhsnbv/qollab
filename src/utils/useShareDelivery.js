import { useEffect } from 'react';
import { sharedChatMessages, sharedSourceMessage, subscribeShares } from './sharing';

export default function useShareDelivery(chatId, setMessages, setPhase, sourceId) {
  useEffect(() => {
    if (!chatId) return;
    const sync = () => {
      const source = sourceId && sharedSourceMessage(chatId, sourceId);
      const incoming = [...(source ? [source] : []), ...sharedChatMessages(chatId)];
      if (!incoming.length) return;
      setMessages(previous => {
        const ids = new Set(previous.map(item => item.id));
        const additions = incoming.filter(item => !ids.has(item.id));
        return additions.length ? [...previous, ...additions] : previous;
      });
      setPhase('chat');
    };
    sync();
    return subscribeShares(sync);
  }, [chatId, sourceId, setMessages, setPhase]);
}
