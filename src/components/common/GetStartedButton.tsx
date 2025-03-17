
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
import { Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

const GetStartedButton = () => {
  const [showDialog, setShowDialog] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
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
        className="bg-gradient-to-r from-green-500 to-primary hover:from-green-600 hover:to-primary/90 px-6 py-2 h-auto text-base font-medium shadow-lg hover:shadow-xl transition-all"
      >
        <Sparkles className="w-4 h-4 mr-2" />
        Get Started Now
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[425px] dark:bg-gray-800 dark:text-white">
          <DialogHeader>
            <DialogTitle className="dark:text-white">Unlock Premium Features</DialogTitle>
            <DialogDescription className="dark:text-gray-300">
              Get access to all premium features including Daily Goals, Nutrition Distribution, and Today's Meals tracking.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="coupon" className="dark:text-gray-200">Coupon Code</Label>
              <Input
                id="coupon"
                placeholder="Enter your coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
            </div>
            <div className="bg-primary/10 dark:bg-primary/5 p-3 rounded-md">
              <h4 className="font-medium flex items-center dark:text-white">
                <Sparkles className="w-4 h-4 mr-2" /> Premium Benefits
              </h4>
              <ul className="text-sm mt-2 space-y-1 dark:text-gray-300">
                <li>• Track your daily nutrition goals</li>
                <li>• View detailed nutrition distribution</li>
                <li>• Log and monitor your meals</li>
                <li>• Get personalized recommendations</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              onClick={handleCouponSubmit}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-green-500 to-primary hover:from-green-600 hover:to-primary/90"
            >
              {isSubmitting ? "Verifying..." : "Unlock Premium"}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowDialog(false)}
              className="mt-2 sm:mt-0 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
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
