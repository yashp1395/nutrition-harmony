import { motion } from "framer-motion";
import { Calendar, Utensils } from "lucide-react";
import type { MealEntry } from "@/types/user.types";

interface MealHistoryProps {
  meals: MealEntry[];
}

const MealHistory = ({ meals }: MealHistoryProps) => {
  // Group meals by date
  const groupedMeals = meals.reduce((acc, meal) => {
    const date = meal.date || new Date().toISOString().split('T')[0];
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(meal);
    return acc;
  }, {} as Record<string, MealEntry[]>);

  const sortedDates = Object.keys(groupedMeals).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (dateStr === today.toISOString().split('T')[0]) {
      return 'Today';
    } else if (dateStr === yesterday.toISOString().split('T')[0]) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  if (meals.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <Utensils className="w-10 h-10 mx-auto mb-3 text-gray-400 dark:text-gray-500" />
        <p>No meal history yet</p>
        <p className="text-sm mt-2">Start tracking your meals to see history here</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {sortedDates.slice(0, 7).map((date, dateIndex) => (
        <motion.div 
          key={date}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: dateIndex * 0.1 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-primary" />
            <h3 className="font-medium text-gray-700 dark:text-gray-300">{formatDate(date)}</h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              ({groupedMeals[date].reduce((sum, m) => sum + m.calories, 0)} kcal)
            </span>
          </div>
          <div className="space-y-2 pl-6 border-l-2 border-primary/20">
            {groupedMeals[date].map((meal, mealIndex) => (
              <motion.div
                key={meal.id}
                className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: dateIndex * 0.1 + mealIndex * 0.05 }}
              >
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-200">{meal.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{meal.time}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-primary">{meal.calories} kcal</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    P: {meal.protein || 0}g · C: {meal.carbs || 0}g · F: {meal.fat || 0}g
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default MealHistory;
