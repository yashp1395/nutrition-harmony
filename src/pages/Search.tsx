import { useState } from "react";
import Navbar from "../components/Navbar";
import SearchBar from "../components/SearchBar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Apple, Beef, Carrot, Fish, Pizza } from "lucide-react";

interface FoodItem {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  icon: JSX.Element;
}

const mockFoodData: FoodItem[] = [
  {
    name: "Apple",
    calories: 95,
    protein: 0.5,
    carbs: 25,
    fat: 0.3,
    icon: <Apple className="w-8 h-8 text-red-500" />,
  },
  {
    name: "Beef Steak",
    calories: 250,
    protein: 26,
    carbs: 0,
    fat: 17,
    icon: <Beef className="w-8 h-8 text-red-700" />,
  },
  {
    name: "Carrot",
    calories: 41,
    protein: 0.9,
    carbs: 10,
    fat: 0.2,
    icon: <Carrot className="w-8 h-8 text-orange-500" />,
  },
  {
    name: "Salmon",
    calories: 208,
    protein: 22,
    carbs: 0,
    fat: 13,
    icon: <Fish className="w-8 h-8 text-pink-400" />,
  },
  {
    name: "Pizza Slice",
    calories: 285,
    protein: 12,
    carbs: 36,
    fat: 10,
    icon: <Pizza className="w-8 h-8 text-yellow-600" />,
  },
];

const Search = () => {
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [searchResults, setSearchResults] = useState<FoodItem[]>(mockFoodData);

  const handleFoodSelect = (food: FoodItem) => {
    setSelectedFood(food);
    console.log("Selected food:", food);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <SearchBar />
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-4">Search Results</h2>
              <div className="space-y-4">
                {searchResults.map((food) => (
                  <Button
                    key={food.name}
                    variant="outline"
                    className="w-full justify-start gap-4 h-auto py-4"
                    onClick={() => handleFoodSelect(food)}
                  >
                    {food.icon}
                    <div className="text-left">
                      <div className="font-medium">{food.name}</div>
                      <div className="text-sm text-gray-500">
                        {food.calories} calories
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {selectedFood && (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center gap-4 mb-6">
                  {selectedFood.icon}
                  <h2 className="text-2xl font-semibold">{selectedFood.name}</h2>
                </div>

                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">Calories</span>
                      <span>{selectedFood.calories} kcal</span>
                    </div>
                    <Progress value={selectedFood.calories / 10} />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">Protein</span>
                      <span>{selectedFood.protein}g</span>
                    </div>
                    <Progress value={selectedFood.protein * 2} />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">Carbs</span>
                      <span>{selectedFood.carbs}g</span>
                    </div>
                    <Progress value={selectedFood.carbs} />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">Fat</span>
                      <span>{selectedFood.fat}g</span>
                    </div>
                    <Progress value={selectedFood.fat * 2} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Search;