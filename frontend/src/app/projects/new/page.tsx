'use client';
import Link from "next/link";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { uploadFile, sendMessage, initiateChat } from "../../api/chatbotService";
import type { FileUploadResponse, ChatResponse } from "../../api/chatbotService";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

type UploadStatus = 'pending' | 'uploading' | 'completed' | 'failed';

interface UploadItem {
  id: string;
  file: File;
  progress: number;
  status: UploadStatus;
  error?: string;
}

export default function NewProjectUploadPage() {
  const [showBounce, setShowBounce] = useState(false);
  const [uploadItems, setUploadItems] = useState<UploadItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const activeUploads = useRef<{ [key: string]: boolean }>({});

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => file.size <= 10 * 1024 * 1024);
    
    if (validFiles.length === 0) {
      setError("No valid files selected (max 10MB each)");
      return;
    }

    setError(null);
    setShowBounce(true);
    
    // Create new upload items for each valid file
    const newItems: UploadItem[] = validFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file: file,
      progress: 0,
      status: 'pending'
    }));

    setUploadItems(prev => [...prev, ...newItems]);

    setTimeout(() => {
      setShowBounce(false);
    }, 2000);

    // Reset the input value to allow uploading the same files again
    e.target.value = '';
  };

  const handleRemoveFile = (id: string) => {
    if (activeUploads.current[id]) {
      delete activeUploads.current[id];
    }
    setUploadItems(prev => prev.filter(item => item.id !== id));
    setError(null);
  };

  const handleGenerateHypotheses = async () => {
    if (!uploadItems.length) return;
    setLoading(true);
    try {
      const supabase = createClientComponentClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        throw new Error("User not authenticated");
      }

      const chatResponse = await initiateChat(session.user.id);
      console.error('Chat initiation response:', chatResponse);
      const paperId = chatResponse.paper_id;
      if (!paperId) {
        throw new Error('No paper_id received from chat initiation');
      }

      setUploadItems(current => 
        current.map(item => ({
          ...item,
          status: 'uploading',
          progress: 0
        }))
      );

      const uploadResults = await Promise.all(
        uploadItems.map(async (item) => {
          try {
            const response = await uploadFile(item.file, session.user.id, paperId);
            console.error('File upload response:', response);
            return {
              id: item.id,
              status: 'completed' as UploadStatus,
              progress: 100,
              file_id: response.file_id
            };
          } catch (error) {
            console.error(`Error uploading ${item.file.name}:`, error);
            return {
              id: item.id,
              status: 'failed' as UploadStatus,
              error: error instanceof Error ? error.message : 'Upload failed'
            };
          }
        })
      );

      console.error('All upload results:', uploadResults);

      const allSuccessful = uploadResults.every(result => result.status === 'completed');
      if (!allSuccessful) {
        throw new Error('Some files failed to upload');
      }

      console.error('Sending begin message...');
      const beginResponse: ChatResponse = await sendMessage(session.user.id, "begin", paperId);
      console.error('Begin message response:', beginResponse);

      const responseText = beginResponse.response;
      const sections = responseText.split(/(?=#|##|###)/);
      const processedContent = sections.map(section => {
        const lines = section.trim().split('\n');
        const header = lines[0].replace(/^#+\s*/, '').trim();
        const content = lines.slice(1).join('\n').trim();
        return { header, content };
      }).filter(section => section.content);

      localStorage.setItem('processedContent', JSON.stringify(processedContent));
      localStorage.setItem('currentPaperId', paperId);

      setUploadItems(current => 
        current.map(item => {
          const result = uploadResults.find(r => r.id === item.id);
          return result ? { ...item, ...result } : item;
        })
      );

      router.push(`/projects/${paperId}`);
    } catch (error) {
      console.error('Error in handleGenerateHypotheses:', error);
      setUploadItems(current => 
        current.map(item => ({
          ...item,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Failed to process files'
        }))
      );
      setError('Failed to process files. Please try again.');
    } finally {
      // Keep the loader visible for 3 seconds before hiding
      setTimeout(() => setLoading(false), 3000);
    }
  };

  const getStatusColor = (status: UploadStatus) => {
    switch (status) {
      case 'pending': return 'bg-gray-400';
      case 'uploading': return 'bg-blue-300';
      case 'completed': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-200';
    }
  };

  const getStatusText = (status: UploadStatus) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'uploading': return 'Uploading...';
      case 'completed': return 'Completed';
      case 'failed': return 'Failed';
      default: return 'Unknown';
    }
  };

  const areAllUploadsComplete = uploadItems.length > 0 && uploadItems.every(item => item.status === 'pending');
  const hasFailedUploads = uploadItems.some(item => item.status === 'failed');

  // Loader component for the overlay
  function Loader() {
    return (
      <>
        <figure className="loader">
          <div className="dot white"></div>
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
        </figure>
        <style jsx>{`
          .loader {
            width: 6.250em;
            height: 6.250em;
            animation: rotate5123 2.4s linear infinite, fadeInOut 2.4s linear infinite;
            position: relative;
          }
          .white {
            top: 0;
            bottom: 0;
            left: 0;
            right: 0;
            background: white;
            animation: flash 2.4s linear infinite;
            opacity: 0;
          }
          .dot {
            position: absolute;
            margin: auto;
            width: 2.4em;
            height: 2.4em;
            border-radius: 100%;
            transition: all 1s ease;
          }
          .dot:nth-child(2) {
            top: 0;
            bottom: 0;
            left: 0;
            background: #FF4444;
            animation: dotsY 2.4s linear infinite;
          }
          .dot:nth-child(3) {
            top: 0;
            left: 0;
            right: 0;
            background: #FFBB33;
            animation: dotsX 2.4s linear infinite;
          }
          .dot:nth-child(4) {
            top: 0;
            bottom: 0;
            right: 0;
            background: #99CC00;
            animation: dotsY 2.4s linear infinite;
          }
          .dot:nth-child(5) {
            left: 0;
            right: 0;
            bottom: 0;
            background: #33B5E5;
            animation: dotsX 2.4s linear infinite;
          }
          @keyframes rotate5123 {
            0% { transform: rotate(0); }
            10% { width: 6.250em; height: 6.250em; }
            66% { width: 2.4em; height: 2.4em; }
            100% { transform: rotate(360deg); width: 6.250em; height: 6.250em; }
          }
          @keyframes fadeInOut {
            0% { opacity: 0; }
            25% { opacity: 1; }
            75% { opacity: 1; }
            100% { opacity: 0; }
          }
          @keyframes dotsY {
            66% { opacity: 0.1; width: 2.4em; }
            77% { opacity: 1; width: 0; }
          }
          @keyframes dotsX {
            66% { opacity: 0.1; height: 2.4em; }
            77% { opacity: 1; height: 0; }
          }
          @keyframes flash {
            33% { opacity: 0; border-radius: 0%; }
            55% { opacity: 0.6; border-radius: 100%; }
            66% { opacity: 0; }
          }
        `}</style>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-3xl mx-auto">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Upload Research Data
          </h2>
          <p className="mt-3 text-xl text-gray-500 sm:mt-4">
            Upload your research data files to generate hypotheses
          </p>
        </div>

        <div className="mt-8">
          <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center">
            <p className="text-lg font-semibold text-gray-900 mb-2">
              ⬆ Upload Data to Generate Paper
            </p>
            <label className="block text-sm text-gray-700 mb-2">
              Upload Data File
            </label>

            <input
              type="file"
              accept=".csv,.xlsx,.json"
              onChange={handleFileChange}
              className="hidden"
              id="upload"
            />

            <label
              htmlFor="upload"
              className="border border-gray-300 rounded-md p-6 cursor-pointer hover:bg-gray-50 flex flex-col items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-gray-500 mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v12m0 0l-4-4m4 4l4-4M4 16v1a1 1 0 001 1h14a1 1 0 001-1v-1"
                />
              </svg>
              <p className="text-sm text-gray-700 font-medium">
                Click to upload
              </p>
              <p className="text-gray-500">or drag and drop</p>
              <p className="text-xs text-gray-500 mt-1">
                CSV, XLSX, or JSON (max 10MB)
              </p>
            </label>

            {error && (
              <div className="mt-4 text-sm text-red-600">
                {error}
              </div>
            )}
          </div>

          {uploadItems.length > 0 && (
            <div className="mt-8 space-y-4">
              {uploadItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {item.file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(item.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex-1 w-32">
                        <div className="h-2 bg-gray-200 rounded-full">
                          <div
                            className={`h-2 rounded-full ${getStatusColor(item.status)} transition-all duration-300`}
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {getStatusText(item.status)}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoveFile(item.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                  {item.error && (
                    <p className="mt-2 text-sm text-red-600">
                      {item.error}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {uploadItems.length > 0 && (
            <div className="mt-8 flex justify-center">
              <button
                onClick={handleGenerateHypotheses}
                disabled={hasFailedUploads || !areAllUploadsComplete}
                className={`px-6 py-3 rounded-md text-white font-medium
                  ${hasFailedUploads || !areAllUploadsComplete
                    ? 'bg-blue-300 cursor-not-allowed'
                    : 'bg-blue-400 hover:bg-blue-500'
                  } transition-colors duration-200`}
              >
                Generate Hypotheses
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
          <Loader />
        </div>
      )}
    </div>
  );
}
