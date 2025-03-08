
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import { ThemeProvider } from "./hooks/useTheme";
import Index from "./pages/Index";
import Search from "./pages/Search";
import Upload from "./pages/Upload";
import About from "./pages/About";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    // Add debug logs
    console.log("ProtectedRoute: Checking authentication...");
    
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        // Log authentication results
        console.log("Auth check result:", { 
          sessionExists: !!session, 
          userId: session?.user?.id || 'none',
          error 
        });
        
        if (error) {
          console.error("Authentication error:", error);
          throw error;
        }
        
        setAuthenticated(!!session);
        setLoading(false);
      } catch (error) {
        console.error("Auth check error:", error);
        setAuthenticated(false);
        setLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session ? `User: ${session.user.id}` : "no session");
      setAuthenticated(!!session);
      setLoading(false); // Ensure loading is set to false on auth state change
    });

    return () => {
      console.log("Cleaning up auth subscription");
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    console.log("ProtectedRoute: Still loading...");
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
          <p className="text-lg text-gray-600 dark:text-gray-300">Loading application...</p>
        </div>
      </div>
    );
  }

  console.log("ProtectedRoute: Authentication status:", authenticated);
  
  if (!authenticated) {
    console.log("ProtectedRoute: Not authenticated, redirecting to /auth");
    return <Navigate to="/auth" />;
  }

  console.log("ProtectedRoute: Authenticated, rendering children");
  return children;
};

const App = () => {
  // Add global error boundary
  const [error, setError] = useState<Error | null>(null);
  
  // Add error handler
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error("Global error caught:", event.error);
      setError(event.error);
    };
    
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);
  
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-white dark:bg-gray-900">
        <div className="flex flex-col items-center max-w-md mx-auto p-6 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <h2 className="text-xl font-semibold text-red-700 dark:text-red-400">Application Error</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">Something went wrong. Please refresh the page and try again.</p>
          <pre className="mt-4 p-3 text-sm bg-white dark:bg-gray-800 rounded-md border border-red-200 dark:border-red-800 w-full overflow-auto">
            {error.message}
          </pre>
          <button 
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              } />
              <Route path="/search" element={
                <ProtectedRoute>
                  <Search />
                </ProtectedRoute>
              } />
              <Route path="/upload" element={
                <ProtectedRoute>
                  <Upload />
                </ProtectedRoute>
              } />
              <Route path="/about" element={
                <ProtectedRoute>
                  <About />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
