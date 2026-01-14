import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Loader2, Lock } from 'lucide-react';
import { format } from 'date-fns';

interface Message {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  profile?: {
    first_name: string | null;
  };
}

interface ClubChatProps {
  clubId: string;
  isFollowing: boolean;
}

export function ClubChat({ clubId, isFollowing }: ClubChatProps) {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isFollowing) {
      setIsLoading(false);
      return;
    }

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('club_messages')
        .select('*')
        .eq('club_id', clubId)
        .order('created_at', { ascending: true })
        .limit(50);

      if (!error && data) {
        // Fetch profile names for messages
        const userIds = [...new Set(data.map(m => m.user_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, first_name')
          .in('id', userIds);

        const messagesWithProfiles = data.map(msg => ({
          ...msg,
          profile: profiles?.find(p => p.id === msg.user_id)
        }));

        setMessages(messagesWithProfiles);
      }
      setIsLoading(false);
    };

    fetchMessages();

    // Set up realtime subscription
    const channel = supabase
      .channel(`club-${clubId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'club_messages',
          filter: `club_id=eq.${clubId}`
        },
        async (payload) => {
          const newMsg = payload.new as Message;
          // Fetch profile for new message
          const { data: profileData } = await supabase
            .from('profiles')
            .select('first_name')
            .eq('id', newMsg.user_id)
            .single();

          setMessages(prev => [...prev, { ...newMsg, profile: profileData || undefined }]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [clubId, isFollowing]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || isSending) return;

    setIsSending(true);
    const { error } = await supabase
      .from('club_messages')
      .insert({
        club_id: clubId,
        user_id: user.id,
        content: newMessage.trim()
      });

    if (!error) {
      setNewMessage('');
    }
    setIsSending(false);
  };

  if (!isFollowing) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
          <Lock className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground font-medium">Follow to access chat</p>
        <p className="text-sm text-muted-foreground mt-1">
          Join this club to chat with other members
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[400px]">
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <p>No messages yet</p>
            <p className="text-sm mt-1">Start the conversation!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => {
              const isOwnMessage = msg.user_id === user?.id;
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      isOwnMessage
                        ? 'bg-primary text-primary-foreground rounded-br-sm'
                        : 'bg-secondary text-secondary-foreground rounded-bl-sm'
                    }`}
                  >
                    {!isOwnMessage && (
                      <p className="text-xs font-medium mb-1 opacity-70">
                        {msg.profile?.first_name || 'Anonymous'}
                      </p>
                    )}
                    <p className="text-sm">{msg.content}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(new Date(msg.created_at), 'h:mm a')}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>

      <form onSubmit={handleSendMessage} className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
            disabled={isSending}
          />
          <Button type="submit" size="icon" disabled={isSending || !newMessage.trim()}>
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
