import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useBookmark } from '@/hooks/useBookmark';
import { useFollow } from '@/hooks/useFollow';
import { ClubPosts } from '@/components/club/ClubPosts';
import { ClubEvents } from '@/components/club/ClubEvents';
import { ClubChat } from '@/components/club/ClubChat';
import { 
  ArrowLeft, Users, Mail, Clock, ExternalLink, Bookmark, Loader2, 
  UserPlus, UserMinus, FileText, Calendar, MessageCircle 
} from 'lucide-react';

interface Club {
  id: string;
  name: string;
  description: string | null;
  category: string;
  meeting_info: string | null;
  contact_email: string | null;
  url: string | null;
  tags: string[];
  image_url: string | null;
}

export default function ClubDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [club, setClub] = useState<Club | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');
  const { isBookmarked, toggleBookmark } = useBookmark('club', id || '');
  const { isFollowing, isLoading: followLoading, followerCount, toggleFollow } = useFollow(id || '');

  useEffect(() => {
    if (!id) return;
    
    const fetchClub = async () => {
      const { data } = await supabase
        .from('clubs')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      setClub(data);
      setIsLoading(false);
    };
    
    fetchClub();
  }, [id]);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!club) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Club not found</p>
          <Link to="/app/explore?tab=clubs">
            <Button variant="outline">Back to Clubs</Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Back Button */}
        <Link to="/app/explore?tab=clubs" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Clubs
        </Link>

        {/* Club Header */}
        <div className="relative">
          {club.image_url && (
            <div className="h-32 md:h-40 rounded-xl overflow-hidden mb-4 bg-muted">
              <img 
                src={club.image_url} 
                alt={club.name} 
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-xl bg-accent flex items-center justify-center shrink-0 -mt-8 border-4 border-background relative z-10">
                <Users className="h-7 w-7 text-primary" />
              </div>
              <div>
                <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-accent text-accent-foreground font-medium mb-1">
                  {club.category}
                </span>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                  {club.name}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {followerCount} follower{followerCount !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            
            <div className="flex gap-2 shrink-0">
              <Button
                variant={isBookmarked ? "default" : "outline"}
                size="icon"
                onClick={toggleBookmark}
              >
                <Bookmark className={`h-5 w-5 ${isBookmarked ? 'fill-current' : ''}`} />
              </Button>
            </div>
          </div>
        </div>

        {/* Follow Button */}
        <Button
          onClick={toggleFollow}
          disabled={followLoading}
          className="w-full gap-2"
          variant={isFollowing ? "outline" : "default"}
        >
          {followLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isFollowing ? (
            <>
              <UserMinus className="h-4 w-4" />
              Following
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4" />
              Follow
            </>
          )}
        </Button>

        {/* Description */}
        {club.description && (
          <p className="text-muted-foreground leading-relaxed">
            {club.description}
          </p>
        )}

        {/* Details Card */}
        <div className="p-4 rounded-xl border border-border bg-card space-y-4">
          {club.meeting_info && (
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Meetings</p>
                <p className="text-sm text-muted-foreground">{club.meeting_info}</p>
              </div>
            </div>
          )}
          
          {club.contact_email && (
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Contact</p>
                <a href={`mailto:${club.contact_email}`} className="text-sm text-primary hover:underline">
                  {club.contact_email}
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Tags */}
        {club.tags && club.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {club.tags.map((tag) => (
              <span key={tag} className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* External Link */}
        {club.url && (
          <a href={club.url} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="w-full gap-2">
              <ExternalLink className="h-4 w-4" />
              Visit Club Page
            </Button>
          </a>
        )}

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="w-full justify-start h-auto p-1 bg-secondary rounded-xl">
            <TabsTrigger 
              value="posts" 
              className="flex-1 gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <FileText className="h-4 w-4" />
              Posts
            </TabsTrigger>
            <TabsTrigger 
              value="events" 
              className="flex-1 gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Calendar className="h-4 w-4" />
              Events
            </TabsTrigger>
            <TabsTrigger 
              value="chat" 
              className="flex-1 gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <MessageCircle className="h-4 w-4" />
              Chat
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-4">
            <ClubPosts clubId={id || ''} />
          </TabsContent>

          <TabsContent value="events" className="mt-4">
            <ClubEvents clubName={club.name} />
          </TabsContent>

          <TabsContent value="chat" className="mt-4">
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <ClubChat clubId={id || ''} isFollowing={isFollowing} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
