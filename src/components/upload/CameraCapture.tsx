
import { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onCancel: () => void;
}

const CameraCapture = ({ onCapture, onCancel }: CameraCaptureProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    startCamera();
    
    // Cleanup camera when component unmounts
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
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
      onCancel();
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
          onCapture(file);
          
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

  return (
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
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default CameraCapture;
