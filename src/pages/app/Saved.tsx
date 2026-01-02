import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Loader2, Trash2, MapPin, Calendar, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SavedPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBookmarks();
  }, [user]);

  const fetchBookmarks = async () => {
    if (!user) return;
    setIsLoading(true);
    
    const { data } = await supabase.from('bookmarks').select('*').eq('user_id', user.id);
    
    if (data) {
      const enriched = await Promise.all(data.map(async (b) => {
        let item = null;
        if (b.item_type === 'resource') {
          const { data: r } = await supabase.from('resources').select('*').eq('id', b.item_id).single();
          item = r;
        } else if (b.item_type === 'event') {
          const { data: e } = await supabase.from('events').select('*').eq('id', b.item_id).single();
          item = e;
        } else if (b.item_type === 'club') {
          const { data: c } = await supabase.from('clubs').select('*').eq('id', b.item_id).single();
          item = c;
        }
        return { ...b, item };
      }));
      setBookmarks(enriched.filter(b => b.item));
    }
    setIsLoading(false);
  };

  const removeBookmark = async (id: string) => {
    await supabase.from('bookmarks').delete().eq('id', id);
    setBookmarks(prev => prev.filter(b => b.id !== id));
    toast({ title: 'Removed', description: 'Bookmark removed.' });
  };

  const getByType = (type: string) => bookmarks.filter(b => b.item_type === type);

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Saved</h1>
          <p className="text-muted-foreground">Your bookmarked items</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : bookmarks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No saved items yet</p>
            <Link to="/app/explore"><Button variant="link">Explore resources</Button></Link>
          </div>
        ) : (
          <Tabs defaultValue="resources">
            <TabsList className="w-full justify-start h-auto p-1 bg-secondary rounded-xl">
              <TabsTrigger value="resources" className="flex-1 rounded-lg">Resources ({getByType('resource').length})</TabsTrigger>
              <TabsTrigger value="events" className="flex-1 rounded-lg">Events ({getByType('event').length})</TabsTrigger>
              <TabsTrigger value="clubs" className="flex-1 rounded-lg">Clubs ({getByType('club').length})</TabsTrigger>
            </TabsList>

            <TabsContent value="resources" className="mt-4 space-y-3">
              {getByType('resource').map(b => (
                <div key={b.id} className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
                  <Link to={`/app/resources/${b.item_id}`} className="flex-1">
                    <h3 className="font-semibold text-foreground">{b.item.title}</h3>
                    {b.item.location && <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />{b.item.location}</p>}
                  </Link>
                  <Button variant="ghost" size="icon-sm" onClick={() => removeBookmark(b.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              ))}
              {getByType('resource').length === 0 && <p className="text-muted-foreground text-sm text-center py-8">No saved resources</p>}
            </TabsContent>

            <TabsContent value="events" className="mt-4 space-y-3">
              {getByType('event').map(b => (
                <div key={b.id} className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
                  <Link to={`/app/events/${b.item_id}`} className="flex-1">
                    <h3 className="font-semibold text-foreground">{b.item.title}</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(b.item.start_time).toLocaleDateString()}</p>
                  </Link>
                  <Button variant="ghost" size="icon-sm" onClick={() => removeBookmark(b.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              ))}
              {getByType('event').length === 0 && <p className="text-muted-foreground text-sm text-center py-8">No saved events</p>}
            </TabsContent>

            <TabsContent value="clubs" className="mt-4 space-y-3">
              {getByType('club').map(b => (
                <div key={b.id} className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
                  <Link to={`/app/clubs/${b.item_id}`} className="flex-1">
                    <h3 className="font-semibold text-foreground">{b.item.name}</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1"><Users className="h-3 w-3" />{b.item.category}</p>
                  </Link>
                  <Button variant="ghost" size="icon-sm" onClick={() => removeBookmark(b.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              ))}
              {getByType('club').length === 0 && <p className="text-muted-foreground text-sm text-center py-8">No saved clubs</p>}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </AppLayout>
  );
}
