"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Image as ImageIcon, 
  Download, 
  Play, 
  Pause, 
  Volume2, 
  File, 
  Eye,
  ZoomIn,
  Maximize2,
  X
} from "lucide-react";

interface EvidenceFile {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  storagePath?: string;
  path?: string;
  isLegacy?: boolean;
  uploadedAt?: string;
  uploadedBy?: { name: string };
  originalFile?: any;
}

interface EvidenceDisplayProps {
  evidenceDocuments: EvidenceFile[];
  onDownload?: (document: EvidenceFile) => void;
  className?: string;
}

export default function EvidenceDisplay({ 
  evidenceDocuments, 
  onDownload,
  className = "" 
}: EvidenceDisplayProps) {
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<EvidenceFile | null>(null);
  const [imageLoading, setImageLoading] = useState<{ [key: string]: boolean }>({});
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});

  const isImageFile = (fileName: string, fileType: string) => {
    const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/svg+xml'];
    return imageTypes.includes(fileType.toLowerCase()) || 
           /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(fileName);
  };

  const isAudioFile = (fileName: string, fileType: string) => {
    const audioTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a', 'audio/webm', 'audio/flac', 'audio/aac'];
    return audioTypes.includes(fileType.toLowerCase()) || 
           /\.(mp3|wav|ogg|m4a|webm|flac|aac)$/i.test(fileName);
  };

  const getFileUrl = (document: EvidenceFile) => {
    if (document.id && document.fileName) {
      if (document.storagePath && document.storagePath.startsWith('http')) {
        return document.storagePath;
      } else {
        return `/api/documents/${document.id}/download`;
      }
    } else if (document.path) {
      return document.path.startsWith('http') ? document.path : document.path;
    }
    return '#';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const openImageModal = (document: EvidenceFile) => {
    setSelectedImage(document);
    setImageModalOpen(true);
  };

  const closeImageModal = () => {
    setImageModalOpen(false);
    setSelectedImage(null);
  };

  const toggleAudioPlayback = (fileId: string, audioUrl: string) => {
    // Stop currently playing audio
    if (playingAudio && audioRefs.current[playingAudio]) {
      audioRefs.current[playingAudio].pause();
      audioRefs.current[playingAudio].currentTime = 0;
    }

    if (playingAudio === fileId) {
      setPlayingAudio(null);
    } else {
      setPlayingAudio(fileId);
      
      // Create or reuse audio element
      if (!audioRefs.current[fileId]) {
        audioRefs.current[fileId] = new Audio(audioUrl);
        audioRefs.current[fileId].addEventListener('ended', () => {
          setPlayingAudio(null);
        });
        audioRefs.current[fileId].addEventListener('error', () => {
          console.error('Audio playback error for:', fileId);
          setPlayingAudio(null);
        });
      }

      audioRefs.current[fileId].play().catch(error => {
        console.error('Audio play error:', error);
        setPlayingAudio(null);
      });
    }
  };

  const handleImageLoad = (documentId: string) => {
    setImageLoading(prev => ({ ...prev, [documentId]: false }));
  };

  const handleImageError = (documentId: string) => {
    setImageLoading(prev => ({ ...prev, [documentId]: false }));
  };

  // Cleanup audio elements on unmount
  useEffect(() => {
    return () => {
      Object.values(audioRefs.current).forEach(audio => {
        audio.pause();
        audio.src = '';
      });
    };
  }, []);

  if (evidenceDocuments.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <File className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Belum ada bukti yang dilampirkan</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Bukti yang Diupload</h3>
              <Badge variant="secondary">
                {evidenceDocuments.length} file
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {evidenceDocuments.map((document) => (
                <div 
                  key={document.id} 
                  className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
                >
                  <div className="space-y-3">
                    {/* File info */}
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white text-sm truncate" 
                           title={document.fileName}>
                        {document.fileName}
                      </div>
                      <div className="text-gray-500 dark:text-gray-400 text-xs">
                        {formatFileSize(document.fileSize)} • {document.fileType}
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <div className="text-gray-500 dark:text-gray-400">
                          {document.isLegacy ? 'File Legacy' : 
                           `Diupload: ${document.uploadedBy?.name || 'Unknown'}`}
                        </div>
                        {document.isLegacy && (
                          <Badge variant="outline" className="text-xs">
                            Legacy
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* File preview/content */}
                    <div className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                      {isImageFile(document.fileName, document.fileType) ? (
                        // Enhanced Image preview
                        <div className="relative group">
                          {imageLoading[document.id] !== false && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                            </div>
                          )}
                          <img 
                            src={getFileUrl(document)}
                            alt={document.fileName}
                            className="w-full h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                            onLoad={() => handleImageLoad(document.id)}
                            onError={() => handleImageError(document.id)}
                            onClick={() => openImageModal(document)}
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => openImageModal(document)}
                                className="backdrop-blur-sm"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => onDownload?.(document)}
                                className="backdrop-blur-sm"
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="absolute top-2 right-2">
                            <Badge variant="secondary" className="text-xs bg-black/50 text-white">
                              <ImageIcon className="w-3 h-3 mr-1" />
                              Image
                            </Badge>
                          </div>
                        </div>
                      ) : isAudioFile(document.fileName, document.fileType) ? (
                        // Enhanced Audio player
                        <div className="p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toggleAudioPlayback(document.id, getFileUrl(document))}
                              className="hover:bg-blue-50 hover:border-blue-300"
                            >
                              {playingAudio === document.id ? (
                                <Pause className="w-4 h-4" />
                              ) : (
                                <Play className="w-4 h-4" />
                              )}
                            </Button>
                            <Volume2 className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                              Voice Note
                            </span>
                          </div>
                          
                          {playingAudio === document.id && (
                            <div className="space-y-3">
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                                <div className="bg-blue-500 h-1 rounded-full animate-pulse" style={{ width: '100%' }}></div>
                              </div>
                              <audio 
                                controls 
                                className="w-full"
                                autoPlay
                                onEnded={() => setPlayingAudio(null)}
                                onError={() => {
                                  console.error('Audio element error for:', document.id);
                                  setPlayingAudio(null);
                                }}
                              >
                                <source src={getFileUrl(document)} type={document.fileType} />
                                Browser Anda tidak mendukung audio player.
                              </audio>
                            </div>
                          )}
                          
                          <div className="flex justify-between items-center mt-3">
                            <span className="text-xs text-gray-500">
                              {playingAudio === document.id ? 'Sedang diputar...' : 'Klik play untuk mendengar'}
                            </span>
                            <div className="flex gap-2">
                              {!document.isLegacy && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => onDownload?.(document)}
                                  className="hover:bg-green-50 hover:border-green-300"
                                >
                                  <Download className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        // Other file types
                        <div className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <File className="w-8 h-8 text-gray-500" />
                            <div>
                              <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                File Dokumen
                              </span>
                              <div className="text-xs text-gray-500">
                                {document.fileType}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {!document.isLegacy && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onDownload?.(document)}
                                className="hover:bg-blue-50 hover:border-blue-300"
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Image Modal */}
      {imageModalOpen && selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
          <div className="relative max-w-4xl max-h-full">
            <Button
              size="sm"
              variant="secondary"
              onClick={closeImageModal}
              className="absolute top-2 right-2 z-10 backdrop-blur-sm"
            >
              <X className="w-4 h-4" />
            </Button>
            <img
              src={getFileUrl(selectedImage)}
              alt={selectedImage.fileName}
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={closeImageModal}
            />
            <div className="absolute bottom-2 left-2 right-2 bg-black bg-opacity-50 text-white p-2 rounded backdrop-blur-sm">
              <div className="text-sm font-medium truncate">{selectedImage.fileName}</div>
              <div className="text-xs opacity-75">
                {formatFileSize(selectedImage.fileSize)} • {selectedImage.fileType}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}