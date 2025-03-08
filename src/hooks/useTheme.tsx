
import { useState, useEffect, createContext, useContext } from "react";
import { supabase } from "@/lib/supabase";

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  setTheme: () => {},
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Check for saved theme in localStorage
    const savedTheme = localStorage.getItem('theme') as Theme;
    // Check for system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    return savedTheme || (prefersDark ? 'dark' : 'light');
  });

  // Save user theme preference to database if logged in
  useEffect(() => {
    const saveThemePreference = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          // Update user's theme preference if they're logged in
          await supabase
            .from('profiles')
            .update({ theme_preference: theme })
            .eq('id', session.user.id);
        }
      } catch (error) {
        console.error('Error saving theme preference:', error);
      }
    };

    // Only attempt to save if the user has explicitly set a theme (not just on initial load)
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      saveThemePreference();
    }
  }, [theme]);

  // Load user theme preference from database on login
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('theme_preference')
            .eq('id', session.user.id)
            .single();
            
          if (data?.theme_preference && !error) {
            setThemeState(data.theme_preference as Theme);
          }
        } catch (error) {
          console.error('Error loading theme preference:', error);
        }
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    // Update localStorage and document class when theme changes
    localStorage.setItem('theme', theme);
    
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
