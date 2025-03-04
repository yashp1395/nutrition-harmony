import { useState, useRef } from "react";
import Navbar from "../components/Navbar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload as UploadIcon, Image, AlertCircle, Edit2, Camera } from "lucide-react";
import { analyzeImage } from "../utils/visionApi";
import { getFoodItems } from "../lib/supabase";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import type { FoodItem } from "../types/database.types";

interface DetectedFood {
  name: string;
  confidence: number;
  nutrition?: FoodItem;
  isManualEntry?: boolean;
}

const Upload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [detectedFoods, setDetectedFoods] = useState<DetectedFood[]>([]);
  const [manualEntry, setManualEntry] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const { toast } = useToast();
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  const processFile = (selectedFile: File) => {
    setFile(selectedFile);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget === dropZoneRef.current) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith('image/')) {
      processFile(droppedFile);
    } else {
      toast({
        variant: "destructive",
        title: "Invalid file",
        description: "Please drop an image file.",
      });
    }
  };

  const startCamera = async () => {
    setShowCamera(true);
    
    try {
      // Request camera access with proper constraints
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });
      
      if (videoRef.current) {
        // Store stream reference for cleanup
        streamRef.current = stream;
        videoRef.current.srcObject = stream;
        
        // Wait for video to be loaded before playing
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play().catch(err => {
              console.error("Error playing video:", err);
              toast({
                variant: "destructive",
                title: "Camera Error",
                description: "Could not start video stream. Please try again.",
              });
            });
          }
        };
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        variant: "destructive",
        title: "Camera Error",
        description: "Could not access your camera. Please check permissions and ensure no other app is using your camera.",
      });
      setShowCamera(false);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Camera not initialized properly.",
      });
      return;
    }
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Make sure video is playing and has dimensions
    if (!video.videoWidth || !video.videoHeight) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Video stream not ready yet. Please wait a moment.",
      });
      return;
    }
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw current video frame to canvas
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert canvas to file
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
          processFile(file);
          
          // Stop camera stream
          stopCamera();
          
          toast({
            title: "Photo Captured",
            description: "Successfully captured photo from camera.",
          });
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to create image from camera.",
          });
        }
      }, 'image/jpeg', 0.95);
    }
  };
  
  const stopCamera = () => {
    // Use the stored stream reference to properly stop all tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setShowCamera(false);
  };

  // Cleanup camera when component unmounts
  React.useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const matchFoodWithDatabase = async (foodName: string) => {
    try {
      const items = await getFoodItems(foodName);
      return items.length > 0 ? items[0] : null;
    } catch (error) {
      console.error('Error matching food:', error);
      return null;
    }
  };

  const handleUpload = async () => {
    if (!file || !preview) return;

    setAnalyzing(true);
    setProgress(0);
    setDetectedFoods([]);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      // Analyze image using Google Vision API
      const visionResult = await analyzeImage(preview);
      
      // Process detected objects and labels
      const detectedItems = new Set<string>();
      
      // Add objects
      visionResult.responses[0].localizedObjectAnnotations?.forEach((obj: any) => {
        detectedItems.add(obj.name.toLowerCase());
      });
      
      // Add labels
      visionResult.responses[0].labelAnnotations?.forEach((label: any) => {
        if (label.description.toLowerCase().includes('food') || 
            label.description.toLowerCase().includes('dish') ||
            label.description.toLowerCase().includes('meal')) {
          detectedItems.add(label.description.toLowerCase());
        }
      });

      // Match with database and set nutrition info
      const foodPromises = Array.from(detectedItems).map(async (item) => {
        const nutrition = await matchFoodWithDatabase(item);
        return {
          name: item,
          confidence: 0.8, // Example confidence score
          nutrition,
        };
      });

      const foods = await Promise.all(foodPromises);
      setDetectedFoods(foods.filter(food => food.nutrition)); // Only keep foods found in database

      clearInterval(progressInterval);
      setProgress(100);
      
      toast({
        title: "Analysis Complete",
        description: `Detected ${foods.length} food items`,
      });
    } catch (error) {
      console.error('Error analyzing image:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to analyze image. Please try again.",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleManualAdd = async () => {
    if (!manualEntry.trim()) return;

    const nutrition = await matchFoodWithDatabase(manualEntry);
    if (nutrition) {
      setDetectedFoods([...detectedFoods, {
        name: manualEntry,
        confidence: 1,
        nutrition,
        isManualEntry: true
      }]);
      setManualEntry("");
      toast({
        title: "Food Added",
        description: `${manualEntry} has been added to the list`,
      });
    } else {
      toast({
        variant: "destructive",
        title: "Food Not Found",
        description: "This food item was not found in our database",
      });
    }
  };

  const removeFood = (index: number) => {
    setDetectedFoods(prev => prev.filter((_, i) => i !== index));
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
                <div className="relative">
                  <div className="rounded-lg overflow-hidden border border-gray-300">
                    <video 
                      ref={videoRef} 
                      className="w-full h-auto"
                      playsInline
                      autoPlay
                      muted
                    ></video>
                  </div>
                  <canvas ref={canvasRef} className="hidden"></canvas>
                  <div className="mt-4 flex justify-center gap-4">
                    <Button onClick={capturePhoto} variant="default">
                      <Camera className="w-4 h-4 mr-2" />
                      Capture Photo
                    </Button>
                    <Button variant="outline" onClick={stopCamera}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : !preview ? (
                <div
                  ref={dropZoneRef}
                  className={`border-2 ${isDragging ? 'border-primary border-dashed bg-primary/5' : 'border-dashed border-gray-300'} rounded-lg p-8`}
                  onDragEnter={handleDragEnter}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="flex flex-col items-center justify-center gap-4">
                    <Image className="w-12 h-12 text-gray-400" />
                    <div className="text-center">
                      <p className="text-gray-600">
                        Drag and drop your food image here, or
                      </p>
                      <div className="mt-4 flex flex-wrap justify-center gap-3">
                        <label className="inline-block">
                          <input
                            ref={fileInputRef}
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileChange}
                          />
                          <Button variant="outline" type="button" className="cursor-pointer">
                            <UploadIcon className="w-4 h-4 mr-2" />
                            Browse Files
                          </Button>
                        </label>
                        
                        <Button 
                          variant="outline" 
                          type="button"
                          onClick={startCamera}
                        >
                          <Camera className="w-4 h-4 mr-2" />
                          Take Photo
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full rounded-lg object-cover max-h-[400px]"
                  />
                  <div className="flex gap-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setFile(null);
                        setPreview(null);
                        setDetectedFoods([]);
                      }}
                    >
                      Remove
                    </Button>
                    <Button onClick={handleUpload} disabled={analyzing}>
                      <UploadIcon className="w-4 h-4 mr-2" />
                      {analyzing ? "Analyzing..." : "Analyze Image"}
                    </Button>
                  </div>
                </div>
              )}

              {analyzing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Analyzing image...</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
              )}

              {detectedFoods.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Detected Foods</h2>
                  <div className="space-y-3">
                    {detectedFoods.map((food, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{food.name}</p>
                          <p className="text-sm text-gray-600">
                            Calories: {food.nutrition?.calories} kcal | 
                            Protein: {food.nutrition?.protein}g | 
                            Carbs: {food.nutrition?.carbs}g | 
                            Fat: {food.nutrition?.fat}g
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFood(index)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 p-4 bg-primary/10 rounded-lg">
                    <h3 className="font-semibold mb-2">Total Nutrition</h3>
                    <p>
                      Calories: {detectedFoods.reduce((sum, food) => sum + (food.nutrition?.calories || 0), 0)} kcal |
                      Protein: {detectedFoods.reduce((sum, food) => sum + (food.nutrition?.protein || 0), 0)}g |
                      Carbs: {detectedFoods.reduce((sum, food) => sum + (food.nutrition?.carbs || 0), 0)}g |
                      Fat: {detectedFoods.reduce((sum, food) => sum + (food.nutrition?.fat || 0), 0)}g
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Input
                  placeholder="Manually add a food item..."
                  value={manualEntry}
                  onChange={(e) => setManualEntry(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleManualAdd()}
                />
                <Button onClick={handleManualAdd}>
                  <Edit2 className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </div>

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
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Upload;
