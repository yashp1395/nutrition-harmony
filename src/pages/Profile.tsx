import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import UploadMealWidget from "../components/profile/UploadMealWidget";
import { useProfile } from "../hooks/useProfile";
import { useMeals } from "../hooks/useMeals";
import ProfileSettings from "../components/profile/ProfileSettings";
import ProfileContent from "../components/profile/ProfileContent";
import MealHistory from "../components/profile/MealHistory";
import { useTheme } from "../hooks/useTheme";
import { motion } from "framer-motion";
import { History } from "lucide-react";

const Profile = () => {
  const { theme } = useTheme();
  const { 
    user, 
    loading: userLoading, 
    goals, 
    isPremium,
    updateGoals, 
    logout,
    unlockPremium
  } = useProfile();
  
  const { 
    meals, 
    allMeals,
    loading: mealsLoading, 
    saveMeal, 
    deleteMeal, 
    updateMeal 
  } = useMeals(updateGoals, goals);
  
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    // Prepare data for the pie chart
    if (goals.length > 0) {
      const data = [
        { name: 'Protein', value: goals.find(g => g.name === 'Protein')?.current || 0, color: theme === 'dark' ? '#6366f1' : '#4f46e5' },
        { name: 'Carbs', value: goals.find(g => g.name === 'Carbs')?.current || 0, color: theme === 'dark' ? '#34d399' : '#10b981' },
        { name: 'Fat', value: goals.find(g => g.name === 'Fat')?.current || 0, color: theme === 'dark' ? '#fbbf24' : '#f59e0b' }
      ];
      setChartData(data);
    }
  }, [goals, theme]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Profile Info */}
            <div className="md:col-span-1">
              <ProfileSettings 
                userName={user?.full_name}
                userEmail={user?.email}
                avatarUrl={user?.avatar_url}
                onLogout={logout}
              />
            </div>

            {/* Main Content */}
            <div className="md:col-span-2 space-y-8">
              {/* Upload Meal Widget */}
              <UploadMealWidget />
              
              {/* Profile Content with Premium Features */}
              <ProfileContent 
                goals={goals}
                meals={meals}
                chartData={chartData}
                isPremium={isPremium}
                onUnlockPremium={unlockPremium}
                onUpdateGoals={updateGoals}
                onDeleteMeal={deleteMeal}
                onUpdateMeal={updateMeal}
                onSaveMeal={saveMeal}
              />

              {/* Meal History */}
              <motion.div 
                className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="flex items-center mb-6">
                  <div className="bg-primary/10 dark:bg-primary/20 p-2 rounded-full mr-3">
                    <History className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-semibold dark:text-white">Meal History</h2>
                </div>
                <MealHistory meals={allMeals} />
              </motion.div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
