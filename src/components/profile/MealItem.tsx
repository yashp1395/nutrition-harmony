
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronRight, Edit2, Trash2, Activity } from "lucide-react";
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
    if (meal.id) {
      onDelete(meal.id);
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

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div 
        className="flex items-center justify-between p-3 bg-gray-50 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-4">
          <Activity className="w-5 h-5 text-primary" />
          <div>
            <div className="font-medium">{meal.name}</div>
            <div className="text-sm text-gray-500">
              {formatTime(meal.time)}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {meal.calories} kcal
          </span>
          <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? 'rotate-90' : ''}`} />
        </div>
      </div>

      {expanded && (
        <div className="px-4 py-3 bg-white">
          <div className="grid grid-cols-4 gap-4 mb-3">
            <div>
              <p className="text-sm font-medium text-gray-700">Calories</p>
              <p className="text-sm">{meal.calories} kcal</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Protein</p>
              <p className="text-sm">{meal.protein || 0}g</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Carbs</p>
              <p className="text-sm">{meal.carbs || 0}g</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Fat</p>
              <p className="text-sm">{meal.fat || 0}g</p>
            </div>
          </div>
          
          {meal.image_url && (
            <div className="mb-3">
              <img 
                src={meal.image_url} 
                alt={meal.name} 
                className="w-full h-32 object-cover rounded-md"
              />
            </div>
          )}
          
          <div className="flex justify-end gap-2 mt-2">
            <Dialog open={isEditing} onOpenChange={setIsEditing}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Edit2 className="w-4 h-4 mr-1" /> Edit
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Meal</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="meal-name" className="text-right">Name</Label>
                    <Input
                      id="meal-name"
                      value={editedMeal.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="meal-time" className="text-right">Time</Label>
                    <Input
                      id="meal-time"
                      type="time"
                      value={editedMeal.time.includes('T') 
                        ? new Date(editedMeal.time).toTimeString().slice(0, 5) 
                        : editedMeal.time}
                      onChange={(e) => handleChange('time', e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="meal-calories" className="text-right">Calories</Label>
                    <Input
                      id="meal-calories"
                      type="number"
                      value={editedMeal.calories}
                      onChange={(e) => handleChange('calories', Number(e.target.value))}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="meal-protein" className="text-right">Protein (g)</Label>
                    <Input
                      id="meal-protein"
                      type="number"
                      value={editedMeal.protein || 0}
                      onChange={(e) => handleChange('protein', Number(e.target.value))}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="meal-carbs" className="text-right">Carbs (g)</Label>
                    <Input
                      id="meal-carbs"
                      type="number"
                      value={editedMeal.carbs || 0}
                      onChange={(e) => handleChange('carbs', Number(e.target.value))}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="meal-fat" className="text-right">Fat (g)</Label>
                    <Input
                      id="meal-fat"
                      type="number"
                      value={editedMeal.fat || 0}
                      onChange={(e) => handleChange('fat', Number(e.target.value))}
                      className="col-span-3"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave}>Save Changes</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <Button variant="outline" size="sm" onClick={handleDelete}>
              <Trash2 className="w-4 h-4 mr-1" /> Delete
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MealItem;
