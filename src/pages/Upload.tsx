import { useState } from "react";
import Navbar from "../components/Navbar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload as UploadIcon, Image, AlertCircle } from "lucide-react";

const Upload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setAnalyzing(true);
    setProgress(0);

    // Simulate upload and analysis progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      setProgress(i);
    }

    // Simulate completion
    setTimeout(() => {
      setAnalyzing(false);
      console.log("Upload complete");
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h1 className="text-2xl font-semibold mb-6">Upload Food Image</h1>

            <div className="space-y-6">
              {!preview ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
                  <div className="flex flex-col items-center justify-center gap-4">
                    <Image className="w-12 h-12 text-gray-400" />
                    <div className="text-center">
                      <p className="text-gray-600">
                        Drag and drop your food image here, or
                      </p>
                      <label className="mt-2 inline-block">
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleFileChange}
                        />
                        <span className="text-primary hover:text-primary/80 cursor-pointer">
                          browse to upload
                        </span>
                      </label>
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