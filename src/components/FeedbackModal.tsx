import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { MessageSquarePlus, Loader2 } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export function FeedbackModal() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const location = useLocation();

  const handleSubmit = async () => {
    if (!message.trim()) return;
    
    setIsSubmitting(true);
    
    const { error } = await supabase.from('feedback').insert({
      user_id: user?.id || null,
      message: message.trim(),
      page: location.pathname,
    });
    
    if (error) {
      toast({ title: 'Error', description: 'Failed to submit feedback', variant: 'destructive' });
    } else {
      toast({ title: 'Thank you!', description: 'Your feedback has been submitted.' });
      setMessage('');
      setOpen(false);
    }
    
    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50 gap-2 shadow-lg"
        >
          <MessageSquarePlus className="h-4 w-4" />
          <span className="hidden md:inline">Feedback</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Your Feedback</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <p className="text-sm text-muted-foreground">
            Help us improve RebelBot! Share your thoughts, report bugs, or suggest new features.
          </p>
          <Textarea
            placeholder="What's on your mind?"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="resize-none"
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting || !message.trim()}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
