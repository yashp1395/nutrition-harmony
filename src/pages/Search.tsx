import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getFoodItems, getIndianFoodItems } from "../lib/supabase";
import Navbar from "../components/Navbar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Apple, Beef, Carrot, Fish, Pizza } from "lucide-react";
import SearchBar from "../components/SearchBar";
import type { FoodItem } from "../types/database.types";

const Search = () => {
  const [query, setQuery] = useState("");
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  const { data: allFoods, isLoading: isLoadingAll } = useQuery({
    queryKey: ["foods", query],
    queryFn: () => getFoodItems(query),
  });

  const { data: indianFoods, isLoading: isLoadingIndian } = useQuery({
    queryKey: ["indian-foods", query],
    queryFn: () => getIndianFoodItems(query),
  });

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

          {selectedFood && (
            <Card>
              <CardHeader>
                <CardTitle>{selectedFood.name}</CardTitle>
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