
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getFoodItems, getIndianFoodItems } from "../lib/supabase";
import { searchFoodWithGemini, NutritionResult } from "../utils/gemini/foodSearch";
import Navbar from "../components/Navbar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Apple, Beef, Carrot, Fish, Pizza, PlusCircle, Search as SearchIcon, Loader2 } from "lucide-react";
import SearchBar from "../components/SearchBar";
import type { FoodItem } from "../types/database.types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useMeals } from "../hooks/useMeals";
import { toast } from "sonner";

const Search = () => {
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get("q") || "";
  const [query, setQuery] = useState(queryParam);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [addToMealOpen, setAddToMealOpen] = useState(false);
  const [mealType, setMealType] = useState("Snack");
  const [quantity, setQuantity] = useState(1);
  const { saveMeal } = useMeals();
  const [geminiResults, setGeminiResults] = useState<NutritionResult[]>([]);
  const [searchingGemini, setSearchingGemini] = useState(false);

  // Search with Gemini when query param changes
  useEffect(() => {
    if (queryParam) {
      setQuery(queryParam);
      searchWithGemini(queryParam);
    }
  }, [queryParam]);

  const searchWithGemini = async (searchQuery: string) => {
    if (!searchQuery) return;
    
    setSearchingGemini(true);
    try {
      const results = await searchFoodWithGemini(searchQuery);
      setGeminiResults(results);
      console.log("Gemini search results:", results);
      
      // If results found, select the first one
      if (results.length > 0) {
        const firstResult = results[0];
        const formattedFood: FoodItem = {
          id: `gemini-${Date.now()}`,
          name: firstResult.name,
          category: "gemini-search",
          calories: firstResult.calories,
          protein: firstResult.protein,
          carbs: firstResult.carbs,
          fat: firstResult.fat,
          fiber: firstResult.fiber,
          is_indian_cuisine: false,
          description: `Serving size: ${firstResult.servingSize}`
        };
        setSelectedFood(formattedFood);
      }
    } catch (error) {
      console.error("Error searching with Gemini:", error);
      toast.error("Failed to search for food. Please try again.");
    } finally {
      setSearchingGemini(false);
    }
  };

  // Database queries (fallback)
  const { data: allFoods, isLoading: isLoadingAll } = useQuery({
    queryKey: ["foods", query],
    queryFn: () => getFoodItems(query),
    enabled: geminiResults.length === 0 && query.length > 0,
  });

  const { data: indianFoods, isLoading: isLoadingIndian } = useQuery({
    queryKey: ["indian-foods", query],
    queryFn: () => getIndianFoodItems(query),
    enabled: activeTab === "indian" && geminiResults.length === 0 && query.length > 0,
  });

  const handleFoodSelect = (food: FoodItem) => {
    setSelectedFood(food);
    console.log("Selected food:", food);
  };

  const handleGeminiResultSelect = (result: NutritionResult) => {
    const formattedFood: FoodItem = {
      id: `gemini-${Date.now()}-${result.name}`,
      name: result.name,
      category: "gemini-search",
      calories: result.calories,
      protein: result.protein,
      carbs: result.carbs,
      fat: result.fat,
      fiber: result.fiber,
      is_indian_cuisine: false,
      description: `Serving size: ${result.servingSize}`
    };
    setSelectedFood(formattedFood);
  };

  const handleAddToMeal = async () => {
    if (!selectedFood) return;
    
    try {
      const currentTime = new Date();
      const meal = {
        name: mealType,
        food_items: [
          {
            ...selectedFood,
            quantity: quantity
          }
        ],
        calories: selectedFood.calories * quantity,
        protein: (selectedFood.protein || 0) * quantity,
        carbs: (selectedFood.carbs || 0) * quantity,
        fat: (selectedFood.fat || 0) * quantity,
        time: currentTime.toISOString()
      };

      const result = await saveMeal(meal);
      
      if (result) {
        toast.success(`Added ${selectedFood.name} to ${mealType}`);
        setAddToMealOpen(false);
      }
    } catch (error) {
      console.error("Error adding food to meal:", error);
      toast.error("Failed to add food to meal");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <SearchBar />
          </div>

          {searchingGemini && (
            <div className="flex justify-center my-8">
              <div className="flex flex-col items-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
                <p className="text-gray-600">Searching with Gemini AI...</p>
              </div>
            </div>
          )}

          {geminiResults.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Search Results</h2>
              <div className="grid gap-4">
                {geminiResults.map((result, index) => (
                  <Button
                    key={`gemini-${index}`}
                    variant="outline"
                    className="w-full justify-start gap-4 h-auto py-4"
                    onClick={() => handleGeminiResultSelect(result)}
                  >
                    <div className="text-left">
                      <div className="font-medium">{result.name}</div>
                      <div className="text-sm text-gray-500">
                        {result.calories} calories • {result.servingSize}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {geminiResults.length === 0 && !searchingGemini && (
            <Tabs defaultValue="all" className="mb-8">
              <TabsList>
                <TabsTrigger value="all">All Foods</TabsTrigger>
                <TabsTrigger value="indian">Indian Cuisine</TabsTrigger>
              </TabsList>
              <TabsContent value="all">
                <div className="grid gap-4">
                  {isLoadingAll ? (
                    <div>Loading...</div>
                  ) : (
                    allFoods?.map((food) => (
                      <Button
                        key={food.id}
                        variant="outline"
                        className="w-full justify-start gap-4 h-auto py-4"
                        onClick={() => handleFoodSelect(food)}
                      >
                        <div className="text-left">
                          <div className="font-medium">{food.name}</div>
                          <div className="text-sm text-gray-500">
                            {food.calories} calories
                          </div>
                        </div>
                      </Button>
                    ))
                  )}
                </div>
              </TabsContent>
              <TabsContent value="indian">
                <div className="grid gap-4">
                  {isLoadingIndian ? (
                    <div>Loading...</div>
                  ) : (
                    indianFoods?.map((food) => (
                      <Button
                        key={food.id}
                        variant="outline"
                        className="w-full justify-start gap-4 h-auto py-4"
                        onClick={() => handleFoodSelect(food)}
                      >
                        <div className="text-left">
                          <div className="font-medium">{food.name}</div>
                          <div className="text-sm text-gray-500">
                            {food.calories} calories
                          </div>
                        </div>
                      </Button>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}

          {selectedFood && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>{selectedFood.name}</CardTitle>
                {selectedFood.description && (
                  <p className="text-sm text-gray-500">{selectedFood.description}</p>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">Calories</span>
                      <span>{selectedFood.calories} kcal</span>
                    </div>
                    <Progress value={(selectedFood.calories / 2000) * 100} />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">Protein</span>
                      <span>{selectedFood.protein}g</span>
                    </div>
                    <Progress value={(selectedFood.protein / 50) * 100} />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">Carbs</span>
                      <span>{selectedFood.carbs}g</span>
                    </div>
                    <Progress value={(selectedFood.carbs / 300) * 100} />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">Fat</span>
                      <span>{selectedFood.fat}g</span>
                    </div>
                    <Progress value={(selectedFood.fat / 65) * 100} />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">Fiber</span>
                      <span>{selectedFood.fiber}g</span>
                    </div>
                    <Progress value={(selectedFood.fiber / 25) * 100} />
                  </div>

                  <Dialog open={addToMealOpen} onOpenChange={setAddToMealOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full mt-4">
                        <PlusCircle className="w-4 h-4 mr-2" /> Add to Meal
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add to Meal</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="meal-type" className="text-right">
                            Meal
                          </Label>
                          <Select
                            value={mealType}
                            onValueChange={setMealType}
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
                          <Label htmlFor="quantity" className="text-right">
                            Quantity
                          </Label>
                          <Input
                            id="quantity"
                            type="number"
                            value={quantity}
                            onChange={(e) => setQuantity(Number(e.target.value))}
                            min={0.5}
                            step={0.5}
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <div className="text-right text-sm text-gray-500">Total</div>
                          <div className="col-span-3">
                            <div className="text-sm">
                              {(selectedFood.calories * quantity).toFixed(0)} calories
                            </div>
                            <div className="text-xs text-gray-500">
                              {(selectedFood.protein * quantity).toFixed(1)}g protein, 
                              {(selectedFood.carbs * quantity).toFixed(1)}g carbs, 
                              {(selectedFood.fat * quantity).toFixed(1)}g fat
                            </div>
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setAddToMealOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleAddToMeal}>
                          Add to Meal
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default Search;
