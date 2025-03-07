
import { Button } from "@/components/ui/button";
import { Upload, Camera } from "lucide-react";
import { useNavigate } from "react-router-dom";

const UploadMealWidget = () => {
  const navigate = useNavigate();
  
  const goToUpload = () => {
    navigate('/upload');
  };
  
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm mb-6">
      <div className="text-center py-2">
        <h3 className="font-medium text-gray-800 mb-2">Add a meal with photo</h3>
        <p className="text-sm text-gray-500 mb-4">
          Upload a photo of your food to automatically track nutrition
        </p>
        <div className="flex justify-center gap-3">
          <Button onClick={goToUpload} className="gap-2">
            <Upload className="w-4 h-4" />
            Upload Food Photo
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UploadMealWidget;
