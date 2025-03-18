
import { Button } from "@/components/ui/button";
import { Upload as UploadIcon, Loader2, Search, Camera } from "lucide-react";

interface ImagePreviewProps {
  preview: string;
  analyzing: boolean;
  onRemove: () => void;
  onAnalyze: () => void;
}

const ImagePreview = ({ preview, analyzing, onRemove, onAnalyze }: ImagePreviewProps) => {
  return (
    <div className="space-y-4">
      <div className="relative rounded-lg overflow-hidden border border-gray-200">
        <img
          src={preview}
          alt="Preview"
          className={`w-full object-cover max-h-[400px] ${analyzing ? 'opacity-70' : ''}`}
        />
        {analyzing && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <div className="bg-white/90 rounded-lg p-4 shadow-lg flex flex-col items-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
              <p className="text-sm text-gray-500 font-medium">Analyzing image...</p>
              {/* <p className="text-xs text-gray-500 mt-1">Using Gemini AI for food detection</p> */}
            </div>
          </div>
        )}
      </div>
      <div className="flex gap-4">
        <Button
          variant="outline"
          onClick={onRemove}
          disabled={analyzing}
          className="flex-1"
        >
          Remove
        </Button>
        <Button 
          onClick={onAnalyze} 
          disabled={analyzing}
          className="flex-1 bg-green-600 hover:bg-green-700"
        >
          {analyzing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Search className="w-4 h-4 mr-2" />
              Identify Foods
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ImagePreview;
