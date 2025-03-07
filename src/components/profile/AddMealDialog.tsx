
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle } from "lucide-react";
import type { MealEntry } from "../../types/user.types";

interface AddMealDialogProps {
  onSave: (meal: Omit<MealEntry, 'id' | 'user_id' | 'date'>) => Promise<any>;
}

const AddMealDialog = ({ onSave }: AddMealDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newMeal, setNewMeal] = useState<Omit<MealEntry, 'id' | 'user_id' | 'date'>>({
    name: 'Snack',
    food_items: [],
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    time: new Date().toTimeString().slice(0, 5)
  });

  const handleChange = (field: string, value: any) => {
    setNewMeal(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Convert time from input format to ISO string if needed
      const timeForStorage = newMeal.time.includes('T') 
        ? newMeal.time 
        : `${new Date().toISOString().split('T')[0]}T${newMeal.time}`;
        
      const mealToSave = {
        ...newMeal,
        time: timeForStorage
      };
      
      await onSave(mealToSave);
      
      // Reset form
      setNewMeal({
        name: 'Snack',
        food_items: [],
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        time: new Date().toTimeString().slice(0, 5)
      });
      
      setOpen(false);
    } catch (error) {
      console.error('Error adding meal:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="mb-4">
          <PlusCircle className="w-4 h-4 mr-1" /> Add Meal
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Meal</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="meal-type" className="text-right">Meal Type</Label>
            <Select
              value={newMeal.name}
              onValueChange={(value) => handleChange('name', value)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select meal type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Breakfast">Breakfast</SelectItem>
                <SelectItem value="Lunch">Lunch</SelectItem>
                <SelectItem value="Dinner">Dinner</SelectItem>
                <SelectItem value="Snack">Snack</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="meal-time" className="text-right">Time</Label>
            <Input
              id="meal-time"
              type="time"
              value={newMeal.time}
              onChange={(e) => handleChange('time', e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="meal-calories" className="text-right">Calories</Label>
            <Input
              id="meal-calories"
              type="number"
              value={newMeal.calories}
              onChange={(e) => handleChange('calories', Number(e.target.value))}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="meal-protein" className="text-right">Protein (g)</Label>
            <Input
              id="meal-protein"
              type="number"
              value={newMeal.protein}
              onChange={(e) => handleChange('protein', Number(e.target.value))}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="meal-carbs" className="text-right">Carbs (g)</Label>
            <Input
              id="meal-carbs"
              type="number"
              value={newMeal.carbs}
              onChange={(e) => handleChange('carbs', Number(e.target.value))}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="meal-fat" className="text-right">Fat (g)</Label>
            <Input
              id="meal-fat"
              type="number"
              value={newMeal.fat}
              onChange={(e) => handleChange('fat', Number(e.target.value))}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save Meal'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddMealDialog;
