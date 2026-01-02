import { useState, useRef, useEffect } from 'react';
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

export default function ChatPage() {
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

    // Simple keyword-based response with database lookup
    const query = input.toLowerCase();
    let response = '';
    let suggestedLinks: { title: string; url: string }[] = [];

    try {
      if (query.includes('advising') || query.includes('advisor') || query.includes('class') || query.includes('schedule')) {
        const { data } = await supabase.from('resources').select('*').ilike('title', '%advising%').limit(1);
        response = "I can help you find the right office for academic guidance! For specific class planning and degree requirements, I recommend confirming with an academic advisor directly.";
        if (data && data[0]) {
          suggestedLinks = [{ title: data[0].title, url: `/app/resources/${data[0].id}` }];
        }
      } else if (query.includes('mental health') || query.includes('counseling') || query.includes('stress')) {
        const { data } = await supabase.from('resources').select('*').overlaps('tags', ['mental health', 'wellness', 'counseling']).limit(2);
        response = "Your mental health matters! UNLV has great resources to support your wellbeing.";
        suggestedLinks = (data || []).map(r => ({ title: r.title, url: `/app/resources/${r.id}` }));
      } else if (query.includes('career') || query.includes('job') || query.includes('internship')) {
        const { data } = await supabase.from('resources').select('*').overlaps('tags', ['career', 'jobs', 'internship']).limit(2);
        response = "Looking to launch your career? Check out these resources for resume help, interview prep, and job opportunities!";
        suggestedLinks = (data || []).map(r => ({ title: r.title, url: `/app/resources/${r.id}` }));
      } else if (query.includes('event') || query.includes('happening')) {
        const { data } = await supabase.from('events').select('*').gte('start_time', new Date().toISOString()).order('start_time').limit(3);
        response = "Here are some upcoming events at UNLV!";
        suggestedLinks = (data || []).map(e => ({ title: e.title, url: `/app/events/${e.id}` }));
      } else if (query.includes('club') || query.includes('organization') || query.includes('join')) {
        const { data } = await supabase.from('clubs').select('*').limit(3);
        response = "Looking to get involved? Here are some clubs you might like!";
        suggestedLinks = (data || []).map(c => ({ title: c.name, url: `/app/clubs/${c.id}` }));
      } else {
        response = "I can help you find resources, events, and clubs at UNLV! Try asking about mental health services, career help, upcoming events, or student organizations.";
      }
    } catch (error) {
      response = "I'm having trouble right now. Please try again!";
    }

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response,
      suggestedLinks,
    };

    setMessages((prev) => [...prev, assistantMessage]);
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
                <p className="text-sm">{message.content}</p>
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

        <div className="flex gap-2 pt-4 border-t border-border">
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
    </AppLayout>
  );
}
