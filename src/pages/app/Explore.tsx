import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { Search, MapPin, Calendar, Users, Loader2, ExternalLink } from 'lucide-react';
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
  end_time: string | null;
  location: string | null;
  tags: string[];
}

interface Club {
  id: string;
  name: string;
  description: string | null;
  category: string;
  meeting_info: string | null;
  tags: string[];
}

const resourceCategories = ['All', 'Academic', 'Health & Wellness', 'Career', 'Financial', 'Student Services', 'Basic Needs'];
const eventFilters = ['All', 'Today', 'This Week', 'This Month'];
const clubCategories = ['All', 'Academic', 'Social', 'Professional', 'Cultural', 'Sports'];

export default function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'resources');
  const [searchQuery, setSearchQuery] = useState('');
  const [resourceCategory, setResourceCategory] = useState('All');
  const [eventFilter, setEventFilter] = useState('All');
  const [clubCategory, setClubCategory] = useState('All');
  
  const [resources, setResources] = useState<Resource[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [activeTab, resourceCategory, eventFilter, clubCategory, searchQuery]);

  const fetchData = async () => {
    setIsLoading(true);
    
    if (activeTab === 'resources') {
      let query = supabase.from('resources').select('*').order('title');
      
      if (resourceCategory !== 'All') {
        query = query.eq('category', resourceCategory);
      }
      
      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }
      
      const { data } = await query;
      setResources(data || []);
    } else if (activeTab === 'events') {
      let query = supabase
        .from('events')
        .select('*')
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true });
      
      const now = new Date();
      if (eventFilter === 'Today') {
        const endOfDay = new Date(now);
        endOfDay.setHours(23, 59, 59, 999);
        query = query.lte('start_time', endOfDay.toISOString());
      } else if (eventFilter === 'This Week') {
        const endOfWeek = new Date(now);
        endOfWeek.setDate(endOfWeek.getDate() + 7);
        query = query.lte('start_time', endOfWeek.toISOString());
      } else if (eventFilter === 'This Month') {
        const endOfMonth = new Date(now);
        endOfMonth.setMonth(endOfMonth.getMonth() + 1);
        query = query.lte('start_time', endOfMonth.toISOString());
      }
      
      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }
      
      const { data } = await query;
      setEvents(data || []);
    } else if (activeTab === 'clubs') {
      let query = supabase.from('clubs').select('*').order('name');
      
      if (clubCategory !== 'All') {
        query = query.eq('category', clubCategory);
      }
      
      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }
      
      const { data } = await query;
      setClubs(data || []);
    }
    
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

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchParams({ tab: value });
    setSearchQuery('');
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Explore
          </h1>
          <p className="text-muted-foreground">
            Discover resources, events, and clubs at UNLV
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder={`Search ${activeTab}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 text-base rounded-xl"
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="w-full justify-start h-auto p-1 bg-secondary rounded-xl">
            <TabsTrigger value="resources" className="flex-1 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
              Resources
            </TabsTrigger>
            <TabsTrigger value="events" className="flex-1 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
              Events
            </TabsTrigger>
            <TabsTrigger value="clubs" className="flex-1 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
              Clubs
            </TabsTrigger>
          </TabsList>

          {/* Resources Tab */}
          <TabsContent value="resources" className="mt-4 space-y-4">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4 md:mx-0 md:px-0">
              {resourceCategories.map((cat) => (
                <Button
                  key={cat}
                  variant={resourceCategory === cat ? "default" : "chip"}
                  size="chip"
                  onClick={() => setResourceCategory(cat)}
                >
                  {cat}
                </Button>
              ))}
            </div>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : resources.length > 0 ? (
              <div className="grid gap-3 md:grid-cols-2">
                {resources.map((resource) => (
                  <Link key={resource.id} to={`/app/resources/${resource.id}`}>
                    <div className="p-4 rounded-xl border border-border bg-card hover:border-primary/20 hover:shadow-md transition-all h-full">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-accent text-accent-foreground font-medium">
                          {resource.category}
                        </span>
                      </div>
                      <h3 className="font-semibold text-foreground mb-1">
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
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No resources found</p>
                <p className="text-sm text-muted-foreground mt-1">Try a different search or filter</p>
              </div>
            )}
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="mt-4 space-y-4">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4 md:mx-0 md:px-0">
              {eventFilters.map((filter) => (
                <Button
                  key={filter}
                  variant={eventFilter === filter ? "default" : "chip"}
                  size="chip"
                  onClick={() => setEventFilter(filter)}
                >
                  {filter}
                </Button>
              ))}
            </div>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : events.length > 0 ? (
              <div className="grid gap-3 md:grid-cols-2">
                {events.map((event) => (
                  <Link key={event.id} to={`/app/events/${event.id}`}>
                    <div className="p-4 rounded-xl border border-border bg-card hover:border-primary/20 hover:shadow-md transition-all h-full">
                      <div className="flex items-start gap-3">
                        <div className="w-14 h-14 rounded-lg bg-accent flex flex-col items-center justify-center shrink-0">
                          <Calendar className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-foreground mb-1">
                            {event.title}
                          </h3>
                          <p className="text-xs text-primary font-medium mb-1">
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
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No upcoming events</p>
                <p className="text-sm text-muted-foreground mt-1">Check back soon!</p>
              </div>
            )}
          </TabsContent>

          {/* Clubs Tab */}
          <TabsContent value="clubs" className="mt-4 space-y-4">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4 md:mx-0 md:px-0">
              {clubCategories.map((cat) => (
                <Button
                  key={cat}
                  variant={clubCategory === cat ? "default" : "chip"}
                  size="chip"
                  onClick={() => setClubCategory(cat)}
                >
                  {cat}
                </Button>
              ))}
            </div>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : clubs.length > 0 ? (
              <div className="grid gap-3 md:grid-cols-2">
                {clubs.map((club) => (
                  <Link key={club.id} to={`/app/clubs/${club.id}`}>
                    <div className="p-4 rounded-xl border border-border bg-card hover:border-primary/20 hover:shadow-md transition-all h-full">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center shrink-0">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground font-medium">
                              {club.category}
                            </span>
                          </div>
                          <h3 className="font-semibold text-foreground mb-1">
                            {club.name}
                          </h3>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {club.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No clubs found</p>
                <p className="text-sm text-muted-foreground mt-1">Try a different search or filter</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
