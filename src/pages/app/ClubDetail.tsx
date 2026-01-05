import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useBookmark } from '@/hooks/useBookmark';
import { ArrowLeft, Users, Mail, Clock, ExternalLink, Bookmark, Loader2 } from 'lucide-react';

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

export default function ClubDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [club, setClub] = useState<Club | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isBookmarked, toggleBookmark } = useBookmark('club', id || '');

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

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-accent text-accent-foreground font-medium mb-2">
              {club.category}
            </span>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              {club.name}
            </h1>
          </div>
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
            <Button className="w-full gap-2">
              <ExternalLink className="h-4 w-4" />
              Visit Club Page
            </Button>
          </a>
        )}
      </div>
    </AppLayout>
  );
}
