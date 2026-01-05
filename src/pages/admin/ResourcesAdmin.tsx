import { useState, useEffect } from 'react';
import { AdminLayout } from './AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';

interface Resource {
  id: string;
  title: string;
  description: string | null;
  category: string;
  location: string | null;
  hours: string | null;
  phone: string | null;
  contact_email: string | null;
  url: string | null;
  tags: string[];
}

const categories = ['Academic', 'Health & Wellness', 'Career', 'Financial', 'Student Services', 'Basic Needs'];

export default function ResourcesAdmin() {
  const { toast } = useToast();
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Academic',
    location: '',
    hours: '',
    phone: '',
    contact_email: '',
    url: '',
    tags: '',
  });

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    const { data } = await supabase.from('resources').select('*').order('title');
    setResources(data || []);
    setIsLoading(false);
  };

  const openDialog = (resource?: Resource) => {
    if (resource) {
      setEditingResource(resource);
      setFormData({
        title: resource.title,
        description: resource.description || '',
        category: resource.category,
        location: resource.location || '',
        hours: resource.hours || '',
        phone: resource.phone || '',
        contact_email: resource.contact_email || '',
        url: resource.url || '',
        tags: resource.tags?.join(', ') || '',
      });
    } else {
      setEditingResource(null);
      setFormData({ title: '', description: '', category: 'Academic', location: '', hours: '', phone: '', contact_email: '', url: '', tags: '' });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    const payload = {
      title: formData.title,
      description: formData.description || null,
      category: formData.category,
      location: formData.location || null,
      hours: formData.hours || null,
      phone: formData.phone || null,
      contact_email: formData.contact_email || null,
      url: formData.url || null,
      tags: formData.tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean),
    };

    if (editingResource) {
      const { error } = await supabase.from('resources').update(payload).eq('id', editingResource.id);
      if (error) {
        toast({ title: 'Error', description: 'Failed to update resource', variant: 'destructive' });
      } else {
        toast({ title: 'Updated', description: 'Resource updated successfully' });
      }
    } else {
      const { error } = await supabase.from('resources').insert(payload);
      if (error) {
        toast({ title: 'Error', description: 'Failed to create resource', variant: 'destructive' });
      } else {
        toast({ title: 'Created', description: 'Resource created successfully' });
      }
    }
    
    setIsDialogOpen(false);
    fetchResources();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resource?')) return;
    
    const { error } = await supabase.from('resources').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error', description: 'Failed to delete resource', variant: 'destructive' });
    } else {
      toast({ title: 'Deleted', description: 'Resource deleted successfully' });
      fetchResources();
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Resources</h1>
            <p className="text-muted-foreground">Manage campus resources</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => openDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Resource
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingResource ? 'Edit Resource' : 'Add Resource'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <label className="text-sm font-medium">Title *</label>
                  <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
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
                  <label className="text-sm font-medium">Location</label>
                  <Input value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium">Hours</label>
                  <Input value={formData.hours} onChange={(e) => setFormData({ ...formData, hours: e.target.value })} placeholder="Mon-Fri 9am-5pm" />
                </div>
                <div>
                  <label className="text-sm font-medium">Phone</label>
                  <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input value={formData.contact_email} onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium">Website URL</label>
                  <Input value={formData.url} onChange={(e) => setFormData({ ...formData, url: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium">Tags (comma separated)</label>
                  <Input value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} placeholder="mental health, wellness" />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleSubmit} disabled={!formData.title}>{editingResource ? 'Update' : 'Create'}</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : (
          <div className="space-y-3">
            {resources.map((resource) => (
              <div key={resource.id} className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-accent text-accent-foreground">{resource.category}</span>
                  </div>
                  <h3 className="font-semibold text-foreground">{resource.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-1">{resource.description}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon-sm" onClick={() => openDialog(resource)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(resource.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </div>
            ))}
            {resources.length === 0 && <p className="text-center py-12 text-muted-foreground">No resources yet</p>}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
