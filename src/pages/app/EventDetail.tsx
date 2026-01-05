import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useBookmark } from '@/hooks/useBookmark';
import { ArrowLeft, MapPin, Calendar, Clock, ExternalLink, Bookmark, Loader2 } from 'lucide-react';

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

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isBookmarked, toggleBookmark } = useBookmark('event', id || '');

  useEffect(() => {
    if (!id) return;
    
    const fetchEvent = async () => {
      const { data } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      setEvent(data);
      setIsLoading(false);
    };
    
    fetchEvent();
  }, [id]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!event) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Event not found</p>
          <Link to="/app/explore?tab=events">
            <Button variant="outline">Back to Events</Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Back Button */}
        <Link to="/app/explore?tab=events" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Events
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            {event.title}
          </h1>
          <Button
            variant={isBookmarked ? "default" : "outline"}
            size="icon"
            onClick={toggleBookmark}
            className="shrink-0"
          >
            <Bookmark className={`h-5 w-5 ${isBookmarked ? 'fill-current' : ''}`} />
          </Button>
        </div>

        {/* Description */}
        {event.description && (
          <p className="text-muted-foreground leading-relaxed">
            {event.description}
          </p>
        )}

        {/* Details Card */}
        <div className="p-4 rounded-xl border border-border bg-card space-y-4">
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium text-foreground">Date</p>
              <p className="text-sm text-muted-foreground">{formatDate(event.start_time)}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium text-foreground">Time</p>
              <p className="text-sm text-muted-foreground">
                {formatTime(event.start_time)}
                {event.end_time && ` - ${formatTime(event.end_time)}`}
              </p>
            </div>
          </div>
          
          {event.location && (
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Location</p>
                <p className="text-sm text-muted-foreground">{event.location}</p>
              </div>
            </div>
          )}
        </div>

        {/* Tags */}
        {event.tags && event.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {event.tags.map((tag) => (
              <span key={tag} className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* External Link */}
        {event.url && (
          <a href={event.url} target="_blank" rel="noopener noreferrer">
            <Button className="w-full gap-2">
              <ExternalLink className="h-4 w-4" />
              More Details
            </Button>
          </a>
        )}
      </div>
    </AppLayout>
  );
}
