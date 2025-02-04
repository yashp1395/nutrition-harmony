import { useState } from "react";
import Navbar from "../components/Navbar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Settings,
  Bell,
  Lock,
  HelpCircle,
  ChevronRight,
  Utensils,
  Target,
  Activity,
} from "lucide-react";

interface NutritionGoal {
  name: string;
  current: number;
  target: number;
  unit: string;
}

const Profile = () => {
  const [goals] = useState<NutritionGoal[]>([
    { name: "Calories", current: 1200, target: 2000, unit: "kcal" },
    { name: "Protein", current: 45, target: 60, unit: "g" },
    { name: "Carbs", current: 130, target: 200, unit: "g" },
    { name: "Fat", current: 40, target: 65, unit: "g" },
  ]);

  const recentMeals = [
    { name: "Breakfast", calories: 450, time: "8:30 AM" },
    { name: "Lunch", calories: 550, time: "12:45 PM" },
    { name: "Snack", calories: 200, time: "3:30 PM" },
  ];

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
                    <span className="text-2xl font-semibold text-primary">
                      JD
                    </span>
                  </div>
                  <h2 className="text-xl font-semibold">John Doe</h2>
                  <p className="text-gray-500">john.doe@example.com</p>
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
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="md:col-span-2 space-y-8">
              {/* Daily Goals */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Daily Goals</h2>
                  <Target className="w-5 h-5 text-gray-400" />
                </div>

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
                        value={(goal.current / goal.target) * 100}
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Today's Meals</h2>
                  <Utensils className="w-5 h-5 text-gray-400" />
                </div>

                <div className="space-y-4">
                  {recentMeals.map((meal) => (
                    <div
                      key={meal.name}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <Activity className="w-5 h-5 text-primary" />
                        <div>
                          <div className="font-medium">{meal.name}</div>
                          <div className="text-sm text-gray-500">
                            {meal.time}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {meal.calories} kcal
                        </span>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  ))}
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