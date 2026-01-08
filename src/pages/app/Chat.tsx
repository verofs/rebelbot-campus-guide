import { useState, useRef, useEffect, forwardRef } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth';
import { Send, Loader2, Bot, User, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  suggestedLinks?: { title: string; url: string }[];
}

const ChatPage = forwardRef<HTMLDivElement>(function ChatPage(_, ref) {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Hey${profile?.first_name ? ` ${profile.first_name}` : ''}! I'm RebelBot, your UNLV campus companion. Ask me about resources, events, clubs, or anything campus-related!`,
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('chat', {
        body: { message: input.trim(), userId: profile?.id },
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        suggestedLinks: data.suggestedLinks,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm having trouble right now. Please try again!",
      };
      setMessages((prev) => [...prev, assistantMessage]);
    }

    setIsLoading(false);
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100vh-theme(spacing.32))] md:h-[calc(100vh-theme(spacing.16))]">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-foreground">Chat with RebelBot</h1>
          <p className="text-sm text-muted-foreground">Ask me anything about UNLV!</p>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pb-4 scrollbar-thin">
          {messages.map((message) => (
            <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
              {message.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <Bot className="h-4 w-4 text-primary-foreground" />
                </div>
              )}
              <div className={`max-w-[80%] ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary'} rounded-2xl px-4 py-3`}>
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                {message.suggestedLinks && message.suggestedLinks.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs font-medium opacity-70">Suggested:</p>
                    {message.suggestedLinks.map((link, i) => (
                      <Link key={i} to={link.url} className="flex items-center gap-2 text-xs font-medium underline hover:no-underline">
                        <ExternalLink className="h-3 w-3" />
                        {link.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center shrink-0">
                  <User className="h-4 w-4 text-accent-foreground" />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="bg-secondary rounded-2xl px-4 py-3">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="pt-4 border-t border-border space-y-3">
          <div className="flex flex-wrap gap-2">
            {['Find tutoring', 'Upcoming events', 'All RSOs', 'Mental health resources', 'Career help'].map((suggestion) => (
              <Button
                key={suggestion}
                variant="outline"
                size="sm"
                className="rounded-full text-xs"
                onClick={() => {
                  setInput(suggestion);
                }}
                disabled={isLoading}
              >
                {suggestion}
              </Button>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about resources, events, clubs..."
              className="h-12 rounded-xl"
            />
            <Button onClick={handleSend} disabled={isLoading || !input.trim()} size="icon" className="h-12 w-12 rounded-xl">
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
});

export default ChatPage;
