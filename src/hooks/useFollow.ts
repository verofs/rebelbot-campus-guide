import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

export function useFollow(clubId: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [followerCount, setFollowerCount] = useState(0);

  useEffect(() => {
    if (!user || !clubId) {
      setIsLoading(false);
      return;
    }

    const checkFollowStatus = async () => {
      const { data, error } = await supabase
        .from('follows')
        .select('id')
        .eq('user_id', user.id)
        .eq('club_id', clubId)
        .maybeSingle();

      if (!error) {
        setIsFollowing(!!data);
      }
      setIsLoading(false);
    };

    const fetchFollowerCount = async () => {
      const { count } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('club_id', clubId);
      
      setFollowerCount(count || 0);
    };

    checkFollowStatus();
    fetchFollowerCount();
  }, [user, clubId]);

  const toggleFollow = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to follow clubs",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    if (isFollowing) {
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('user_id', user.id)
        .eq('club_id', clubId);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to unfollow club",
          variant: "destructive",
        });
      } else {
        setIsFollowing(false);
        setFollowerCount(prev => prev - 1);
        toast({
          title: "Unfollowed",
          description: "You've unfollowed this club",
        });
      }
    } else {
      const { error } = await supabase
        .from('follows')
        .insert({ user_id: user.id, club_id: clubId });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to follow club",
          variant: "destructive",
        });
      } else {
        setIsFollowing(true);
        setFollowerCount(prev => prev + 1);
        toast({
          title: "Following",
          description: "You're now following this club",
        });
      }
    }

    setIsLoading(false);
  };

  return { isFollowing, isLoading, followerCount, toggleFollow };
}
