import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Calendar, MapPin } from 'lucide-react';
import { format } from 'date-fns';

interface Event {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  location: string | null;
  tags: string[];
}

interface ClubEventsProps {
  clubName: string;
}

export function ClubEvents({ clubName }: ClubEventsProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      // Find events that contain the club name in title, description, or tags
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true });

      if (!error && data) {
        // Filter events that might be related to this club
        const clubEvents = data.filter(event => 
          event.title.toLowerCase().includes(clubName.toLowerCase()) ||
          event.description?.toLowerCase().includes(clubName.toLowerCase()) ||
          event.tags?.some((tag: string) => 
            tag.toLowerCase().includes(clubName.toLowerCase().split(' ')[0])
          )
        );
        setEvents(clubEvents.slice(0, 5));
      }
      setIsLoading(false);
    };

    fetchEvents();
  }, [clubName]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No upcoming events</p>
        <p className="text-sm mt-1">Check back for future activities</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {events.map((event) => (
        <Link key={event.id} to={`/app/events/${event.id}`}>
          <div className="p-4 rounded-xl border border-border bg-card hover:border-primary/20 hover:shadow-md transition-all">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-lg bg-accent flex flex-col items-center justify-center shrink-0">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-foreground mb-1 line-clamp-1">
                  {event.title}
                </h3>
                <p className="text-xs text-primary font-medium mb-1">
                  {format(new Date(event.start_time), 'EEE, MMM d · h:mm a')}
                </p>
                {event.location && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span className="line-clamp-1">{event.location}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
