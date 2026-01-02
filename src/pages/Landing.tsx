import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import { ArrowRight, Compass, MessageCircle, Bookmark, Sparkles } from 'lucide-react';

export default function LandingPage() {
  const { user, isLoading } = useAuth();

  const features = [
    {
      icon: Compass,
      title: 'Explore Campus',
      description: 'Find resources, events, and clubs tailored to your interests.',
    },
    {
      icon: MessageCircle,
      title: 'Ask RebelBot',
      description: 'Get instant answers about campus services and opportunities.',
    },
    {
      icon: Bookmark,
      title: 'Save & Organize',
      description: 'Bookmark important resources for quick access anytime.',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">R</span>
            </div>
            <span className="font-bold text-lg text-foreground">RebelBot</span>
          </div>
          
          <div className="flex items-center gap-3">
            {isLoading ? null : user ? (
              <Link to="/app">
                <Button>
                  Open App
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost">Log in</Button>
                </Link>
                <Link to="/login">
                  <Button>
                    Get Started
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-6 animate-fade-in">
            <Sparkles className="h-4 w-4" />
            Your UNLV companion
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 animate-slide-up leading-tight">
            Navigate campus life
            <br />
            <span className="text-primary">like a Rebel</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in stagger-2">
            Discover resources, events, and clubs tailored to your interests. 
            RebelBot helps you find exactly what you need at UNLV.
          </p>
          
          <div className="flex items-center justify-center gap-4 animate-fade-in stagger-3">
            <Link to="/login">
              <Button size="xl" variant="hero">
                Open the app
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-secondary/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-12">
            Everything you need, in one place
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={feature.title}
                  className="bg-card rounded-2xl p-6 border border-border hover:border-primary/20 hover:shadow-lg transition-all animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            Ready to explore?
          </h2>
          <p className="text-muted-foreground mb-8">
            Join thousands of UNLV students already using RebelBot.
          </p>
          <Link to="/login">
            <Button size="lg">
              Get started free
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">R</span>
            </div>
            <span className="font-semibold text-foreground">RebelBot</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 RebelBot. Made for UNLV students.
          </p>
        </div>
      </footer>
    </div>
  );
}
