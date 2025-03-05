
import { Button } from "@/components/ui/button";
import { Upload as UploadIcon, Loader2 } from "lucide-react";

interface ImagePreviewProps {
  preview: string;
  analyzing: boolean;
  onRemove: () => void;
  onAnalyze: () => void;
}

const ImagePreview = ({ preview, analyzing, onRemove, onAnalyze }: ImagePreviewProps) => {
  return (
    <div className="space-y-4">
      <img
        src={preview}
        alt="Preview"
        className="w-full rounded-lg object-cover max-h-[400px]"
      />
      <div className="flex gap-4">
        <Button
          variant="outline"
          onClick={onRemove}
          disabled={analyzing}
        >
          Remove
        </Button>
        <Button onClick={onAnalyze} disabled={analyzing}>
          {analyzing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <UploadIcon className="w-4 h-4 mr-2" />
              Analyze Image
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ImagePreview;
