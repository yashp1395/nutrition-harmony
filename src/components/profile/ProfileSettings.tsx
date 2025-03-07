
import { Button } from "@/components/ui/button";
import { 
  Settings, 
  Bell, 
  Lock, 
  HelpCircle, 
  LogOut,
  Moon,
  Sun
} from "lucide-react";
import { useState, useEffect } from "react";
import { useTheme } from "../../hooks/useTheme";

interface ProfileSettingsProps {
  userName: string | null;
  userEmail: string | null;
  avatarUrl?: string | null;
  onLogout: () => void;
}

const ProfileSettings = ({ 
  userName, 
  userEmail, 
  avatarUrl, 
  onLogout 
}: ProfileSettingsProps) => {
  const { theme, setTheme } = useTheme();
  const [isDarkMode, setIsDarkMode] = useState(theme === 'dark');

  useEffect(() => {
    setIsDarkMode(theme === 'dark');
  }, [theme]);

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name.split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const toggleDarkMode = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    setIsDarkMode(newTheme === 'dark');
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="text-center mb-6">
        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          {avatarUrl ? (
            <img 
              src={avatarUrl} 
              alt={userName || 'User'} 
              className="w-24 h-24 rounded-full object-cover"
            />
          ) : (
            <span className="text-2xl font-semibold text-primary">
              {getInitials(userName)}
            </span>
          )}
        </div>
        <h2 className="text-xl font-semibold">{userName || 'User'}</h2>
        <p className="text-gray-500">{userEmail || 'user@example.com'}</p>
      </div>

      <div className="space-y-2">
        <Button
          variant="outline"
          className="w-full justify-start"
          size="sm"
        >
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start"
          size="sm"
        >
          <Bell className="w-4 h-4 mr-2" />
          Notifications
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start"
          size="sm"
        >
          <Lock className="w-4 h-4 mr-2" />
          Privacy
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start"
          size="sm"
          onClick={toggleDarkMode}
        >
          {isDarkMode ? (
            <Sun className="w-4 h-4 mr-2" />
          ) : (
            <Moon className="w-4 h-4 mr-2" />
          )}
          {isDarkMode ? 'Light Mode' : 'Dark Mode'}
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start"
          size="sm"
          onClick={() => window.location.href = "mailto:yash.patil.13092005@gmail.com"}
        >
          <HelpCircle className="w-4 h-4 mr-2" />
          Help & Support
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start"
          size="sm"
          onClick={onLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Log Out
        </Button>
      </div>
    </div>
  );
};

export default ProfileSettings;
