import Navbar from "../components/Navbar";
import SearchBar from "../components/SearchBar";
import { Apple, Carrot, Coffee, Search, Upload, User, ChevronRight, ArrowRight, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTheme } from "../hooks/useTheme";
import { motion } from "framer-motion";

const Index = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  
  const handleSectionClick = (path: string) => {
    navigate(path);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      
      <main className="pt-16">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 z-0 opacity-10 dark:opacity-5">
            <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern bg-repeat"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 relative z-10">
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-50 sm:text-5xl md:text-6xl">
                Track Your <span className="text-primary">Nutrition</span> Journey
                <span className="ml-2 inline-block animate-float">🥗</span>
              </h1>
              <p className="mt-4 max-w-md mx-auto text-base text-gray-500 dark:text-gray-300 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                Search for any food to get instant nutrition information. Upload food images for quick calorie detection.
              </p>
              
              <motion.div 
                className="mt-10 flex flex-col sm:flex-row justify-center gap-4 sm:gap-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.7 }}
              >
                <div className="w-full sm:w-auto sm:min-w-[300px] md:min-w-[400px] glass-effect p-2 rounded-lg">
                  <SearchBar />
                </div>
                <Button 
                  className="btn-hover bg-gradient-to-r from-green-500 to-primary text-white px-6 py-6 h-auto flex items-center gap-2"
                  onClick={() => navigate('/search')}
                >
                  <span>Advanced Search</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Features Section */}
        <div className="section-container">
          <motion.h2 
            className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            How it Works
          </motion.h2>
          
          <motion.div 
            className="grid grid-cols-1 gap-8 md:grid-cols-3"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div 
              onClick={() => handleSectionClick('/search')}
              className="cursor-pointer card-hover"
              variants={itemVariants}
            >
              <FeatureCard
                icon={<Search className="w-8 h-8 text-primary" />}
                title="Search Foods"
                description="Get instant access to nutritional information for any food item."
                index={1}
              />
            </motion.div>
            
            <motion.div 
              onClick={() => handleSectionClick('/upload')}
              className="cursor-pointer card-hover"
              variants={itemVariants}
            >
              <FeatureCard
                icon={<Upload className="w-8 h-8 text-primary" />}
                title="Image Upload"
                description="Upload food images to automatically detect calories and nutrients."
                index={2}
              />
            </motion.div>
            
            <motion.div 
              onClick={() => handleSectionClick('/profile')}
              className="cursor-pointer card-hover"
              variants={itemVariants}
            >
              <FeatureCard
                icon={<User className="w-8 h-8 text-primary" />}
                title="Track Progress"
                description="Monitor your daily nutrition intake and achieve your health goals."
                index={3}
              />
            </motion.div>
          </motion.div>
        </div>

        {/* Benefits Section */}
        <div className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center mb-12"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Why Use Calorie Tracker?</h2>
              <p className="mt-4 text-gray-500 dark:text-gray-300 max-w-2xl mx-auto">
                Our comprehensive nutrition tracking solution helps you make better food choices.
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <motion.div 
                className="flex items-start gap-4"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className="bg-primary/10 p-3 rounded-full">
                  <CheckCircle className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Accurate Tracking</h3>
                  <p className="mt-2 text-gray-500 dark:text-gray-300">
                    Get precise nutritional information for thousands of foods.
                  </p>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex items-start gap-4"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <div className="bg-primary/10 p-3 rounded-full">
                  <CheckCircle className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">AI-Powered</h3>
                  <p className="mt-2 text-gray-500 dark:text-gray-300">
                    Advanced AI technology identifies foods from your photos.
                  </p>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex items-start gap-4"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="bg-primary/10 p-3 rounded-full">
                  <CheckCircle className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Goal Setting</h3>
                  <p className="mt-2 text-gray-500 dark:text-gray-300">
                    Set and track personalized nutrition goals for optimal health.
                  </p>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex items-start gap-4"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div className="bg-primary/10 p-3 rounded-full">
                  <CheckCircle className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Detailed Analytics</h3>
                  <p className="mt-2 text-gray-500 dark:text-gray-300">
                    Visualize your nutrition data with comprehensive charts.
                  </p>
                </div>
              </motion.div>
            </div>
            
            <motion.div 
              className="mt-12 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Button 
                onClick={() => navigate('/profile')}
                className="bg-gradient-to-r from-green-500 to-primary hover:from-green-600 hover:to-primary/90 text-white px-8 py-6 h-auto text-lg font-medium rounded-md shadow-md hover:shadow-lg transition-all"
              >
                Start Tracking Now 
                <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Food Icons Section */}
        <div className="bg-white dark:bg-gray-800 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Popular Foods</h2>
              <div className="mt-10 flex flex-wrap justify-center gap-10 staggered-fade-in">
                <FoodIcon icon={<Apple className="w-12 h-12" />} name="Fruits" />
                <FoodIcon icon={<Carrot className="w-12 h-12" />} name="Vegetables" />
                <FoodIcon icon={<Coffee className="w-12 h-12" />} name="Beverages" />
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

const FeatureCard = ({ icon, title, description, index }: { icon: React.ReactNode; title: string; description: string; index: number }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-700 h-full">
    <div className="flex flex-col items-center text-center">
      <div className="mb-4 bg-primary/10 dark:bg-primary/20 p-4 rounded-full relative">
        {icon}
        <div className="absolute -top-2 -right-2 bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium">
          {index}
        </div>
      </div>
      <h3 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">{title}</h3>
      <p className="mt-2 text-gray-500 dark:text-gray-300">{description}</p>
    </div>
  </div>
);

const FoodIcon = ({ icon, name }: { icon: React.ReactNode; name: string }) => (
  <div className="flex flex-col items-center group">
    <div className="p-5 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-full shadow-sm group-hover:shadow-md transition-all group-hover:scale-110 duration-300">
      <div className="text-gray-600 dark:text-gray-300 group-hover:text-primary dark:group-hover:text-primary transition-colors">
        {icon}
      </div>
    </div>
    <span className="mt-3 text-sm font-medium text-gray-600 dark:text-gray-300 group-hover:text-primary dark:group-hover:text-primary transition-colors">{name}</span>
  </div>
);

export default Index;
