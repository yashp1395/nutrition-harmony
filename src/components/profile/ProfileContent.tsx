
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Target, Utensils } from "lucide-react";
import EditGoalsDialog from "./EditGoalsDialog";
import MealItem from "./MealItem";
import AddMealDialog from "./AddMealDialog";
import PremiumFeatureOverlay from "./PremiumFeatureOverlay";
import type { NutritionGoal } from "@/types/user.types";
import type { MealEntry } from "@/types/user.types";

interface ProfileContentProps {
  goals: NutritionGoal[];
  meals: MealEntry[];
  chartData: any[];
  isPremium: boolean;
  onUnlockPremium: () => Promise<boolean>;
  onUpdateGoals: (goals: NutritionGoal[]) => void;
  onDeleteMeal: (id: string) => void;
  onUpdateMeal: (id: string, updates: Partial<MealEntry>) => void;
  onSaveMeal: (meal: Omit<MealEntry, 'id' | 'user_id' | 'date'>) => Promise<any>;
}

const ProfileContent = ({
  goals,
  meals,
  chartData,
  isPremium,
  onUnlockPremium,
  onUpdateGoals,
  onDeleteMeal,
  onUpdateMeal,
  onSaveMeal
}: ProfileContentProps) => {
  return (
    <div className="md:col-span-2 space-y-8">
      {/* Daily Goals */}
      <PremiumFeatureOverlay
        title="Daily Goals"
        isPremium={isPremium}
        onUnlock={onUnlockPremium}
      >
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md relative">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold dark:text-white">Daily Goals</h2>
            <Target className="w-5 h-5 text-gray-400 dark:text-gray-300" />
          </div>

          <EditGoalsDialog goals={goals} onSave={onUpdateGoals} />

          <div className="space-y-6">
            {goals.map((goal) => (
              <div key={goal.name}>
                <div className="flex justify-between mb-2">
                  <span className="font-medium dark:text-white">{goal.name}</span>
                  <span className="text-gray-500 dark:text-gray-300">
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
            <h3 className="text-md font-medium mb-4 dark:text-white">Nutrition Distribution</h3>
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
      </PremiumFeatureOverlay>

      {/* Today's Meals */}
      <PremiumFeatureOverlay
        title="Today's Meals"
        isPremium={isPremium}
        onUnlock={onUnlockPremium}
      >
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold dark:text-white">Today's Meals</h2>
            <Utensils className="w-5 h-5 text-gray-400 dark:text-gray-300" />
          </div>

          <AddMealDialog onSave={onSaveMeal} />

          <div className="space-y-4">
            {meals.length === 0 ? (
              <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                <p>No meals logged today</p>
                <p className="text-sm mt-2">Add a meal or upload a food photo</p>
              </div>
            ) : (
              meals.map((meal) => (
                <MealItem 
                  key={meal.id} 
                  meal={meal} 
                  onDelete={onDeleteMeal}
                  onUpdate={onUpdateMeal}
                />
              ))
            )}
          </div>
        </div>
      </PremiumFeatureOverlay>
    </div>
  );
};

export default ProfileContent;
