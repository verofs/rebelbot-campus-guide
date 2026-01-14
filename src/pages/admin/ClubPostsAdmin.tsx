import { useState, useEffect } from 'react';
import { AdminLayout } from './AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';

interface Club {
  id: string;
  name: string;
}

interface ClubPost {
  id: string;
  club_id: string;
  title: string;
  content: string | null;
  image_url: string | null;
  created_at: string;
  club?: Club;
}

export default function ClubPostsAdmin() {
  const { toast } = useToast();
  const [posts, setPosts] = useState<ClubPost[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<ClubPost | null>(null);
  const [formData, setFormData] = useState({
    club_id: '',
    title: '',
    content: '',
    image_url: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [postsResult, clubsResult] = await Promise.all([
      supabase.from('club_posts').select('*').order('created_at', { ascending: false }),
      supabase.from('clubs').select('id, name').order('name')
    ]);
    
    const postsData = postsResult.data || [];
    const clubsData = clubsResult.data || [];
    
    // Map club names to posts
    const postsWithClubs = postsData.map(post => ({
      ...post,
      club: clubsData.find(c => c.id === post.club_id)
    }));
    
    setPosts(postsWithClubs);
    setClubs(clubsData);
    setIsLoading(false);
  };

  const openDialog = (post?: ClubPost) => {
    if (post) {
      setEditingPost(post);
      setFormData({
        club_id: post.club_id,
        title: post.title,
        content: post.content || '',
        image_url: post.image_url || '',
      });
    } else {
      setEditingPost(null);
      setFormData({ club_id: clubs[0]?.id || '', title: '', content: '', image_url: '' });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    const payload = {
      club_id: formData.club_id,
      title: formData.title,
      content: formData.content || null,
      image_url: formData.image_url || null,
    };

    if (editingPost) {
      const { error } = await supabase.from('club_posts').update(payload).eq('id', editingPost.id);
      if (error) {
        toast({ title: 'Error', description: 'Failed to update post', variant: 'destructive' });
      } else {
        toast({ title: 'Updated', description: 'Post updated successfully' });
      }
    } else {
      const { error } = await supabase.from('club_posts').insert(payload);
      if (error) {
        toast({ title: 'Error', description: 'Failed to create post', variant: 'destructive' });
      } else {
        toast({ title: 'Created', description: 'Post created successfully' });
      }
    }
    
    setIsDialogOpen(false);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    
    const { error } = await supabase.from('club_posts').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error', description: 'Failed to delete post', variant: 'destructive' });
    } else {
      toast({ title: 'Deleted', description: 'Post deleted successfully' });
      fetchData();
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Club Posts</h1>
            <p className="text-muted-foreground">Manage club announcements and updates</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => openDialog()} disabled={clubs.length === 0}>
                <Plus className="h-4 w-4 mr-2" />
                Add Post
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingPost ? 'Edit Post' : 'Add Post'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <label className="text-sm font-medium">Club *</label>
                  <select 
                    value={formData.club_id} 
                    onChange={(e) => setFormData({ ...formData, club_id: e.target.value })}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  >
                    {clubs.map(club => <option key={club.id} value={club.id}>{club.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Title *</label>
                  <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium">Content</label>
                  <Textarea value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} rows={4} />
                </div>
                <div>
                  <label className="text-sm font-medium">Image URL</label>
                  <Input value={formData.image_url} onChange={(e) => setFormData({ ...formData, image_url: e.target.value })} placeholder="https://..." />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleSubmit} disabled={!formData.title || !formData.club_id}>
                    {editingPost ? 'Update' : 'Create'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <div key={post.id} className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-accent text-accent-foreground">
                      {post.club?.name || 'Unknown Club'}
                    </span>
                  </div>
                  <h3 className="font-semibold text-foreground">{post.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-1">{post.content}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon-sm" onClick={() => openDialog(post)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(post.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </div>
            ))}
            {posts.length === 0 && <p className="text-center py-12 text-muted-foreground">No posts yet</p>}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
