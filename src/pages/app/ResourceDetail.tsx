import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useBookmark } from '@/hooks/useBookmark';
import { ArrowLeft, MapPin, Clock, Phone, Mail, ExternalLink, Bookmark, Loader2 } from 'lucide-react';

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

export default function ResourceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [resource, setResource] = useState<Resource | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isBookmarked, toggleBookmark } = useBookmark('resource', id || '');

  useEffect(() => {
    if (!id) return;
    
    const fetchResource = async () => {
      const { data } = await supabase
        .from('resources')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      setResource(data);
      setIsLoading(false);
    };
    
    fetchResource();
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

  if (!resource) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Resource not found</p>
          <Link to="/app/explore?tab=resources">
            <Button variant="outline">Back to Resources</Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Back Button */}
        <Link to="/app/explore?tab=resources" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Resources
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-accent text-accent-foreground font-medium mb-2">
              {resource.category}
            </span>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              {resource.title}
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
        {resource.description && (
          <p className="text-muted-foreground leading-relaxed">
            {resource.description}
          </p>
        )}

        {/* Details Card */}
        <div className="p-4 rounded-xl border border-border bg-card space-y-4">
          {resource.location && (
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Location</p>
                <p className="text-sm text-muted-foreground">{resource.location}</p>
              </div>
            </div>
          )}
          
          {resource.hours && (
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Hours</p>
                <p className="text-sm text-muted-foreground">{resource.hours}</p>
              </div>
            </div>
          )}
          
          {resource.phone && (
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Phone</p>
                <a href={`tel:${resource.phone}`} className="text-sm text-primary hover:underline">
                  {resource.phone}
                </a>
              </div>
            </div>
          )}
          
          {resource.contact_email && (
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Email</p>
                <a href={`mailto:${resource.contact_email}`} className="text-sm text-primary hover:underline">
                  {resource.contact_email}
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Tags */}
        {resource.tags && resource.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {resource.tags.map((tag) => (
              <span key={tag} className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* External Link */}
        {resource.url && (
          <a href={resource.url} target="_blank" rel="noopener noreferrer">
            <Button className="w-full gap-2">
              <ExternalLink className="h-4 w-4" />
              Visit Website
            </Button>
          </a>
        )}
      </div>
    </AppLayout>
  );
}
