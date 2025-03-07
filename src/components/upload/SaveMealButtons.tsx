
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, ChevronRight } from "lucide-react";
import { useState } from "react";

interface SaveMealButtonsProps {
  onSave: (mealType: string) => Promise<boolean>;
  onGoToProfile: () => void;
  saving: boolean;
  detectedFoods: any[];
}

const SaveMealButtons = ({ onSave, onGoToProfile, saving, detectedFoods }: SaveMealButtonsProps) => {
  const [mealType, setMealType] = useState("Snack");
  
  const handleSave = async () => {
    const success = await onSave(mealType);
    if (success) {
      onGoToProfile();
    }
  };
  
  if (detectedFoods.length === 0) {
    return null;
  }
  
  return (
    <div className="mt-6 bg-primary/5 p-4 rounded-lg border border-primary/20">
      <h3 className="font-medium mb-3">Save detected foods to meal log</h3>
      <div className="flex flex-col sm:flex-row gap-3">
        <Select
          value={mealType}
          onValueChange={setMealType}
        >
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Meal type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Breakfast">Breakfast</SelectItem>
            <SelectItem value="Lunch">Lunch</SelectItem>
            <SelectItem value="Dinner">Dinner</SelectItem>
            <SelectItem value="Snack">Snack</SelectItem>
          </SelectContent>
        </Select>
        
        <Button
          onClick={handleSave}
          disabled={saving || detectedFoods.length === 0}
          className="flex-1"
        >
          {saving ? (
            "Saving..."
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save to Meal Log
            </>
          )}
        </Button>
        
        <Button 
          variant="outline"
          onClick={onGoToProfile}
          className="flex-1 sm:flex-none"
        >
          View Profile <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};

export default SaveMealButtons;
