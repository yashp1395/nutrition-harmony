
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronRight, Edit2, Trash2, Activity, Clock, Flame, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { MealEntry } from "../../types/user.types";

interface MealItemProps {
  meal: MealEntry;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<MealEntry>) => void;
}

const MealItem = ({ meal, onDelete, onUpdate }: MealItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedMeal, setEditedMeal] = useState<MealEntry>(meal);
  const [expanded, setExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleChange = (field: keyof MealEntry, value: any) => {
    setEditedMeal(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (meal.id) {
      onUpdate(meal.id, editedMeal);
    }
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (confirmDelete && meal.id) {
      onDelete(meal.id);
      setConfirmDelete(false);
    } else {
      setConfirmDelete(true);
      // Auto-reset after 3 seconds
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  };

  const formatTime = (timeString: string) => {
    try {
      // If time is in ISO format, convert to 12-hour format
      if (timeString.includes('T')) {
        const date = new Date(timeString);
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
      }
      // Return as is if already in desired format
      return timeString;
    } catch (error) {
      return timeString;
    }
  };

  // Get meal type based on time
  const getMealType = (timeString: string) => {
    try {
      let hour;
      if (timeString.includes('T')) {
        const date = new Date(timeString);
        hour = date.getHours();
      } else {
        const [hourStr] = timeString.split(':');
        hour = parseInt(hourStr, 10);
      }
      
      if (hour < 10) return 'Breakfast';
      if (hour < 14) return 'Lunch';
      if (hour < 17) return 'Snack';
      return 'Dinner';
    } catch (error) {
      return 'Meal';
    }
  };

  const mealType = getMealType(meal.time);
  const mealTypeColors = {
    Breakfast: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    Lunch: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    Snack: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    Dinner: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    Meal: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  };

  return (
    <motion.div 
      className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-300"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      layout
    >
      <div 
        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 dark:bg-primary/20 p-2 rounded-full">
            <Activity className="w-4 h-4 text-primary" />
          </div>
          <div>
            <div className="font-medium dark:text-white">{meal.name}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center mt-1">
              <Clock className="w-3 h-3 mr-1" />
              {formatTime(meal.time)}
              <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${mealTypeColors[mealType as keyof typeof mealTypeColors]}`}>
                {mealType}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-primary/5 dark:bg-primary/10 px-2 py-1 rounded-full">
            <Flame className="w-3.5 h-3.5 text-primary mr-1" />
            <span className="text-sm font-medium text-primary">
              {meal.calories} kcal
            </span>
          </div>
          <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${expanded ? 'rotate-90' : ''}`} />
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div 
            className="px-4 py-3 bg-white dark:bg-gray-800"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="grid grid-cols-4 gap-4 mb-3">
              <div className="bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg text-center">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Calories</p>
                <p className="text-sm font-semibold dark:text-white">{meal.calories} kcal</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg text-center">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Protein</p>
                <p className="text-sm font-semibold dark:text-white">{meal.protein || 0}g</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg text-center">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Carbs</p>
                <p className="text-sm font-semibold dark:text-white">{meal.carbs || 0}g</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg text-center">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Fat</p>
                <p className="text-sm font-semibold dark:text-white">{meal.fat || 0}g</p>
              </div>
            </div>
            
            {meal.image_url && (
              <div className="mb-3 overflow-hidden rounded-lg">
                <img 
                  src={meal.image_url} 
                  alt={meal.name} 
                  className="w-full h-40 object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            )}
            
            <div className="flex justify-end gap-2 mt-4">
              <Dialog open={isEditing} onOpenChange={setIsEditing}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9">
                    <Edit2 className="w-4 h-4 mr-1" /> Edit
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] dark:bg-gray-800 dark:text-white border dark:border-gray-700">
                  <DialogHeader>
                    <DialogTitle className="dark:text-white flex items-center">
                      <Edit2 className="w-4 h-4 mr-2 text-primary" /> Edit Meal
                    </DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="meal-name" className="text-right dark:text-gray-300">Name</Label>
                      <Input
                        id="meal-name"
                        value={editedMeal.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        className="col-span-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="meal-time" className="text-right dark:text-gray-300">Time</Label>
                      <Input
                        id="meal-time"
                        type="time"
                        value={editedMeal.time.includes('T') 
                          ? new Date(editedMeal.time).toTimeString().slice(0, 5) 
                          : editedMeal.time}
                        onChange={(e) => handleChange('time', e.target.value)}
                        className="col-span-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="meal-calories" className="text-right dark:text-gray-300">Calories</Label>
                      <Input
                        id="meal-calories"
                        type="number"
                        value={editedMeal.calories}
                        onChange={(e) => handleChange('calories', Number(e.target.value))}
                        className="col-span-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="meal-protein" className="text-right dark:text-gray-300">Protein (g)</Label>
                      <Input
                        id="meal-protein"
                        type="number"
                        value={editedMeal.protein || 0}
                        onChange={(e) => handleChange('protein', Number(e.target.value))}
                        className="col-span-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="meal-carbs" className="text-right dark:text-gray-300">Carbs (g)</Label>
                      <Input
                        id="meal-carbs"
                        type="number"
                        value={editedMeal.carbs || 0}
                        onChange={(e) => handleChange('carbs', Number(e.target.value))}
                        className="col-span-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="meal-fat" className="text-right dark:text-gray-300">Fat (g)</Label>
                      <Input
                        id="meal-fat"
                        type="number"
                        value={editedMeal.fat || 0}
                        onChange={(e) => handleChange('fat', Number(e.target.value))}
                        className="col-span-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsEditing(false)} className="dark:border-gray-600 dark:text-gray-200">
                      Cancel
                    </Button>
                    <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">Save Changes</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              <Button 
                variant={confirmDelete ? "destructive" : "outline"} 
                size="sm" 
                onClick={handleDelete}
                className={`h-9 ${confirmDelete ? 'animate-pulse' : ''}`}
              >
                {confirmDelete ? (
                  <>
                    <AlertCircle className="w-4 h-4 mr-1" /> Confirm
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-1" /> Delete
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MealItem;
