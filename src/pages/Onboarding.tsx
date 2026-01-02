import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const statusOptions = ['Undergraduate', 'Graduate', 'Faculty', 'Staff', 'Alumni'];
const yearOptions = ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate Student', 'Other'];
const interestOptions = [
  'Mental Health', 'Career Development', 'Financial Aid', 'Tutoring',
  'International Students', 'Research', 'Sports & Fitness', 'Arts & Culture',
  'Technology', 'Business', 'Science', 'Engineering', 'Social Events',
  'Volunteering', 'Leadership', 'Networking'
];

export default function OnboardingPage() {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  const [firstName, setFirstName] = useState('');
  const [status, setStatus] = useState('');
  const [year, setYear] = useState('');
  const [major, setMajor] = useState('');
  const [interests, setInterests] = useState<string[]>([]);

  const toggleInterest = (interest: string) => {
    setInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleComplete = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: firstName,
          status,
          year,
          major,
          interests,
          onboarding_complete: true,
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      await refreshProfile();
      
      toast({
        title: 'Welcome to RebelBot!',
        description: "You're all set. Let's explore campus together.",
      });
      
      navigate('/app');
    } catch (error) {
      toast({
        title: 'Something went wrong',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1: return firstName.trim().length > 0;
      case 2: return status.length > 0;
      case 3: return true; // Year and major are optional
      case 4: return interests.length > 0;
      default: return false;
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-lg animate-fade-in">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex-1">
              <div className={cn(
                "h-1.5 rounded-full transition-colors",
                s <= step ? "bg-primary" : "bg-border"
              )} />
            </div>
          ))}
        </div>

        {/* Step 1: Name */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                What should we call you?
              </h1>
              <p className="text-muted-foreground">
                Let's personalize your RebelBot experience.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Enter your first name"
                className="h-12"
                autoFocus
              />
            </div>
          </div>
        )}

        {/* Step 2: Status */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                What's your UNLV status?
              </h1>
              <p className="text-muted-foreground">
                This helps us show you relevant resources.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {statusOptions.map((option) => (
                <Button
                  key={option}
                  variant={status === option ? "default" : "outline"}
                  className={cn(
                    "h-12 justify-start",
                    status === option && "shadow-md"
                  )}
                  onClick={() => setStatus(option)}
                >
                  {status === option && <Check className="h-4 w-4 mr-2" />}
                  {option}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Year & Major */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Tell us more about you
              </h1>
              <p className="text-muted-foreground">
                Optional, but helps us personalize recommendations.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Year</Label>
                <div className="grid grid-cols-2 gap-2">
                  {yearOptions.map((option) => (
                    <Button
                      key={option}
                      variant={year === option ? "default" : "outline"}
                      size="sm"
                      onClick={() => setYear(option)}
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="major">Major</Label>
                <Input
                  id="major"
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                  placeholder="e.g., Computer Science"
                  className="h-11"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Interests */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                What interests you?
              </h1>
              <p className="text-muted-foreground">
                Select at least one to personalize your feed.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {interestOptions.map((option) => (
                <Button
                  key={option}
                  variant={interests.includes(option) ? "default" : "outline"}
                  size="chip"
                  onClick={() => toggleInterest(option)}
                >
                  {interests.includes(option) && <Check className="h-3 w-3 mr-1" />}
                  {option}
                </Button>
              ))}
            </div>
            
            {interests.length > 0 && (
              <p className="text-sm text-muted-foreground">
                {interests.length} selected
              </p>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center gap-3 mt-10">
          {step > 1 && (
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
              className="flex-1"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}
          
          {step < 4 ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="flex-1"
            >
              Continue
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              disabled={!canProceed() || isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Get Started
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          )}
        </div>

        {/* Skip */}
        {step < 4 && (
          <button
            onClick={() => setStep(4)}
            className="mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors w-full text-center"
          >
            Skip for now
          </button>
        )}
      </div>
    </div>
  );
}
