'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Home() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
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
      
      // Instead of polling, directly use the viewer URL if available
      if (data.viewerUrl) {
        setModelUrl(data.viewerUrl);
      }
    } catch (error) {
      console.error('Detailed error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const renderUploadSection = (onSubmit: (e: React.FormEvent) => Promise<void>) => (
    <form onSubmit={onSubmit} className="space-y-6">
      <div 
        {...getRootProps()} 
        className={`p-8 border-2 border-dashed rounded-lg text-center cursor-pointer
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
      >
        <input {...getInputProps()} />
        <p className="text-gray-600">
          {isDragActive
            ? "Drop the image here..."
            : "Drag & drop an image here, or click to select"}
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Upload a single image for 3D generation
        </p>
      </div>

      {files.length > 0 && (
        <div className="mt-4">
          <h3 className="font-medium mb-2">Selected File</h3>
          <p className="text-sm text-gray-600">{files[0]?.name}</p>
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
        
        <div className="p-4 bg-white rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Quick 3D Generation</h2>
          <p className="text-gray-600 mb-4">
            Upload a single image to generate a quick 3D model.
          </p>
          {renderUploadSection(handleCSMSubmit)}
          
          {modelUrl && (
            <div className="mt-6">
              <h3 className="font-medium mb-2">Your 3D Model</h3>
              <iframe
                src={modelUrl}
                className="w-full h-[400px] border rounded-lg"
                title="3D Model Viewer"
              />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}