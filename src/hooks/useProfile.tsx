
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import type { UserProfile, NutritionGoal } from "../types/user.types";

export const useProfile = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [goals, setGoals] = useState<NutritionGoal[]>([
    { name: "Calories", current: 0, target: 2000, unit: "kcal" },
    { name: "Protein", current: 0, target: 60, unit: "g" },
    { name: "Carbs", current: 0, target: 200, unit: "g" },
    { name: "Fat", current: 0, target: 65, unit: "g" },
  ]);

  useEffect(() => {
    fetchProfile();
    fetchGoals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        return;
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
        
      if (error) {
        throw error;
      }
      
      if (data) {
        setUser({
          id: data.id,
          full_name: data.full_name,
          email: data.email,
          avatar_url: data.avatar_url,
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Error loading profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchGoals = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        return;
      }
      
      const { data, error } = await supabase
        .from('nutrition_goals')
        .select('*')
        .eq('user_id', session.user.id);
        
      if (error) {
        throw error;
      }
      
      if (data && data.length > 0) {
        setGoals(data.map(goal => ({
          id: goal.id,
          user_id: goal.user_id,
          name: goal.name,
          current: goal.current,
          target: goal.target,
          unit: goal.unit
        })));
      } else {
        // If no goals found, create default goals
        await createDefaultGoals(session.user.id);
      }
    } catch (error) {
      console.error('Error fetching goals:', error);
    }
  };

  const createDefaultGoals = async (userId: string) => {
    try {
      const defaultGoals = [
        { user_id: userId, name: "Calories", current: 0, target: 2000, unit: "kcal" },
        { user_id: userId, name: "Protein", current: 0, target: 60, unit: "g" },
        { user_id: userId, name: "Carbs", current: 0, target: 200, unit: "g" },
        { user_id: userId, name: "Fat", current: 0, target: 65, unit: "g" },
      ];
      
      const { data, error } = await supabase
        .from('nutrition_goals')
        .insert(defaultGoals)
        .select();
        
      if (error) {
        throw error;
      }
      
      if (data) {
        setGoals(data);
      }
    } catch (error) {
      console.error('Error creating default goals:', error);
      toast.error('Failed to create nutrition goals');
    }
  };

  const updateGoal = async (id: string, target: number) => {
    try {
      const { error } = await supabase
        .from('nutrition_goals')
        .update({ target })
        .eq('id', id);
        
      if (error) {
        throw error;
      }
      
      setGoals(prev => 
        prev.map(goal => 
          goal.id === id ? { ...goal, target } : goal
        )
      );
      
      toast.success('Goal updated successfully');
    } catch (error) {
      console.error('Error updating goal:', error);
      toast.error('Failed to update goal');
    }
  };

  const updateGoals = async (updatedGoals: NutritionGoal[]) => {
    try {
      for (const goal of updatedGoals) {
        if (!goal.id) continue;
        
        const { error } = await supabase
          .from('nutrition_goals')
          .update({ target: goal.target })
          .eq('id', goal.id);
          
        if (error) {
          throw error;
        }
      }
      
      setGoals(updatedGoals);
      toast.success('Goals updated successfully');
    } catch (error) {
      console.error('Error updating goals:', error);
      toast.error('Failed to update goals');
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Error logging out');
    }
  };

  return {
    user,
    loading,
    goals,
    fetchProfile,
    updateGoal,
    updateGoals,
    logout
  };
};
