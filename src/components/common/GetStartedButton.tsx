
import { Button } from "@/components/ui/button";
import { useState } from "react";
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
  const navigate = useNavigate();

  const handleGetStarted = () => {
    setShowDialog(true);
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
      
      // Simple coupon validation
      if (couponCode.toLowerCase() === "pbl2025") {
        // Update the user's premium status in the database
        const { error } = await supabase
          .from('profiles')
          .update({ is_premium: true })
          .eq('id', session.user.id);
          
        if (error) {
          throw error;
        }
        
        toast.success("Premium features unlocked successfully!");
        navigate("/profile");
      } else {
        toast.error("Invalid coupon code. Please try again.");
      }
    } catch (error) {
      console.error("Error updating premium status:", error);
      toast.error("Failed to process your request. Please try again.");
    } finally {
      setIsSubmitting(false);
      setShowDialog(false);
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
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Unlock Premium Features</DialogTitle>
            <DialogDescription>
              Get access to all premium features including Daily Goals, Nutrition Distribution, and Today's Meals tracking.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="coupon">Coupon Code</Label>
              <Input
                id="coupon"
                placeholder="Enter your coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
              />
            </div>
            <div className="bg-primary/10 p-3 rounded-md">
              <h4 className="font-medium flex items-center">
                <Sparkles className="w-4 h-4 mr-2" /> Premium Benefits
              </h4>
              <ul className="text-sm mt-2 space-y-1">
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
              className="mt-2 sm:mt-0"
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
