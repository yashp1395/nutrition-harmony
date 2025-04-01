
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { DetectedFood } from "../../types/database.types";

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
          <Card key={index} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex items-center justify-between p-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-lg capitalize">{food.name}</p>
                    <Badge variant="outline" className="ml-2 text-white">
                      {food.servingSize}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-4 gap-2 mt-2 text-sm">
                    <div>
                      <p className="font-medium text-white">Calories</p>
                      <p>{food.nutrition?.calories} kcal</p>
                    </div>
                    <div>
                      <p className="font-medium text-white">Protein</p>
                      <p>{food.nutrition?.protein}g</p>
                    </div>
                    <div>
                      <p className="font-medium text-white">Carbs</p>
                      <p>{food.nutrition?.carbs}g</p>
                    </div>
                    <div>
                      <p className="font-medium text-white">Fat</p>
                      <p>{food.nutrition?.fat}g</p>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveFood(index)}
                >
                  Remove
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* <Card className="mt-4 bg-primary/10">
        <CardContent className="p-4 text-gray-500">
          <h3 className="font-semibold mb-2">Total Nutrition</h3>
          <div className="grid grid-cols-4 gap-2">
            <div>
              <p className="font-medium">Calories</p>
              <p>{detectedFoods.reduce((sum, food) => sum + (food.nutrition?.calories || 0), 0)} kcal</p>
            </div>
            <div>
              <p className="font-medium">Protein</p>
              <p>{detectedFoods.reduce((sum, food) => sum + (food.nutrition?.protein || 0), 0)}g</p>
            </div>
            <div>
              <p className="font-medium">Carbs</p>
              <p>{detectedFoods.reduce((sum, food) => sum + (food.nutrition?.carbs || 0), 0)}g</p>
            </div>
            <div>
              <p className="font-medium">Fat</p>
              <p>{detectedFoods.reduce((sum, food) => sum + (food.nutrition?.fat || 0), 0)}g</p>
            </div>
          </div>
        </CardContent>
      </Card> */}
    </div>
  );
};

export default DetectedFoodsList;
