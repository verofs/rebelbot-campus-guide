import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User, LogOut, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ProfilePage() {
  const { profile, signOut, refreshProfile, isAdmin } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [firstName, setFirstName] = useState(profile?.first_name || '');
  const [major, setMajor] = useState(profile?.major || '');

  const handleSave = async () => {
    if (!profile) return;
    setIsLoading(true);
    
    const { error } = await supabase
      .from('profiles')
      .update({ first_name: firstName, major })
      .eq('id', profile.id);
    
    if (error) {
      toast({ title: 'Error', description: 'Failed to update profile', variant: 'destructive' });
    } else {
      await refreshProfile();
      toast({ title: 'Saved!', description: 'Your profile has been updated.' });
    }
    setIsLoading(false);
  };

  return (
    <AppLayout>
      <div className="max-w-lg space-y-8 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Profile</h1>
          <p className="text-muted-foreground">Manage your account settings</p>
        </div>

        <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary">
          <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center">
            <User className="h-8 w-8 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-foreground">{profile?.first_name || 'Rebel'}</p>
            <p className="text-sm text-muted-foreground">{profile?.status} • {profile?.major || 'No major set'}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>First Name</Label>
            <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Major</Label>
            <Input value={major} onChange={(e) => setMajor(e.target.value)} placeholder="e.g., Computer Science" />
          </div>
          <Button onClick={handleSave} disabled={isLoading} className="w-full">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Changes'}
          </Button>
        </div>

        {isAdmin && (
          <Link to="/admin">
            <Button variant="outline" className="w-full gap-2">
              <Shield className="h-4 w-4" />
              Admin Dashboard
            </Button>
          </Link>
        )}

        <Button variant="ghost" className="w-full text-destructive hover:text-destructive hover:bg-destructive/10" onClick={signOut}>
          <LogOut className="h-4 w-4 mr-2" />
          Sign out
        </Button>
      </div>
    </AppLayout>
  );
}
