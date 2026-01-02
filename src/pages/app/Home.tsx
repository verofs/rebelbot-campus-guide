import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Search, ArrowRight, MapPin, Calendar, Users, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Resource {
  id: string;
  title: string;
  description: string | null;
  category: string;
  location: string | null;
  tags: string[];
}

interface Event {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  location: string | null;
  tags: string[];
}

interface Club {
  id: string;
  name: string;
  description: string | null;
  category: string;
  tags: string[];
}

const quickFilters = [
  'Mental Health', 'Career', 'Financial', 'Tutoring', 'International', 'Research'
];

export default function HomePage() {
  const { profile } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [profile?.interests, activeFilter]);

  const fetchData = async () => {
    setIsLoading(true);
    
    const userInterests = profile?.interests || [];
    const filterTags = activeFilter ? [activeFilter.toLowerCase()] : [];
    
    // Fetch resources
    let resourcesQuery = supabase.from('resources').select('*').limit(4);
    if (filterTags.length > 0) {
      resourcesQuery = resourcesQuery.overlaps('tags', filterTags);
    } else if (userInterests.length > 0) {
      resourcesQuery = resourcesQuery.overlaps('tags', userInterests.map(i => i.toLowerCase()));
    }
    
    // Fetch events
    let eventsQuery = supabase
      .from('events')
      .select('*')
      .gte('start_time', new Date().toISOString())
      .order('start_time', { ascending: true })
      .limit(4);
    
    // Fetch clubs
    let clubsQuery = supabase.from('clubs').select('*').limit(4);
    if (filterTags.length > 0) {
      clubsQuery = clubsQuery.overlaps('tags', filterTags);
    } else if (userInterests.length > 0) {
      clubsQuery = clubsQuery.overlaps('tags', userInterests.map(i => i.toLowerCase()));
    }
    
    const [resourcesRes, eventsRes, clubsRes] = await Promise.all([
      resourcesQuery,
      eventsQuery,
      clubsQuery,
    ]);
    
    setResources(resourcesRes.data || []);
    setEvents(eventsRes.data || []);
    setClubs(clubsRes.data || []);
    setIsLoading(false);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  return (
    <AppLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Hey{profile?.first_name ? `, ${profile.first_name}` : ''}! 👋
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening at UNLV
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search resources, events, clubs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 text-base rounded-xl"
          />
        </div>

        {/* Quick Filters */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4 md:mx-0 md:px-0">
          {quickFilters.map((filter) => (
            <Button
              key={filter}
              variant={activeFilter === filter ? "default" : "chip"}
              size="chip"
              onClick={() => setActiveFilter(activeFilter === filter ? null : filter)}
            >
              {filter}
            </Button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Resources Section */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">
                  Recommended Resources
                </h2>
                <Link to="/app/explore?tab=resources">
                  <Button variant="ghost" size="sm" className="text-primary">
                    View all
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
              
              <div className="grid gap-3 md:grid-cols-2">
                {resources.length > 0 ? resources.map((resource) => (
                  <Link key={resource.id} to={`/app/resources/${resource.id}`}>
                    <div className="p-4 rounded-xl border border-border bg-card hover:border-primary/20 hover:shadow-md transition-all">
                      <h3 className="font-semibold text-foreground mb-1 line-clamp-1">
                        {resource.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {resource.description}
                      </p>
                      {resource.location && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {resource.location}
                        </div>
                      )}
                    </div>
                  </Link>
                )) : (
                  <p className="text-muted-foreground text-sm col-span-2 py-4 text-center">
                    No resources found. Try a different filter.
                  </p>
                )}
              </div>
            </section>

            {/* Events Section */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">
                  Upcoming Events
                </h2>
                <Link to="/app/explore?tab=events">
                  <Button variant="ghost" size="sm" className="text-primary">
                    View all
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
              
              <div className="grid gap-3 md:grid-cols-2">
                {events.length > 0 ? events.map((event) => (
                  <Link key={event.id} to={`/app/events/${event.id}`}>
                    <div className="p-4 rounded-xl border border-border bg-card hover:border-primary/20 hover:shadow-md transition-all">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-lg bg-accent flex flex-col items-center justify-center shrink-0">
                          <Calendar className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-foreground mb-1 line-clamp-1">
                            {event.title}
                          </h3>
                          <p className="text-xs text-muted-foreground mb-1">
                            {formatDate(event.start_time)}
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
                )) : (
                  <p className="text-muted-foreground text-sm col-span-2 py-4 text-center">
                    No upcoming events found.
                  </p>
                )}
              </div>
            </section>

            {/* Clubs Section */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">
                  Clubs For You
                </h2>
                <Link to="/app/explore?tab=clubs">
                  <Button variant="ghost" size="sm" className="text-primary">
                    View all
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
              
              <div className="grid gap-3 md:grid-cols-2">
                {clubs.length > 0 ? clubs.map((club) => (
                  <Link key={club.id} to={`/app/clubs/${club.id}`}>
                    <div className="p-4 rounded-xl border border-border bg-card hover:border-primary/20 hover:shadow-md transition-all">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center shrink-0">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-foreground mb-1 line-clamp-1">
                            {club.name}
                          </h3>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {club.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                )) : (
                  <p className="text-muted-foreground text-sm col-span-2 py-4 text-center">
                    No clubs found. Try a different filter.
                  </p>
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </AppLayout>
  );
}
