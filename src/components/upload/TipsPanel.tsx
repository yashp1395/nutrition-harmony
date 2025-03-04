
import { AlertCircle } from "lucide-react";

const TipsPanel = () => {
  return (
    <div className="bg-blue-50 p-4 rounded-lg">
      <div className="flex gap-2">
        <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
        <div className="text-sm text-blue-700">
          <p className="font-medium">Tips for best results:</p>
          <ul className="list-disc ml-4 mt-1">
            <li>Ensure good lighting</li>
            <li>Center the food in the frame</li>
            <li>Take the photo from above</li>
            <li>Include the entire portion</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TipsPanel;
