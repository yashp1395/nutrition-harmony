
import { Button } from "@/components/ui/button";
import type { FoodItem } from "../../types/database.types";

interface DetectedFood {
  name: string;
  confidence: number;
  nutrition?: FoodItem;
  isManualEntry?: boolean;
}

interface DetectedFoodsListProps {
  detectedFoods: DetectedFood[];
  onRemoveFood: (index: number) => void;
}

const DetectedFoodsList = ({ detectedFoods, onRemoveFood }: DetectedFoodsListProps) => {
  if (detectedFoods.length === 0) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Detected Foods</h2>
      <div className="space-y-3">
        {detectedFoods.map((food, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium">{food.name}</p>
              <p className="text-sm text-gray-600">
                Calories: {food.nutrition?.calories} kcal | 
                Protein: {food.nutrition?.protein}g | 
                Carbs: {food.nutrition?.carbs}g | 
                Fat: {food.nutrition?.fat}g
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemoveFood(index)}
            >
              Remove
            </Button>
          </div>
        ))}
      </div>

      <div className="mt-4 p-4 bg-primary/10 rounded-lg">
        <h3 className="font-semibold mb-2">Total Nutrition</h3>
        <p>
          Calories: {detectedFoods.reduce((sum, food) => sum + (food.nutrition?.calories || 0), 0)} kcal |
          Protein: {detectedFoods.reduce((sum, food) => sum + (food.nutrition?.protein || 0), 0)}g |
          Carbs: {detectedFoods.reduce((sum, food) => sum + (food.nutrition?.carbs || 0), 0)}g |
          Fat: {detectedFoods.reduce((sum, food) => sum + (food.nutrition?.fat || 0), 0)}g
        </p>
      </div>
    </div>
  );
};

export default DetectedFoodsList;
