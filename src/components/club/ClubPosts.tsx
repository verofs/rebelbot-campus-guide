import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, ImageIcon } from 'lucide-react';
import { format } from 'date-fns';

interface ClubPost {
  id: string;
  title: string;
  content: string | null;
  image_url: string | null;
  created_at: string;
}

interface ClubPostsProps {
  clubId: string;
}

export function ClubPosts({ clubId }: ClubPostsProps) {
  const [posts, setPosts] = useState<ClubPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      const { data, error } = await supabase
        .from('club_posts')
        .select('*')
        .eq('club_id', clubId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setPosts(data);
      }
      setIsLoading(false);
    };

    fetchPosts();
  }, [clubId]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No posts yet</p>
        <p className="text-sm mt-1">This club hasn't shared any updates</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <article
          key={post.id}
          className="p-4 rounded-xl border border-border bg-card hover:border-primary/20 transition-colors"
        >
          <h3 className="font-semibold text-foreground mb-2">{post.title}</h3>
          {post.image_url && (
            <div className="mb-3 rounded-lg overflow-hidden bg-muted">
              <img
                src={post.image_url}
                alt={post.title}
                className="w-full h-48 object-cover"
              />
            </div>
          )}
          {post.content && (
            <p className="text-muted-foreground text-sm leading-relaxed">
              {post.content}
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-3">
            {format(new Date(post.created_at), 'MMM d, yyyy · h:mm a')}
          </p>
        </article>
      ))}
    </div>
  );
}
