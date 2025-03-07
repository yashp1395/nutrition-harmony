
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { useProfile } from "../hooks/useProfile";
import { useMeals } from "../hooks/useMeals";
import EditGoalsDialog from "../components/profile/EditGoalsDialog";
import MealItem from "../components/profile/MealItem";
import AddMealDialog from "../components/profile/AddMealDialog";
import UploadMealWidget from "../components/profile/UploadMealWidget";
import {
  Settings,
  Bell,
  Lock,
  HelpCircle,
  Target,
  Utensils,
  Upload,
  BarChart3,
  LogOut
} from "lucide-react";

const Profile = () => {
  const { user, loading: userLoading, goals, updateGoals, logout } = useProfile();
  const { meals, loading: mealsLoading, saveMeal, deleteMeal, updateMeal } = useMeals(updateGoals, goals);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    // Prepare data for the pie chart
    if (goals.length > 0) {
      const data = [
        { name: 'Protein', value: goals.find(g => g.name === 'Protein')?.current || 0, color: '#4f46e5' },
        { name: 'Carbs', value: goals.find(g => g.name === 'Carbs')?.current || 0, color: '#10b981' },
        { name: 'Fat', value: goals.find(g => g.name === 'Fat')?.current || 0, color: '#f59e0b' }
      ];
      setChartData(data);
    }
  }, [goals]);

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name.split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Profile Info */}
            <div className="md:col-span-1">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-center mb-6">
                  <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    {user?.avatar_url ? (
                      <img 
                        src={user.avatar_url} 
                        alt={user.full_name || 'User'} 
                        className="w-24 h-24 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl font-semibold text-primary">
                        {getInitials(user?.full_name)}
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-semibold">{user?.full_name || 'User'}</h2>
                  <p className="text-gray-500">{user?.email || 'user@example.com'}</p>
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
                  >
                    <HelpCircle className="w-4 h-4 mr-2" />
                    Help & Support
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    size="sm"
                    onClick={logout}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Log Out
                  </Button>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="md:col-span-2 space-y-8">
              {/* Upload Meal Widget */}
              <UploadMealWidget />
            
              {/* Daily Goals */}
              <div className="bg-white p-6 rounded-lg shadow-md relative">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Daily Goals</h2>
                  <Target className="w-5 h-5 text-gray-400" />
                </div>

                <EditGoalsDialog goals={goals} onSave={updateGoals} />

                <div className="space-y-6">
                  {goals.map((goal) => (
                    <div key={goal.name}>
                      <div className="flex justify-between mb-2">
                        <span className="font-medium">{goal.name}</span>
                        <span className="text-gray-500">
                          {goal.current} / {goal.target} {goal.unit}
                        </span>
                      </div>
                      <Progress
                        value={Math.min((goal.current / goal.target) * 100, 100)}
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>

                {/* Nutrition Distribution Chart */}
                <div className="mt-8">
                  <h3 className="text-md font-medium mb-4">Nutrition Distribution</h3>
                  <div className="h-[180px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={70}
                          fill="#8884d8"
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Today's Meals</h2>
                  <Utensils className="w-5 h-5 text-gray-400" />
                </div>

                <AddMealDialog onSave={saveMeal} />

                <div className="space-y-4">
                  {meals.length === 0 ? (
                    <div className="text-center py-6 text-gray-500">
                      <p>No meals logged today</p>
                      <p className="text-sm mt-2">Add a meal or upload a food photo</p>
                    </div>
                  ) : (
                    meals.map((meal) => (
                      <MealItem 
                        key={meal.id} 
                        meal={meal} 
                        onDelete={deleteMeal}
                        onUpdate={updateMeal}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
