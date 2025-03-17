
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Sparkles, Zap, Gift, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

const GetStartedButton = () => {
  const [showDialog, setShowDialog] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check premium status when component mounts
    checkPremiumStatus().then(status => setIsPremium(status));
  }, []);

  const checkPremiumStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log("No active session found");
        return false;
      }
      
      console.log("Checking premium status for user:", session.user.id);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('is_premium')
        .eq('id', session.user.id)
        .single();
        
      if (error) {
        console.error('Error checking premium status:', error);
        return false;
      }
      
      console.log("Premium status check result:", data);
      return data?.is_premium || false;
    } catch (error) {
      console.error('Error checking premium status:', error);
      return false;
    }
  };

  const handleGetStarted = async () => {
    // Check if user is authenticated first
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      // If not authenticated, redirect to auth page
      navigate("/auth");
      toast.info("Please sign in to continue");
      return;
    }
    
    // Check if the user is already premium
    const premium = await checkPremiumStatus();
    setIsPremium(premium);
    
    if (premium) {
      // If premium, redirect to profile page
      navigate("/profile");
      toast.success("You already have premium access!");
    } else {
      // If not premium, show the dialog
      setShowDialog(true);
    }
  };

  const handleCouponSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // Redirect to sign in if not authenticated
        toast.error("Please sign in to continue");
        navigate("/auth");
        setShowDialog(false);
        setIsSubmitting(false);
        return;
      }
      
      // Debug log to check coupon code
      const trimmedCode = couponCode.trim().toLowerCase();
      console.log("GetStartedButton - Entered coupon code:", trimmedCode, "Comparing with:", "pbl2025");
      
      // Simple coupon validation with trim() to remove whitespace
      if (trimmedCode === "pbl2025") {
        // Update the user's premium status in the database
        const { error } = await supabase
          .from('profiles')
          .update({ is_premium: true })
          .eq('id', session.user.id);
          
        if (error) {
          console.error("Error updating premium status:", error);
          throw error;
        }
        
        // Set local state
        setIsPremium(true);
        
        toast.success("Premium features unlocked successfully!");
        navigate("/profile");
        setShowDialog(false);
      } else {
        toast.error("Invalid coupon code. Please try again.");
      }
    } catch (error) {
      console.error("Error updating premium status:", error);
      toast.error("Failed to process your request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button 
        onClick={handleGetStarted}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`relative overflow-hidden bg-gradient-to-r from-green-500 to-primary hover:from-green-600 hover:to-primary/90 px-6 py-2 h-auto text-base font-medium shadow-lg hover:shadow-xl transition-all duration-300 ${isHovered ? 'scale-105' : ''}`}
      >
        <span className={`flex items-center transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''}`}>
          <Sparkles className={`w-4 h-4 mr-2 transition-all duration-300 ${isHovered ? 'rotate-12 scale-110' : ''}`} />
          Get Started Now
        </span>
        {isHovered && (
          <span className="absolute inset-0 bg-white/10 animate-pulse rounded-md"></span>
        )}
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[425px] dark:bg-gray-800/95 backdrop-blur-sm dark:text-white border dark:border-gray-700 shadow-xl transition-all duration-300 animate-fadeIn">
          <DialogHeader>
            <DialogTitle className="dark:text-white flex items-center">
              <Gift className="w-5 h-5 mr-2 text-primary" />
              Unlock Premium Features
            </DialogTitle>
            <DialogDescription className="dark:text-gray-300">
              Get access to all premium features including Daily Goals, Nutrition Distribution, and Today's Meals tracking.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-5 py-4">
            <div className="grid gap-2">
              <Label htmlFor="coupon" className="dark:text-gray-200 flex items-center">
                <Zap className="w-4 h-4 mr-2 text-yellow-500" />
                Coupon Code
              </Label>
              <Input
                id="coupon"
                placeholder="Enter your coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="dark:bg-gray-700/70 dark:text-white dark:border-gray-600 focus:ring-primary focus:border-primary transition-all"
              />
            </div>
            <div className="bg-primary/10 dark:bg-primary/5 p-4 rounded-md border border-primary/20 dark:border-primary/10">
              <h4 className="font-medium flex items-center dark:text-white">
                <Sparkles className="w-4 h-4 mr-2 text-primary" /> Premium Benefits
              </h4>
              <ul className="text-sm mt-3 space-y-2 dark:text-gray-300">
                <li className="flex items-start">
                  <Check className="w-4 h-4 mr-2 text-primary mt-0.5 flex-shrink-0" />
                  <span>Track your daily nutrition goals with detailed insights</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-4 h-4 mr-2 text-primary mt-0.5 flex-shrink-0" />
                  <span>View comprehensive nutrition distribution charts</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-4 h-4 mr-2 text-primary mt-0.5 flex-shrink-0" />
                  <span>Log and monitor your meals with intelligent tracking</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-4 h-4 mr-2 text-primary mt-0.5 flex-shrink-0" />
                  <span>Get personalized nutrition recommendations</span>
                </li>
              </ul>
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              type="submit"
              onClick={handleCouponSubmit}
              disabled={isSubmitting}
              className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-primary hover:from-green-600 hover:to-primary/90 transition-all duration-300"
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </span>
              ) : (
                <span className="flex items-center">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Unlock Premium
                </span>
              )}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowDialog(false)}
              className="w-full sm:w-auto dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GetStartedButton;
