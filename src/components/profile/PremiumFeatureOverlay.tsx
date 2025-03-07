
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
  onUnlock: () => void;
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

  const handleCouponSubmit = () => {
    setIsSubmitting(true);
    
    // Simple coupon validation
    if (couponCode.toLowerCase() === "pbl2025") {
      setTimeout(() => {
        setIsSubmitting(false);
        setShowDialog(false);
        onUnlock();
        toast.success("Premium features unlocked successfully!");
      }, 1000);
    } else {
      setTimeout(() => {
        setIsSubmitting(false);
        toast.error("Invalid coupon code. Please try again.");
      }, 1000);
    }
  };

  return (
    <>
      <div className="relative">
        <div className="absolute inset-0 backdrop-blur-md bg-gray-900/30 z-10 flex flex-col items-center justify-center">
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
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Unlock Premium Features</DialogTitle>
            <DialogDescription>
              Get access to premium features including Daily Goals, Nutrition Distribution, and Today's Meals tracking.
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
              <h4 className="font-medium flex items-center"><Unlock className="w-4 h-4 mr-2" /> Premium Benefits</h4>
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

export default PremiumFeatureOverlay;
