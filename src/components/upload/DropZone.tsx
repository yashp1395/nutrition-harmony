
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload as UploadIcon, Image, Camera } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface DropZoneProps {
  onFileSelect: (file: File) => void;
  onStartCamera: () => void;
}

const DropZone = ({ onFileSelect, onStartCamera }: DropZoneProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type.startsWith('image/')) {
        onFileSelect(selectedFile);
      } else {
        toast({
          variant: "destructive",
          title: "Invalid file",
          description: "Please select an image file.",
        });
      }
    }
  };

  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
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
      onFileSelect(droppedFile);
    } else {
      toast({
        variant: "destructive",
        title: "Invalid file",
        description: "Please drop an image file.",
      });
    }
  };

  return (
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
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
            <Button 
              variant="outline" 
              type="button" 
              className="cursor-pointer"
              onClick={handleBrowseClick}
            >
              <UploadIcon className="w-4 h-4 mr-2" />
              Browse Files
            </Button>
            
            <Button 
              variant="outline" 
              type="button"
              onClick={onStartCamera}
            >
              <Camera className="w-4 h-4 mr-2" />
              Take Photo
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DropZone;
