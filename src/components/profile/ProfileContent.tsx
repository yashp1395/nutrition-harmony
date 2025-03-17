
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Target, Utensils, TrendingUp, Award, BarChart3 } from "lucide-react";
import EditGoalsDialog from "./EditGoalsDialog";
import MealItem from "./MealItem";
import AddMealDialog from "./AddMealDialog";
import PremiumFeatureOverlay from "./PremiumFeatureOverlay";
import { motion, AnimatePresence } from "framer-motion";
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
  const [showAnimation, setShowAnimation] = useState(true);
  
  // Reset animation when goals change
  useEffect(() => {
    setShowAnimation(false);
    const timer = setTimeout(() => setShowAnimation(true), 50);
    return () => clearTimeout(timer);
  }, [goals]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <motion.div 
      className="md:col-span-2 space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Daily Goals */}
      <PremiumFeatureOverlay
        title="Daily Goals"
        isPremium={isPremium}
        onUnlock={onUnlockPremium}
      >
        <motion.div 
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md relative border border-gray-100 dark:border-gray-700"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="bg-primary/10 dark:bg-primary/20 p-2 rounded-full mr-3">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold dark:text-white">Daily Goals</h2>
            </div>
            <EditGoalsDialog goals={goals} onSave={onUpdateGoals} />
          </div>

          <AnimatePresence>
            {showAnimation && (
              <motion.div 
                className="space-y-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {goals.map((goal) => (
                  <motion.div key={goal.name} variants={itemVariants}>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium dark:text-white">{goal.name}</span>
                      <span className="text-gray-500 dark:text-gray-300">
                        {goal.current} / {goal.target} {goal.unit}
                      </span>
                    </div>
                    <div className="relative pt-1">
                      <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200 dark:bg-gray-700">
                        <motion.div
                          className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                            goal.name === 'Protein' ? 'bg-blue-500' : 
                            goal.name === 'Carbs' ? 'bg-green-500' : 
                            goal.name === 'Fat' ? 'bg-yellow-500' : 'bg-primary'
                          }`}
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min((goal.current / goal.target) * 100, 100)}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Nutrition Distribution Chart */}
          <div className="mt-8">
            <div className="flex items-center mb-4">
              <div className="bg-primary/10 dark:bg-primary/20 p-2 rounded-full mr-3">
                <BarChart3 className="w-4 h-4 text-primary" />
              </div>
              <h3 className="text-md font-medium dark:text-white">Nutrition Distribution</h3>
            </div>
            <motion.div 
              className="h-[220px]"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
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
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {chartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color} 
                        className="hover:opacity-80 transition-opacity"
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`${value}g`, 'Amount']}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      padding: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* Quick Stats */}
          <motion.div 
            className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
              <div className="flex items-center">
                <TrendingUp className="w-4 h-4 text-blue-500 mr-2" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Total</span>
              </div>
              <p className="mt-2 text-xl font-semibold dark:text-white">
                {goals.reduce((acc, goal) => acc + goal.current, 0)}g
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
              <div className="flex items-center">
                <Award className="w-4 h-4 text-green-500 mr-2" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Calories</span>
              </div>
              <p className="mt-2 text-xl font-semibold dark:text-white">
                {goals.find(g => g.name === 'Calories')?.current || 0} kcal
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
              <div className="flex items-center">
                <Award className="w-4 h-4 text-yellow-500 mr-2" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Protein %</span>
              </div>
              <p className="mt-2 text-xl font-semibold dark:text-white">
                {goals.find(g => g.name === 'Protein')?.current ? 
                  Math.round(goals.find(g => g.name === 'Protein')!.current / 
                  goals.reduce((acc, goal) => acc + goal.current, 0) * 100) : 0}%
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
              <div className="flex items-center">
                <Award className="w-4 h-4 text-primary mr-2" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Meals</span>
              </div>
              <p className="mt-2 text-xl font-semibold dark:text-white">
                {meals.length}
              </p>
            </div>
          </motion.div>
        </motion.div>
      </PremiumFeatureOverlay>

      {/* Today's Meals */}
      <PremiumFeatureOverlay
        title="Today's Meals"
        isPremium={isPremium}
        onUnlock={onUnlockPremium}
      >
        <motion.div 
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="bg-primary/10 dark:bg-primary/20 p-2 rounded-full mr-3">
                <Utensils className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold dark:text-white">Today's Meals</h2>
            </div>
            <AddMealDialog onSave={onSaveMeal} />
          </div>

          <div className="space-y-4">
            {meals.length === 0 ? (
              <motion.div 
                className="text-center py-8 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/30 rounded-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Utensils className="w-10 h-10 mx-auto mb-3 text-gray-400 dark:text-gray-500" />
                <p>No meals logged today</p>
                <p className="text-sm mt-2">Add a meal or upload a food photo</p>
                <Button 
                  onClick={() => document.querySelector('[data-add-meal-dialog="true"]')?.click()}
                  className="mt-4 bg-primary/10 text-primary hover:bg-primary/20 dark:bg-primary/20 dark:hover:bg-primary/30"
                  variant="ghost"
                >
                  Add your first meal
                </Button>
              </motion.div>
            ) : (
              <motion.div
                className="space-y-4"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {meals.map((meal) => (
                  <motion.div key={meal.id} variants={itemVariants}>
                    <MealItem 
                      meal={meal} 
                      onDelete={onDeleteMeal}
                      onUpdate={onUpdateMeal}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </motion.div>
      </PremiumFeatureOverlay>
    </motion.div>
  );
};

export default ProfileContent;
