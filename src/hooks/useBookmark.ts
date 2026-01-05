import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

export function useBookmark(itemType: 'resource' | 'event' | 'club', itemId: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user || !itemId) return;
    
    const checkBookmark = async () => {
      const { data } = await supabase
        .from('bookmarks')
        .select('id')
        .eq('user_id', user.id)
        .eq('item_type', itemType)
        .eq('item_id', itemId)
        .maybeSingle();
      
      setIsBookmarked(!!data);
      setIsLoading(false);
    };
    
    checkBookmark();
  }, [user, itemType, itemId]);

  const toggleBookmark = async () => {
    if (!user) return;
    
    if (isBookmarked) {
      await supabase
        .from('bookmarks')
        .delete()
        .eq('user_id', user.id)
        .eq('item_type', itemType)
        .eq('item_id', itemId);
      
      setIsBookmarked(false);
      toast({ title: 'Removed', description: 'Removed from saved items' });
    } else {
      await supabase.from('bookmarks').insert({
        user_id: user.id,
        item_type: itemType,
        item_id: itemId,
      });
      
      setIsBookmarked(true);
      toast({ title: 'Saved', description: 'Added to saved items' });
    }
  };

  return { isBookmarked, isLoading, toggleBookmark };
}
