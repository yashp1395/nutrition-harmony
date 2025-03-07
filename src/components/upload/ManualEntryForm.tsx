
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Edit2, Loader2, Search } from "lucide-react";
import { searchFoodWithGemini } from "@/utils/gemini/foodSearch";
import { toast } from "sonner";
import type { NutritionResult } from "@/utils/gemini/foodSearch";

interface ManualEntryFormProps {
  onAddFood: (foodName: string) => void;
}

const ManualEntryForm = ({ onAddFood }: ManualEntryFormProps) => {
  const [manualEntry, setManualEntry] = useState("");
  const [searchResults, setSearchResults] = useState<NutritionResult[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    if (manualEntry.trim()) {
      onAddFood(manualEntry);
      setManualEntry("");
      setSearchResults([]);
    }
  };

  const handleSearch = async () => {
    if (!manualEntry.trim()) return;
    
    try {
      setLoading(true);
      const results = await searchFoodWithGemini(manualEntry);
      setSearchResults(results);
      setLoading(false);
    } catch (error) {
      console.error("Error searching for food:", error);
      toast.error("Failed to search for food. Please try again.");
      setLoading(false);
    }
  };

  const handleSelectFood = (food: NutritionResult) => {
    onAddFood(food.name);
    setManualEntry("");
    setSearchResults([]);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Manually add a food item..."
          value={manualEntry}
          onChange={(e) => setManualEntry(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <Button onClick={handleSearch} disabled={loading}>
          {loading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Search className="w-4 h-4 mr-2" />
          )}
          Search
        </Button>
      </div>

      {searchResults.length > 0 && (
        <div className="bg-white rounded-md border border-gray-200 shadow-sm p-4 mt-3">
          <h3 className="text-lg font-medium mb-3">Search Results</h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {searchResults.map((food, index) => (
              <div 
                key={index} 
                className="bg-gray-50 p-3 rounded-md hover:bg-gray-100 cursor-pointer transition-colors"
                onClick={() => handleSelectFood(food)}
              >
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-base">{food.name}</h4>
                  <span className="text-sm text-gray-600">{food.servingSize}</span>
                </div>
                <div className="grid grid-cols-4 gap-2 mt-2 text-sm">
                  <div>
                    <p className="font-medium text-gray-700">Calories</p>
                    <p>{food.calories} kcal</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Protein</p>
                    <p>{food.protein}g</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Carbs</p>
                    <p>{food.carbs}g</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Fat</p>
                    <p>{food.fat}g</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  className="mt-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectFood(food);
                  }}
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Add to List
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ManualEntryForm;
