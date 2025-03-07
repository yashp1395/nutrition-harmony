import Navbar from "../components/Navbar";
import { Button } from "@/components/ui/button";
import { Heart, Leaf, Zap, Shield } from "lucide-react";
const About = () => {
  return <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <section className="text-center mb-16">
            <h1 className="text-4xl font-bold mb-4">About Calorie Tracker</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We're on a mission to make healthy eating simple and accessible for
              everyone through advanced food recognition and nutritional tracking.
            </p>
          </section>

          <section className="grid md:grid-cols-2 gap-8 mb-16">
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
              <p className="text-gray-600">
                Calorie Tracker aims to revolutionize how people understand their
                food choices. By combining cutting-edge technology with nutritional
                science, we provide instant, accurate information about the food
                you eat.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
              <p className="text-gray-600">
                Simply search for any food item or upload a photo of your meal.
                Our advanced AI system analyzes the image and provides detailed
                nutritional information, including calories, macronutrients, and
                more.
              </p>
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-3xl font-semibold text-center mb-8">
              Key Features
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="inline-block p-3 bg-primary/10 rounded-full mb-4">
                  <Heart className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Health Focused</h3>
                <p className="text-gray-600 text-sm">
                  Make informed decisions about your nutrition
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="inline-block p-3 bg-primary/10 rounded-full mb-4">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Instant Results</h3>
                <p className="text-gray-600 text-sm">
                  Get nutritional information in seconds
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="inline-block p-3 bg-primary/10 rounded-full mb-4">
                  <Leaf className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Personalized</h3>
                <p className="text-gray-600 text-sm">
                  Track your daily nutrition goals
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="inline-block p-3 bg-primary/10 rounded-full mb-4">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Privacy First</h3>
                <p className="text-gray-600 text-sm">
                  Your data is secure and protected
                </p>
              </div>
            </div>
          </section>

          <section className="text-center">
            <h2 className="text-3xl font-semibold mb-6">Ready to Start?</h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of users who are making healthier food choices with
              Calorie Tracker.
            </p>
            <Button size="lg" className="font-Serif mx-[12px] my-0 px-[40px] py-[20px] text-xl text-slate-50 rounded">JOIN COMMUNITY</Button>
          </section>
        </div>
      </main>
    </div>;
};
export default About;