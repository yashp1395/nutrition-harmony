
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Edit2 } from "lucide-react";

interface ManualEntryFormProps {
  onAddFood: (foodName: string) => void;
}

const ManualEntryForm = ({ onAddFood }: ManualEntryFormProps) => {
  const [manualEntry, setManualEntry] = useState("");

  const handleSubmit = () => {
    if (manualEntry.trim()) {
      onAddFood(manualEntry);
      setManualEntry("");
    }
  };

  return (
    <div className="flex gap-2">
      <Input
        placeholder="Manually add a food item..."
        value={manualEntry}
        onChange={(e) => setManualEntry(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
      />
      <Button onClick={handleSubmit}>
        <Edit2 className="w-4 h-4 mr-2" />
        Add
      </Button>
    </div>
  );
};

export default ManualEntryForm;
