
import { Progress } from "@/components/ui/progress";

interface AnalysisProgressProps {
  progress: number;
}

const AnalysisProgress = ({ progress }: AnalysisProgressProps) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>Analyzing image...</span>
        <span>{progress}%</span>
      </div>
      <Progress value={progress} />
    </div>
  );
};

export default AnalysisProgress;
