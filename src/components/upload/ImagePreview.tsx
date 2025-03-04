
import { Button } from "@/components/ui/button";
import { Upload as UploadIcon } from "lucide-react";

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
        >
          Remove
        </Button>
        <Button onClick={onAnalyze} disabled={analyzing}>
          <UploadIcon className="w-4 h-4 mr-2" />
          {analyzing ? "Analyzing..." : "Analyze Image"}
        </Button>
      </div>
    </div>
  );
};

export default ImagePreview;
