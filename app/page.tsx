'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Home() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>('idle');
  const [error, setError] = useState<string | null>(null);
  const [modelUrl, setModelUrl] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(acceptedFiles);
    setError(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png']
    },
    minSize: 0,
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: true
  });

  const handleCSMSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!files.length) return;
  
    setLoading(true);
    setError(null);
  
    try {
      const formData = new FormData();
      formData.append('file', files[0]);
  
      const res = await fetch('/api/csm-render', {
        method: 'POST',
        body: formData,
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || `Server error: ${res.status}`);
      }
      
      if (data.modelId) {
        setStatus('processing');
        pollModelStatus(data.modelId);
      } else {
        throw new Error('No model ID received from server');
      }
    } catch (error) {
      console.error('Detailed error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!files.length) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });

    try {
      const res = await fetch('/api/render', {
        method: 'POST',
        body: formData,
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to process images');
      }
      
      if (data.projectId) {
        setStatus('processing');
        pollStatus(data.projectId);
      }
    } catch (error) {
      console.error(error);
      setError(error instanceof Error ? error.message : 'An error occurred');
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const pollStatus = async (id: string) => {
    const checkStatus = async () => {
      try {
        const res = await fetch(`/api/status/${id}`);
        const data = await res.json();
        
        setStatus(data.status);
        
        if (data.status === 'processing') {
          setTimeout(checkStatus, 5000);
        }
      } catch (error) {
        console.error(error);
        setStatus('error');
        setError('Failed to check processing status');
      }
    };

    checkStatus();
  };

  const pollModelStatus = async (id: string) => {
    const checkStatus = async () => {
      try {
        const res = await fetch(`/api/csm-status/${id}`);
        const data = await res.json();
        
        setStatus(data.status);
        if (data.viewerUrl) {
          setModelUrl(data.viewerUrl);
        }
        
        if (data.status === 'processing') {
          setTimeout(checkStatus, 5000);
        }
      } catch (error) {
        console.error(error);
        setStatus('error');
        setError('Failed to check processing status');
      }
    };

    checkStatus();
  };

  const renderUploadSection = (onSubmit: (e: React.FormEvent) => Promise<void>, isCSM: boolean) => (
    <form onSubmit={onSubmit} className="space-y-6">
      <div 
        {...getRootProps()} 
        className={`p-8 border-2 border-dashed rounded-lg text-center cursor-pointer
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
      >
        <input {...getInputProps()} />
        <p className="text-gray-600">
          {isDragActive
            ? "Drop the images here..."
            : "Drag & drop images here, or click to select"}
        </p>
        <p className="text-sm text-gray-500 mt-2">
          {isCSM 
            ? "Upload a single image for quick 3D generation" 
            : "Minimum 20 images recommended, maximum 50 images allowed"}
        </p>
      </div>

      {files.length > 0 && (
        <div className="mt-4">
          <h3 className="font-medium mb-2">Selected Files ({files.length})</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            {files.map((file, index) => (
              <li key={index}>{file.name}</li>
            ))}
          </ul>
        </div>
      )}
      
      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      
      <button
        type="submit"
        disabled={loading || !files.length}
        className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg
          hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed
          transition-colors duration-200"
      >
        {loading ? 'Processing...' : 'Generate 3D Model'}
      </button>
    </form>
  );

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">3D Model Generator</h1>
        
        <Tabs defaultValue="csm" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="csm">Quick 3D (CSM.ai)</TabsTrigger>
            <TabsTrigger value="custom">Custom 3D Model</TabsTrigger>
          </TabsList>
          
          <TabsContent value="csm">
            <div className="p-4 bg-white rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Quick 3D Generation</h2>
              <p className="text-gray-600 mb-4">
                Upload a single image to generate a quick 3D model using CSM.ai technology.
              </p>
              {renderUploadSection(handleCSMSubmit, true)}
              
              {modelUrl && status === 'completed' && (
                <div className="mt-6">
                  <h3 className="font-medium mb-2">Your 3D Model</h3>
                  <iframe
                    src={modelUrl}
                    className="w-full h-[400px] border rounded-lg"
                    title="CSM.ai 3D Model Viewer"
                  />
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="custom">
            <div className="p-4 bg-white rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Custom 3D Model</h2>
              <p className="text-gray-600 mb-4">
                Upload multiple images (20-50 recommended) for detailed 3D model generation.
              </p>
              {renderUploadSection(handleCustomSubmit, false)}
              
              {status !== 'idle' && (
                <div className="mt-8 p-6 border rounded-lg bg-white">
                  <h2 className="text-xl font-semibold mb-3">Status</h2>
                  <div className="space-y-2">
                    {status === 'processing' && (
                      <>
                        <p className="text-amber-600">
                          Processing your images... This may take 30-60 minutes.
                        </p>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500 animate-progress"></div>
                        </div>
                      </>
                    )}
                    {status === 'completed' && (
                      <p className="text-green-600">
                        Your 3D model is ready! Check the output directory.
                      </p>
                    )}
                    {status === 'error' && (
                      <p className="text-red-600">
                        An error occurred while processing your images.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}

