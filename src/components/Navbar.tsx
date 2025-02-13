
import { Link, useNavigate } from "react-router-dom";
import { Home, Search, Upload, User, Info, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";

const Navbar = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out successfully",
        description: "Come back soon!",
      });
      navigate("/");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to log out. Please try again.",
      });
    }
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-primary">Calorie Tracker</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/" className="nav-link">
              <Home className="w-5 h-5" />
              <span>Home</span>
            </Link>
            <Link to="/search" className="nav-link">
              <Search className="w-5 h-5" />
              <span>Search</span>
            </Link>
            <Link to="/upload" className="nav-link">
              <Upload className="w-5 h-5" />
              <span>Upload</span>
            </Link>
            <Link to="/about" className="nav-link">
              <Info className="w-5 h-5" />
              <span>About</span>
            </Link>
            {isAuthenticated ? (
              <>
                <Link to="/profile" className="nav-link">
                  <User className="w-5 h-5" />
                  <span>Profile</span>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="nav-link"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </Button>
              </>
            ) : (
              <Link to="/login" className="nav-link">
                <User className="w-5 h-5" />
                <span>Login</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
