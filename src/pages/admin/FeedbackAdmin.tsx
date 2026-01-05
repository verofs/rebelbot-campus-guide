import { useState, useEffect } from 'react';
import { AdminLayout } from './AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface Feedback {
  id: string;
  message: string;
  page: string | null;
  created_at: string;
  user_id: string | null;
}

export default function FeedbackAdmin() {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeedback = async () => {
      const { data } = await supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false });
      setFeedback(data || []);
      setIsLoading(false);
    };
    
    fetchFeedback();
  }, []);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Feedback</h1>
          <p className="text-muted-foreground">User feedback and suggestions</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : feedback.length > 0 ? (
          <div className="space-y-4">
            {feedback.map((item) => (
              <div key={item.id} className="p-4 rounded-xl border border-border bg-card">
                <p className="text-foreground mb-2">{item.message}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{formatDate(item.created_at)}</span>
                  {item.page && <span>Page: {item.page}</span>}
                  {item.user_id && <span>User: {item.user_id.slice(0, 8)}...</span>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center py-12 text-muted-foreground">No feedback yet</p>
        )}
      </div>
    </AdminLayout>
  );
}
