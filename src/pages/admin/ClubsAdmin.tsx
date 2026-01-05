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
  description: string | null;
  category: string;
  meeting_info: string | null;
  contact_email: string | null;
  url: string | null;
  tags: string[];
}

const categories = ['Academic', 'Social', 'Professional', 'Cultural', 'Sports', 'Service', 'Special Interest'];

export default function ClubsAdmin() {
  const { toast } = useToast();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClub, setEditingClub] = useState<Club | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Academic',
    meeting_info: '',
    contact_email: '',
    url: '',
    tags: '',
  });

  useEffect(() => {
    fetchClubs();
  }, []);

  const fetchClubs = async () => {
    const { data } = await supabase.from('clubs').select('*').order('name');
    setClubs(data || []);
    setIsLoading(false);
  };

  const openDialog = (club?: Club) => {
    if (club) {
      setEditingClub(club);
      setFormData({
        name: club.name,
        description: club.description || '',
        category: club.category,
        meeting_info: club.meeting_info || '',
        contact_email: club.contact_email || '',
        url: club.url || '',
        tags: club.tags?.join(', ') || '',
      });
    } else {
      setEditingClub(null);
      setFormData({ name: '', description: '', category: 'Academic', meeting_info: '', contact_email: '', url: '', tags: '' });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    const payload = {
      name: formData.name,
      description: formData.description || null,
      category: formData.category,
      meeting_info: formData.meeting_info || null,
      contact_email: formData.contact_email || null,
      url: formData.url || null,
      tags: formData.tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean),
    };

    if (editingClub) {
      const { error } = await supabase.from('clubs').update(payload).eq('id', editingClub.id);
      if (error) {
        toast({ title: 'Error', description: 'Failed to update club', variant: 'destructive' });
      } else {
        toast({ title: 'Updated', description: 'Club updated successfully' });
      }
    } else {
      const { error } = await supabase.from('clubs').insert(payload);
      if (error) {
        toast({ title: 'Error', description: 'Failed to create club', variant: 'destructive' });
      } else {
        toast({ title: 'Created', description: 'Club created successfully' });
      }
    }
    
    setIsDialogOpen(false);
    fetchClubs();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this club?')) return;
    
    const { error } = await supabase.from('clubs').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error', description: 'Failed to delete club', variant: 'destructive' });
    } else {
      toast({ title: 'Deleted', description: 'Club deleted successfully' });
      fetchClubs();
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Clubs</h1>
            <p className="text-muted-foreground">Manage student organizations</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => openDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Club
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingClub ? 'Edit Club' : 'Add Club'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <label className="text-sm font-medium">Name *</label>
                  <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} />
                </div>
                <div>
                  <label className="text-sm font-medium">Category *</label>
                  <select 
                    value={formData.category} 
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  >
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Meeting Info</label>
                  <Input value={formData.meeting_info} onChange={(e) => setFormData({ ...formData, meeting_info: e.target.value })} placeholder="Wednesdays 5pm, SU Room 101" />
                </div>
                <div>
                  <label className="text-sm font-medium">Contact Email</label>
                  <Input value={formData.contact_email} onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium">Website URL</label>
                  <Input value={formData.url} onChange={(e) => setFormData({ ...formData, url: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium">Tags (comma separated)</label>
                  <Input value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} placeholder="technology, coding" />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleSubmit} disabled={!formData.name}>{editingClub ? 'Update' : 'Create'}</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : (
          <div className="space-y-3">
            {clubs.map((club) => (
              <div key={club.id} className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-accent text-accent-foreground">{club.category}</span>
                  </div>
                  <h3 className="font-semibold text-foreground">{club.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-1">{club.description}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon-sm" onClick={() => openDialog(club)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(club.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </div>
            ))}
            {clubs.length === 0 && <p className="text-center py-12 text-muted-foreground">No clubs yet</p>}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
