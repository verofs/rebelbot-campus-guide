import { useState, useEffect } from 'react';
import { AdminLayout } from './AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string | null;
  location: string | null;
  url: string | null;
  tags: string[];
}

export default function EventsAdmin() {
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    location: '',
    url: '',
    tags: '',
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const { data } = await supabase.from('events').select('*').order('start_time', { ascending: false });
    setEvents(data || []);
    setIsLoading(false);
  };

  const openDialog = (event?: Event) => {
    if (event) {
      setEditingEvent(event);
      setFormData({
        title: event.title,
        description: event.description || '',
        start_time: event.start_time.slice(0, 16),
        end_time: event.end_time?.slice(0, 16) || '',
        location: event.location || '',
        url: event.url || '',
        tags: event.tags?.join(', ') || '',
      });
    } else {
      setEditingEvent(null);
      setFormData({ title: '', description: '', start_time: '', end_time: '', location: '', url: '', tags: '' });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    const payload = {
      title: formData.title,
      description: formData.description || null,
      start_time: formData.start_time,
      end_time: formData.end_time || null,
      location: formData.location || null,
      url: formData.url || null,
      tags: formData.tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean),
    };

    if (editingEvent) {
      const { error } = await supabase.from('events').update(payload).eq('id', editingEvent.id);
      if (error) {
        toast({ title: 'Error', description: 'Failed to update event', variant: 'destructive' });
      } else {
        toast({ title: 'Updated', description: 'Event updated successfully' });
      }
    } else {
      const { error } = await supabase.from('events').insert(payload);
      if (error) {
        toast({ title: 'Error', description: 'Failed to create event', variant: 'destructive' });
      } else {
        toast({ title: 'Created', description: 'Event created successfully' });
      }
    }
    
    setIsDialogOpen(false);
    fetchEvents();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error', description: 'Failed to delete event', variant: 'destructive' });
    } else {
      toast({ title: 'Deleted', description: 'Event deleted successfully' });
      fetchEvents();
    }
  };

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Events</h1>
            <p className="text-muted-foreground">Manage campus events</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => openDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingEvent ? 'Edit Event' : 'Add Event'}</DialogTitle>
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
                  <label className="text-sm font-medium">Start Time *</label>
                  <Input type="datetime-local" value={formData.start_time} onChange={(e) => setFormData({ ...formData, start_time: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium">End Time</label>
                  <Input type="datetime-local" value={formData.end_time} onChange={(e) => setFormData({ ...formData, end_time: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium">Location</label>
                  <Input value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium">Event URL</label>
                  <Input value={formData.url} onChange={(e) => setFormData({ ...formData, url: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium">Tags (comma separated)</label>
                  <Input value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} placeholder="career, networking" />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleSubmit} disabled={!formData.title || !formData.start_time}>{editingEvent ? 'Update' : 'Create'}</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <div key={event.id} className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{event.title}</h3>
                  <p className="text-sm text-muted-foreground">{formatDate(event.start_time)}</p>
                  {event.location && <p className="text-xs text-muted-foreground">{event.location}</p>}
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon-sm" onClick={() => openDialog(event)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(event.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </div>
            ))}
            {events.length === 0 && <p className="text-center py-12 text-muted-foreground">No events yet</p>}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
