
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Target } from "lucide-react";
import type { NutritionGoal } from "../../types/user.types";

interface EditGoalsDialogProps {
  goals: NutritionGoal[];
  onSave: (goals: NutritionGoal[]) => void;
}

const EditGoalsDialog = ({ goals, onSave }: EditGoalsDialogProps) => {
  const [editableGoals, setEditableGoals] = useState<NutritionGoal[]>(goals);
  const [open, setOpen] = useState(false);

  const handleChange = (id: string | undefined, target: number) => {
    if (!id) return;
    
    setEditableGoals(prev => 
      prev.map(goal => 
        goal.id === id ? { ...goal, target: Number(target) } : goal
      )
    );
  };

  const handleSave = () => {
    onSave(editableGoals);
    setOpen(false);
  };

  const handleOpen = (isOpen: boolean) => {
    if (isOpen) {
      setEditableGoals(goals);
    }
    setOpen(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="absolute top-5 right-5">
          <Target className="w-4 h-4 mr-1" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Daily Goals</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {editableGoals.map((goal) => (
            <div key={goal.id} className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor={`goal-${goal.id}`} className="col-span-1">
                {goal.name}
              </Label>
              <Input
                id={`goal-${goal.id}`}
                type="number"
                value={goal.target}
                onChange={(e) => handleChange(goal.id, parseInt(e.target.value))}
                className="col-span-2"
                min={0}
              />
              <span className="text-sm text-gray-500">{goal.unit}</span>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditGoalsDialog;
