import { useState, useEffect } from 'react';
import { AdminLayout } from './AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { FileText, Calendar, Users, MessageSquare, Loader2 } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    resources: 0,
    events: 0,
    clubs: 0,
    feedback: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const [resources, events, clubs, feedback] = await Promise.all([
        supabase.from('resources').select('id', { count: 'exact', head: true }),
        supabase.from('events').select('id', { count: 'exact', head: true }),
        supabase.from('clubs').select('id', { count: 'exact', head: true }),
        supabase.from('feedback').select('id', { count: 'exact', head: true }),
      ]);
      
      setStats({
        resources: resources.count || 0,
        events: events.count || 0,
        clubs: clubs.count || 0,
        feedback: feedback.count || 0,
      });
      setIsLoading(false);
    };
    
    fetchStats();
  }, []);

  const statCards = [
    { label: 'Resources', value: stats.resources, icon: FileText, color: 'text-blue-500' },
    { label: 'Events', value: stats.events, icon: Calendar, color: 'text-green-500' },
    { label: 'Clubs', value: stats.clubs, icon: Users, color: 'text-purple-500' },
    { label: 'Feedback', value: stats.feedback, icon: MessageSquare, color: 'text-orange-500' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage RebelBot content and view analytics</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {statCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="p-6 rounded-xl border border-border bg-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-3xl font-bold text-foreground mt-1">{stat.value}</p>
                    </div>
                    <Icon className={`h-10 w-10 ${stat.color} opacity-80`} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
