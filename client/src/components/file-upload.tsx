import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, File, X, CheckCircle } from "lucide-react";

interface FileUploadProps {
  value: {
    filename: string;
    size: number;
    type: string;
    data: string;
  } | null;
  onChange: (file: {
    filename: string;
    size: number;
    type: string;
    data: string;
  } | null) => void;
  maxSize?: number;
  accept?: string;
  testId?: string;
}

export function FileUpload({ 
  value, 
  onChange, 
  maxSize = 10 * 1024 * 1024, 
  accept = ".pdf,.doc,.docx",
  testId 
}: FileUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File) => {
    const allowedTypes = accept.split(',').map(type => type.trim());
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!allowedTypes.includes(fileExtension)) {
      return 'Invalid file type. Please upload PDF, DOC, or DOCX files only.';
    }

    if (maxSize && file.size > maxSize) {
      return `File size exceeds ${formatFileSize(maxSize)} limit.`;
    }

    return null;
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleFile = async (file: File) => {
    setError(null);
    
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      const base64Data = await fileToBase64(file);
      onChange({
        filename: file.name,
        size: file.size,
        type: file.type,
        data: base64Data
      });
    } catch (err) {
      setError('Failed to process file');
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
    
    const file = event.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
  };

  const removeFile = () => {
    onChange(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        data-testid={testId}
      />

      {!value ? (
        <Card
          className={`border-2 border-dashed transition-colors duration-200 cursor-pointer ${
            dragOver 
              ? 'border-primary bg-accent' 
              : 'border-border hover:border-primary'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={openFileDialog}
        >
          <CardContent className="p-8 text-center">
            <div className="flex flex-col items-center space-y-2">
              <Upload className="w-12 h-12 text-muted-foreground" />
              <div className="text-card-foreground">
                <span className="font-medium">Click to upload</span> or drag and drop
              </div>
              <div className="text-sm text-muted-foreground">
                PDF, DOC, DOCX up to {maxSize ? formatFileSize(maxSize) : 'unlimited'}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-accent" data-testid="display-file-info">
          <CardContent className="p-3">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-primary" />
              <div className="flex-1">
                <div className="text-sm font-medium text-accent-foreground" data-testid="text-file-name">
                  {value.filename}
                </div>
                <div className="text-xs text-muted-foreground" data-testid="text-file-size">
                  {formatFileSize(value.size)}
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={removeFile}
                className="text-destructive hover:text-destructive/80"
                data-testid="button-remove-file"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <div className="text-destructive text-sm mt-1">
          {error}
        </div>
      )}
    </div>
  );
}
