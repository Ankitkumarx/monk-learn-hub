import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Play, CheckCircle, Lock, Video } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { useToast } from '../ui/use-toast';
import ReactPlayer from 'react-player/youtube';
import { Tooltip } from '@/components/ui/tooltip';
import { API_BASE_URL } from '../../lib/api';
import { Document, Page, pdfjs } from 'react-pdf';
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface VideoItem {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
}

interface MaterialItem {
  id: string;
  name: string;
  dataUrl: string;
}

interface Module {
  id: string;
  title: string;
  description: string;
  videos: VideoItem[];
  materials: MaterialItem[];
}

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  modules: Module[];
  status: 'active' | 'draft' | 'pending';
}

export const CoursePage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const [selectedModuleIndex, setSelectedModuleIndex] = useState(0);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [watchedVideos, setWatchedVideos] = useState<string[]>([]);
  const [nextVideo, setNextVideo] = useState<VideoItem | null>(null);
  const [nextModuleIndex, setNextModuleIndex] = useState<number | null>(null);
  const { toast } = useToast();
  const [expandedModules, setExpandedModules] = useState<{ [moduleId: string]: boolean }>({});
  const [selectedLecture, setSelectedLecture] = useState<{ moduleIdx: number; videoIdx?: number; materialIdx?: number } | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const playerRef = useRef(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  const { data: course, isLoading, isError } = useQuery<Course>({
    queryKey: ['course', courseId],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/courses/${courseId}`);
      if (!res.ok) throw new Error('Failed to fetch course');
      return res.json();
    },
    enabled: !!courseId && !!user,
  });

  const { data: progress } = useQuery<{ watched: string[] }>({
    queryKey: ['progress', user?.id, courseId],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/progress/${user?.id}/${courseId}`);
      if (!res.ok) throw new Error('Failed to fetch progress');
      return res.json();
    },
    enabled: !!user?.id && !!courseId,
  });

  useEffect(() => {
    if (progress?.watched) {
      setWatchedVideos(progress.watched);
    }
  }, [progress]);

  useEffect(() => {
    if (course?.modules && course.modules.length > 0) {
      const firstModule = course.modules[0];
      if (firstModule.videos.length > 0) {
        setSelectedLecture({ moduleIdx: 0, videoIdx: 0 });
        setExpandedModules({ [firstModule.id]: true });
      } else if (firstModule.materials.length > 0) {
        setSelectedLecture({ moduleIdx: 0, materialIdx: 0 });
        setExpandedModules({ [firstModule.id]: true });
      }
    }
  }, [course]);

  useEffect(() => {
    if (!course || !selectedVideo) {
      setNextVideo(null);
      setNextModuleIndex(null);
      return;
    }
    const currentModule = course.modules[selectedModuleIndex];
    const currentVideoIdx = currentModule.videos.findIndex(v => v.id === selectedVideo.id);
    // Next video in same module
    if (currentVideoIdx < currentModule.videos.length - 1) {
      setNextVideo(currentModule.videos[currentVideoIdx + 1]);
      setNextModuleIndex(selectedModuleIndex);
    } else {
      // Next module's first video
      if (selectedModuleIndex < course.modules.length - 1) {
        const nextModule = course.modules[selectedModuleIndex + 1];
        if (nextModule.videos.length > 0) {
          setNextVideo(nextModule.videos[0]);
          setNextModuleIndex(selectedModuleIndex + 1);
          return;
        }
      }
      setNextVideo(null);
      setNextModuleIndex(null);
    }
  }, [course, selectedVideo, selectedModuleIndex]);

  const handleLectureSelect = (moduleIdx: number, videoIdx?: number, materialIdx?: number) => {
    setSelectedLecture({ moduleIdx, videoIdx, materialIdx });
    setSelectedModuleIndex(moduleIdx);
    if (videoIdx !== undefined) {
      setSelectedVideo(course!.modules[moduleIdx].videos[videoIdx]);
    } else if (materialIdx !== undefined) {
      setSelectedVideo(null); // For PDF, you may want to show a PDF preview instead
    }
  };

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  const handleVideoComplete = async (videoId: string) => {
    if (!user?.id || !courseId) return;
    try {
      await fetch(`${API_BASE_URL}/progress/${user.id}/${courseId}/${videoId}`, { method: 'POST' });
      setWatchedVideos(prev => [...prev, videoId]);
      // Auto-advance logic
      if (nextVideo && nextModuleIndex !== null) {
        setSelectedModuleIndex(nextModuleIndex);
        setSelectedVideo(nextVideo);
      } else {
        toast({ title: 'Course Completed!', description: 'You have finished all videos in this course.' });
      }
    } catch (error) {
      console.error('Failed to mark video as complete:', error);
    }
  };

  const totalVideos = course?.modules.reduce((sum, m) => sum + m.videos.length, 0) || 0;
  const progressPercentage = totalVideos > 0 ? Math.round((watchedVideos.length / totalVideos) * 100) : 0;

  // Helper to get selected material
  const selectedMaterial = selectedLecture && selectedLecture.materialIdx !== undefined && course
    ? course.modules[selectedLecture.moduleIdx].materials[selectedLecture.materialIdx]
    : null;

  const handlePlayPause = () => setIsPlaying(p => !p);

  const handleForward = () => {
    if (playerRef.current) {
      const current = playerRef.current.getCurrentTime();
      playerRef.current.seekTo(current + 10, 'seconds');
    }
  };

  const handleBackward = () => {
    if (playerRef.current) {
      const current = playerRef.current.getCurrentTime();
      playerRef.current.seekTo(Math.max(0, current - 10), 'seconds');
    }
  };

  if (authLoading) {
    return <div className="p-8 text-center">Loading authentication...</div>;
  }

  if (isLoading) {
    return <div className="p-8 text-center">Loading course...</div>;
  }

  if (isError || !course) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-600 mb-4">Failed to load course</div>
        <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
      </div>
    );
  }

  if (course.status !== 'active') {
    return (
      <div className="p-8 text-center">
        <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-600 mb-2">Course Not Available</h2>
        <p className="text-gray-500 mb-4">This course is not currently available for viewing.</p>
        <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-800 dark:text-white">{course.title}</h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">{course.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                {progressPercentage}% Complete
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full lg:w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 p-4 overflow-y-auto max-h-[80vh] rounded-lg shadow-md">
            <div className="text-lg font-bold mb-4">Course Content</div>
            {course?.modules.map((module, mIdx) => (
              <div key={module.id} className="mb-4">
                <button
                  className="flex items-center w-full justify-between py-2 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 font-semibold text-left"
                  onClick={() => toggleModule(module.id)}
                >
                  <span>{module.title || `Module ${mIdx + 1}`}</span>
                  <span>{expandedModules[module.id] ? '▼' : '►'}</span>
                </button>
                {expandedModules[module.id] && (
                  <div className="pl-4 mt-2 space-y-1">
                    {/* Videos */}
                    {module.videos.map((video, vIdx) => (
                      <div
                        key={video.id}
                        className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-all ${selectedLecture?.moduleIdx === mIdx && selectedLecture?.videoIdx === vIdx ? 'bg-blue-100 dark:bg-blue-800 font-semibold' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                        onClick={() => handleLectureSelect(mIdx, vIdx)}
                      >
                        <Video className="w-4 h-4 text-blue-600" />
                        <span className="flex-1 truncate">{video.title}</span>
                        {/* Placeholder for duration */}
                        <span className="text-xs text-gray-400 ml-2">--:--</span>
                        {/* Completion indicator */}
                        {watchedVideos.includes(video.id) && <CheckCircle className="w-4 h-4 text-green-500" />}
                      </div>
                    ))}
                    {/* Materials */}
                    {module.materials.map((mat, matIdx) => (
                      <div
                        key={mat.id}
                        className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-all ${selectedLecture?.moduleIdx === mIdx && selectedLecture?.materialIdx === matIdx ? 'bg-purple-100 dark:bg-purple-800 font-semibold' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                        onClick={() => handleLectureSelect(mIdx, undefined, matIdx)}
                      >
                        <span className="inline-block w-4 h-4 text-purple-600"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg></span>
                        <span className="flex-1 truncate">{mat.name}</span>
                        <Button size="sm" variant="outline" className="ml-2" onClick={e => { e.stopPropagation(); window.open(mat.dataUrl, '_blank'); }}>Resources</Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </aside>
          {/* Main player area remains as is for now */}
          <div className="flex-1">
            <Card className="border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="w-5 h-5 text-blue-600" />
                  {selectedVideo?.title || 'Select a video to start learning'}
                </CardTitle>
                {selectedVideo && (
                  <CardDescription>{selectedVideo.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                {selectedVideo ? (
                  <div className="space-y-4">
                    <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
                      <ReactPlayer
                        ref={playerRef}
                        url={selectedVideo.videoUrl}
                        width="100%"
                        height="100%"
                        playing={isPlaying}
                        controls={false}
                        config={{
                          playerVars: {
                            controls: 0,
                            disablekb: 1,
                            modestbranding: 1,
                            rel: 0,
                            fs: 0,
                            showinfo: 0,
                          }
                        }}
                        onEnded={() => handleVideoComplete(selectedVideo.id)}
                        style={{ pointerEvents: 'none' }}
                      />
                      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex items-center gap-6">
                        {/* Backward 10s */}
                        <button
                          onClick={handleBackward}
                          className="bg-black/60 backdrop-blur-md rounded-full p-4 shadow-lg transition-transform duration-150 hover:scale-110 active:scale-95 focus:outline-none border border-white/20"
                          style={{ pointerEvents: 'auto' }}
                          aria-label="Backward 10 seconds"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-white drop-shadow">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                            <text x="6" y="22" fontSize="8" fill="white">10</text>
                          </svg>
                        </button>
                        {/* Play/Pause */}
                        <button
                          onClick={handlePlayPause}
                          className="bg-black/60 backdrop-blur-md rounded-full p-5 shadow-lg transition-transform duration-150 hover:scale-110 active:scale-95 focus:outline-none border border-white/20"
                          style={{ pointerEvents: 'auto' }}
                          aria-label={isPlaying ? 'Pause' : 'Play'}
                        >
                          {isPlaying ? (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-white drop-shadow">
                              <rect x="6" y="5" width="4" height="14" rx="1" />
                              <rect x="14" y="5" width="4" height="14" rx="1" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-white drop-shadow">
                              <polygon points="6,4 20,12 6,20" />
                            </svg>
                          )}
                        </button>
                        {/* Forward 10s */}
                        <button
                          onClick={handleForward}
                          className="bg-black/60 backdrop-blur-md rounded-full p-4 shadow-lg transition-transform duration-150 hover:scale-110 active:scale-95 focus:outline-none border border-white/20"
                          style={{ pointerEvents: 'auto' }}
                          aria-label="Forward 10 seconds"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-white drop-shadow">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            <text x="14" y="22" fontSize="8" fill="white">10</text>
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        Video ID: {selectedVideo.id}
                      </span>
                      {watchedVideos.includes(selectedVideo.id) ? (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Completed
                        </Badge>
                      ) : null}
                    </div>
                    {/* Up Next UI */}
                    {nextVideo && (
                      <div className="mt-4 flex items-center gap-4 bg-gray-50 dark:bg-gray-700 p-3 rounded shadow-sm border border-gray-200 dark:border-gray-600">
                        <img src={nextVideo.thumbnailUrl} alt={nextVideo.title} className="w-20 h-12 object-cover rounded" />
                        <div className="flex-1">
                          <div className="text-xs text-gray-500">Up Next</div>
                          <div className="font-medium text-gray-800 dark:text-white">{nextVideo.title}</div>
                          <div className="text-xs text-gray-500 line-clamp-1">{nextVideo.description}</div>
                        </div>
                        <Button onClick={() => { setSelectedModuleIndex(nextModuleIndex!); setSelectedVideo(nextVideo); }}>
                          Play Next
                        </Button>
                      </div>
                    )}
                  </div>
                ) : selectedMaterial ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-8">
                    <h2 className="text-xl font-bold mb-2">{selectedMaterial.name}</h2>
                    <div className="w-full max-w-2xl h-[500px] border rounded shadow mb-4 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                      <Document file={selectedMaterial.dataUrl} loading={<span>Loading PDF...</span>} error={<span>Failed to load PDF.</span>}>
                        <Page pageNumber={1} width={700} />
                      </Document>
                    </div>
                    <a
                      href={selectedMaterial.dataUrl}
                      download={selectedMaterial.name}
                      className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Download PDF
                    </a>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center p-8">
                    <span className="text-lg font-semibold mb-2 flex items-center gap-2"><Video className="w-5 h-5 text-blue-400" /> Select a video to start learning</span>
                    <span className="text-gray-400">No video selected</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}; 