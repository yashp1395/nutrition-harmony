
import { Button } from "@/components/ui/button";
import { Lock, Unlock } from "lucide-react";
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

interface PremiumFeatureOverlayProps {
  children: React.ReactNode;
  title: string;
  isPremium: boolean;
  onUnlock: () => Promise<boolean>;
}

const PremiumFeatureOverlay = ({
  children,
  title,
  isPremium,
  onUnlock,
}: PremiumFeatureOverlayProps) => {
  const [showDialog, setShowDialog] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isPremium) {
    return <>{children}</>;
  }

  const handleCouponSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Debug log
      console.log("PremiumFeatureOverlay - Entered coupon code:", couponCode, "Comparing with:", "pbl2025");
      
      // Simple coupon validation with trim to remove whitespace
      if (couponCode.trim().toLowerCase() === "pbl2025") {
        const success = await onUnlock();
        
        if (success) {
          setShowDialog(false);
          toast.success("Premium features unlocked successfully!");
        } else {
          toast.error("Failed to unlock premium features. Please try again.");
        }
      } else {
        toast.error("Invalid coupon code. Please try again.");
      }
    } catch (error) {
      console.error("Error processing coupon:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="relative">
        <div className="absolute inset-0 backdrop-blur-md bg-gray-900/30 dark:bg-gray-900/50 z-10 flex flex-col items-center justify-center">
          <Lock className="w-8 h-8 text-white mb-2" />
          <p className="text-white font-medium text-lg">{title}</p>
          <p className="text-white/80 text-sm mb-4">Premium Feature</p>
          <Button 
            onClick={() => setShowDialog(true)}
            className="bg-gradient-to-r from-green-500 to-primary hover:from-green-600 hover:to-primary/90"
          >
            Unlock Now
          </Button>
        </div>
        <div className="filter blur-sm pointer-events-none">
          {children}
        </div>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[425px] dark:bg-gray-800 dark:text-white">
          <DialogHeader>
            <DialogTitle className="dark:text-white">Unlock Premium Features</DialogTitle>
            <DialogDescription className="dark:text-gray-300">
              Get access to premium features including Daily Goals, Nutrition Distribution, and Today's Meals tracking.
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
              <h4 className="font-medium flex items-center dark:text-white"><Unlock className="w-4 h-4 mr-2" /> Premium Benefits</h4>
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

export default PremiumFeatureOverlay;
