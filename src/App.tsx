import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/lib/auth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { FeedbackModal } from "@/components/FeedbackModal";

// Pages
import LandingPage from "./pages/Landing";
import LoginPage from "./pages/Login";
import OnboardingPage from "./pages/Onboarding";
import HomePage from "./pages/app/Home";
import ExplorePage from "./pages/app/Explore";
import ChatPage from "./pages/app/Chat";
import SavedPage from "./pages/app/Saved";
import ProfilePage from "./pages/app/Profile";
import ResourceDetailPage from "./pages/app/ResourceDetail";
import EventDetailPage from "./pages/app/EventDetail";
import ClubDetailPage from "./pages/app/ClubDetail";
import NotFound from "./pages/NotFound";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import ResourcesAdmin from "./pages/admin/ResourcesAdmin";
import EventsAdmin from "./pages/admin/EventsAdmin";
import ClubsAdmin from "./pages/admin/ClubsAdmin";
import ClubPostsAdmin from "./pages/admin/ClubPostsAdmin";
import FeedbackAdmin from "./pages/admin/FeedbackAdmin";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            
            {/* Onboarding - protected but doesn't require onboarding complete */}
            <Route path="/onboarding" element={
              <ProtectedRoute requireOnboarding={false}>
                <OnboardingPage />
              </ProtectedRoute>
            } />
            
            {/* Protected app routes */}
            <Route path="/app" element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            } />
            <Route path="/app/explore" element={
              <ProtectedRoute>
                <ExplorePage />
              </ProtectedRoute>
            } />
            <Route path="/app/chat" element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            } />
            <Route path="/app/saved" element={
              <ProtectedRoute>
                <SavedPage />
              </ProtectedRoute>
            } />
            <Route path="/app/profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
            <Route path="/app/resources/:id" element={
              <ProtectedRoute>
                <ResourceDetailPage />
              </ProtectedRoute>
            } />
            <Route path="/app/events/:id" element={
              <ProtectedRoute>
                <EventDetailPage />
              </ProtectedRoute>
            } />
            <Route path="/app/clubs/:id" element={
              <ProtectedRoute>
                <ClubDetailPage />
              </ProtectedRoute>
            } />
            
            {/* Admin routes */}
            <Route path="/admin" element={
              <ProtectedRoute requireAdmin>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/resources" element={
              <ProtectedRoute requireAdmin>
                <ResourcesAdmin />
              </ProtectedRoute>
            } />
            <Route path="/admin/events" element={
              <ProtectedRoute requireAdmin>
                <EventsAdmin />
              </ProtectedRoute>
            } />
            <Route path="/admin/clubs" element={
              <ProtectedRoute requireAdmin>
                <ClubsAdmin />
              </ProtectedRoute>
            } />
            <Route path="/admin/club-posts" element={
              <ProtectedRoute requireAdmin>
                <ClubPostsAdmin />
              </ProtectedRoute>
            } />
            <Route path="/admin/feedback" element={
              <ProtectedRoute requireAdmin>
                <FeedbackAdmin />
              </ProtectedRoute>
            } />
            
            {/* Catch all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <FeedbackModal />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
