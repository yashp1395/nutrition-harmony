import Navbar from "../components/Navbar";
import SearchBar from "../components/SearchBar";
import { Apple, Carrot, Coffee, Search, Upload, User } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="animate-fadeIn">
        {/* Hero Section */}
        <div className="bg-gradient-to-b from-white to-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
                Track Your <span className="text-primary">Nutrition</span> Journey
              </h1>
              <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                Search for any food to get instant nutrition information. Upload food images for quick calorie detection.
              </p>
              
              <div className="mt-10 flex justify-center">
                <SearchBar />
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <FeatureCard
              icon={<Search className="w-8 h-8 text-primary" />}
              title="Search Foods"
              description="Get instant access to nutritional information for any food item."
            />
            <FeatureCard
              icon={<Upload className="w-8 h-8 text-primary" />}
              title="Image Upload"
              description="Upload food images to automatically detect calories and nutrients."
            />
            <FeatureCard
              icon={<User className="w-8 h-8 text-primary" />}
              title="Track Progress"
              description="Monitor your daily nutrition intake and achieve your health goals."
            />
          </div>
        </div>

        {/* Food Icons Section */}
        <div className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900">Popular Foods</h2>
              <div className="mt-10 flex justify-center space-x-12">
                <FoodIcon icon={<Apple className="w-12 h-12" />} name="Fruits" />
                <FoodIcon icon={<Carrot className="w-12 h-12" />} name="Vegetables" />
                <FoodIcon icon={<Coffee className="w-12 h-12" />} name="Beverages" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
    <div className="flex flex-col items-center text-center">
      {icon}
      <h3 className="mt-4 text-xl font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-gray-500">{description}</p>
    </div>
  </div>
);

const FoodIcon = ({ icon, name }: { icon: React.ReactNode; name: string }) => (
  <div className="flex flex-col items-center">
    <div className="p-4 bg-gray-50 rounded-full">{icon}</div>
    <span className="mt-2 text-sm font-medium text-gray-600">{name}</span>
  </div>
);

export default Index;