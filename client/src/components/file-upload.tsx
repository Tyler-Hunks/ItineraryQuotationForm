import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, File, X, CheckCircle, FileText, Download } from "lucide-react";

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
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  // Clear file input when value becomes null (form reset)
  useEffect(() => {
    if (value === null && fileInputRef.current) {
      fileInputRef.current.value = '';
      setError(null); // Also clear any error state
    }
  }, [value]);

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
    setIsProcessing(true);
    
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      setIsProcessing(false);
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
    } finally {
      setIsProcessing(false);
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
    event.stopPropagation();
    
    setDragOver(false);
    setDragActive(false);
    dragCounter.current = 0;
    
    const file = event.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDragEnter = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    dragCounter.current++;
    
    if (event.dataTransfer.items && event.dataTransfer.items.length > 0) {
      setDragActive(true);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    dragCounter.current--;
    
    if (dragCounter.current === 0) {
      setDragActive(false);
      setDragOver(false);
    }
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
          className={`border-2 border-dashed transition-all duration-300 cursor-pointer transform ${
            dragActive && dragOver 
              ? 'border-primary bg-primary/10 scale-105 shadow-lg' 
              : dragActive
              ? 'border-primary/50 bg-accent scale-102'
              : 'border-border hover:border-primary hover:bg-accent/50'
          } ${isProcessing ? 'pointer-events-none opacity-70' : ''}`}
          onDrop={handleDrop}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={openFileDialog}
        >
          <CardContent className="p-8 text-center">
            <div className="flex flex-col items-center space-y-3">
              <div className={`transition-all duration-300 ${dragActive && dragOver ? 'scale-110' : 'scale-100'}`}>
                {isProcessing ? (
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Upload className={`w-12 h-12 transition-colors duration-300 ${
                    dragActive && dragOver ? 'text-primary' : 'text-muted-foreground'
                  }`} />
                )}
              </div>
              <div className="text-card-foreground">
                <span className="font-medium">
                  {isProcessing ? 'Processing file...' : 'Click to upload'}
                </span>
                {!isProcessing && (
                  <span className={`transition-opacity duration-300 ${
                    dragActive ? 'opacity-0' : 'opacity-100'
                  }`}>
                    {' '}or drag and drop
                  </span>
                )}
              </div>
              {dragActive && dragOver && (
                <div className="text-primary font-medium animate-pulse">
                  Drop your file here!
                </div>
              )}
              <div className={`text-sm text-muted-foreground transition-opacity duration-300 ${
                dragActive ? 'opacity-50' : 'opacity-100'
              }`}>
                PDF, DOC, DOCX up to {maxSize ? formatFileSize(maxSize) : 'unlimited'}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-accent border-primary/30 animate-in slide-in-from-bottom-2 duration-300" data-testid="display-file-info">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full animate-pulse"></div>
                <CheckCircle className="w-6 h-6 text-primary relative z-10" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                  <div className="text-sm font-medium text-accent-foreground truncate" data-testid="text-file-name">
                    {value.filename}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mt-1" data-testid="text-file-size">
                  {formatFileSize(value.size)} • {value.type || 'Unknown type'}
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    // Create a simple preview/download functionality
                    const link = document.createElement('a');
                    link.href = `data:${value.type};base64,${value.data}`;
                    link.download = value.filename;
                    link.click();
                  }}
                  className="text-primary hover:text-primary/80"
                  title="Download file"
                >
                  <Download className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={removeFile}
                  className="text-destructive hover:text-destructive/80"
                  data-testid="button-remove-file"
                  title="Remove file"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
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
