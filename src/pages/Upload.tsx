
import { useState } from "react";
import Navbar from "../components/Navbar";
import { useToast } from "@/components/ui/use-toast";
import DropZone from "../components/upload/DropZone";
import CameraCapture from "../components/upload/CameraCapture";
import ImagePreview from "../components/upload/ImagePreview";
import AnalysisProgress from "../components/upload/AnalysisProgress";
import DetectedFoodsList from "../components/upload/DetectedFoodsList";
import ManualEntryForm from "../components/upload/ManualEntryForm";
import TipsPanel from "../components/upload/TipsPanel";
import { useFoodAnalysis } from "../hooks/useFoodAnalysis";

const Upload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const { toast } = useToast();
  const { 
    analyzing, 
    progress, 
    detectedFoods, 
    analyzeFood, 
    addManualFood, 
    removeFood 
  } = useFoodAnalysis();

  const processFile = (selectedFile: File) => {
    setFile(selectedFile);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const startCamera = () => {
    setShowCamera(true);
  };

  const handleCameraCapture = (capturedFile: File) => {
    processFile(capturedFile);
    setShowCamera(false);
  };

  const handleCameraCancel = () => {
    setShowCamera(false);
  };

  const handleRemoveImage = () => {
    setFile(null);
    setPreview(null);
  };

  const handleUpload = async () => {
    if (!file || !preview) return;
    await analyzeFood(preview);
  };

  const handleManualAdd = async (foodName: string) => {
    await addManualFood(foodName);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h1 className="text-2xl font-semibold mb-6">Upload Food Image</h1>

            <div className="space-y-6">
              {showCamera ? (
                <CameraCapture 
                  onCapture={handleCameraCapture} 
                  onCancel={handleCameraCancel} 
                />
              ) : !preview ? (
                <DropZone 
                  onFileSelect={processFile} 
                  onStartCamera={startCamera} 
                />
              ) : (
                <ImagePreview 
                  preview={preview} 
                  analyzing={analyzing} 
                  onRemove={handleRemoveImage} 
                  onAnalyze={handleUpload} 
                />
              )}

              {analyzing && <AnalysisProgress progress={progress} />}

              {/* Detected foods list now appears before the manual entry form and tips panel */}
              <DetectedFoodsList 
                detectedFoods={detectedFoods} 
                onRemoveFood={removeFood} 
              />

              <ManualEntryForm onAddFood={handleManualAdd} />

              <TipsPanel />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Upload;
